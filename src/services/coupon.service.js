const prisma = require("../config/database");

const validateCoupon = async (code, orderAmount) => {
  const coupon = await prisma.coupon.findUnique({
    where: {
      code: code.toUpperCase(),
    },
  });

  if (!coupon) {
    throw new Error("Invalid coupon code");
  }

  if (!coupon.isActive) {
    throw new Error("This coupon is no longer active");
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new Error("This coupon has expired");
  }

  if (
    coupon.minimumAmount !== null &&
    Number(orderAmount) < Number(coupon.minimumAmount)
  ) {
    throw new Error(
      `Minimum order amount for this coupon is ₦${Number(
        coupon.minimumAmount
      ).toLocaleString()}`
    );
  }

  if (
    coupon.maximumUses !== null &&
    coupon.usedCount >= coupon.maximumUses
  ) {
    throw new Error("This coupon has reached its usage limit");
  }

  let discountAmount = 0;

  if (coupon.discountType === "PERCENTAGE") {
    discountAmount =
      (Number(orderAmount) * Number(coupon.discountValue)) / 100;
  } else if (coupon.discountType === "FIXED") {
    discountAmount = Number(coupon.discountValue);
  }

  // Discount should never be greater than the order amount
  if (discountAmount > Number(orderAmount)) {
    discountAmount = Number(orderAmount);
  }

  const totalAfterDiscount =
    Number(orderAmount) - discountAmount;

  return {
    couponId: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    originalAmount: Number(orderAmount),
    totalAfterDiscount,
  };
};

module.exports = {
  validateCoupon,
};