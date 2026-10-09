const assert = require("node:assert/strict");
const test = require("node:test");

const productQuerySchema = require("../src/validators/product.validator")
  .productQuerySchema;
const validateQuery = require("../src/middleware/validateQuery.middleware");
const prisma = require("../src/config/database");
const { getAllProducts } = require("../src/services/product.service");
const { getAdminPayments } = require("../src/services/admin.service");

function runValidation(query) {
  return new Promise((resolve) => {
    const req = { query };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        resolve({ req, res: this });
      },
    };

    validateQuery(productQuerySchema)(req, res, () => {
      resolve({ req, res, nextCalled: true });
    });
  });
}

test("product query validates storefront filters and applies defaults", async () => {
  const categoryId = "ef07fded-6b52-47ec-9d6b-c8b74c90f578";
  const { req, nextCalled } = await runValidation({
    categoryId,
    minPrice: "50",
    maxPrice: "500",
    isFeatured: "true",
    extra: "discarded",
  });

  assert.equal(nextCalled, true);
  assert.equal(req.validatedQuery.categoryId, categoryId);
  assert.equal(req.validatedQuery.minPrice, 50);
  assert.equal(req.validatedQuery.maxPrice, 500);
  assert.equal(req.validatedQuery.isFeatured, true);
  assert.equal(req.validatedQuery.page, 1);
  assert.equal(req.validatedQuery.limit, 10);
  assert.equal("extra" in req.validatedQuery, false);
});

test("product query rejects malformed filters", async () => {
  const { res, req, nextCalled } = await runValidation({
    categoryId: "not-a-uuid",
    limit: "1000",
  });

  assert.equal(nextCalled, undefined);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.equal(req.validatedQuery, undefined);
});

test("product listing maps validated filters to Prisma query options", async (t) => {
  const delegate = prisma.product;
  const originalFindMany = delegate.findMany;
  let options;
  delegate.findMany = async (queryOptions) => {
    options = queryOptions;
    return [];
  };
  t.after(() => {
    delegate.findMany = originalFindMany;
  });

  await getAllProducts({
    page: 2,
    limit: 8,
    search: "earbuds",
    categoryId: "category-id",
    minPrice: 20,
    maxPrice: 100,
    isFeatured: true,
    sortBy: "price",
    sortOrder: "asc",
  });

  assert.equal(options.skip, 8);
  assert.equal(options.take, 8);
  assert.equal(options.where.categoryId, "category-id");
  assert.equal(options.where.isFeatured, true);
  assert.deepEqual(options.where.price, { gte: 20, lte: 100 });
  assert.equal(options.where.OR.length, 3);
  assert.deepEqual(options.orderBy, { price: "asc" });
});

test("admin payment listing converts query pagination to bounded integers", async (t) => {
  const delegate = prisma.payment;
  const originalFindMany = delegate.findMany;
  const originalCount = delegate.count;
  let options;
  delegate.findMany = async (queryOptions) => {
    options = queryOptions;
    return [];
  };
  delegate.count = async () => 205;
  t.after(() => {
    delegate.findMany = originalFindMany;
    delegate.count = originalCount;
  });

  const result = await getAdminPayments({ page: "2", limit: "100" });

  assert.equal(options.skip, 100);
  assert.equal(options.take, 100);
  assert.equal(typeof options.take, "number");
  assert.deepEqual(result.pagination, {
    page: 2,
    limit: 100,
    total: 205,
    totalPages: 3,
  });
});
