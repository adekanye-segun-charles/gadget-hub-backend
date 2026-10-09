const prisma = require("../config/database");
const paystack = require("../config/paystack");

const generatePaymentReference = () => {
  return `GH-PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const callPaystack = async (request) => {
  try {
    return await request();
  } catch (cause) {
    if (cause.statusCode === 503) throw cause;

    const invalidKey = cause.response?.status === 401
      || cause.response?.data?.code === "invalid_Key";
    const error = new Error(invalidKey
      ? "Payments are temporarily unavailable because the Paystack secret key is missing or invalid. Please contact support."
      : "The payment provider could not be reached. Please try again shortly.");
    error.statusCode = invalidKey ? 503 : 502;
    error.cause = cause;
    throw error;
  }
};

const initializePayment = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      user: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === "CANCELLED") {
    throw new Error("Cancelled orders cannot be paid for");
  }

  if (order.paymentStatus === "SUCCESS") {
    throw new Error("This order has already been paid for");
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      orderId,
      status: "PENDING",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (existingPayment) {
    return {
      payment: existingPayment,
      authorizationUrl:
        existingPayment.gatewayResponse?.data?.authorization_url || null,
      reference: existingPayment.reference,
      message: "A pending payment already exists for this order",
    };
  }

  const reference = generatePaymentReference();

  const amountInKobo = Math.round(Number(order.totalAmount) * 100);

  const response = await callPaystack(() => paystack.post("/transaction/initialize", {
    email: order.user.email,
    amount: amountInKobo,
    currency: "NGN",
    reference,
    ...(process.env.PAYSTACK_CALLBACK_URL
      ? { callback_url: process.env.PAYSTACK_CALLBACK_URL }
      : {}),
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: userId,
    },
  }));

  if (!response.data.status) {
    throw new Error(
      response.data.message || "Payment initialization failed"
    );
  }

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      reference,
      amount: order.totalAmount,
      status: "PENDING",
      gateway: "PAYSTACK",
      gatewayResponse: response.data,
    },
  });

  return {
    payment,
    authorizationUrl: response.data.data.authorization_url,
    accessCode: response.data.data.access_code,
    reference: response.data.data.reference,
  };
};
const verifyPayment = async (userId, reference) => {
  const payment = await prisma.payment.findUnique({
    where: {
      reference,
    },
    include: {
      order: true,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.order.userId !== userId) {
    throw new Error("You are not authorized to verify this payment");
  }

  const response = await callPaystack(() => paystack.get(
    `/transaction/verify/${encodeURIComponent(reference)}`
  ));

  if (!response.data.status) {
    throw new Error(
      response.data.message || "Payment verification failed"
    );
  }

  const transaction = response.data.data;

  const expectedAmount = Math.round(Number(payment.amount) * 100);

  if (Number(transaction.amount) !== expectedAmount) {
    throw new Error("Payment amount does not match the order amount");
  }

  if (transaction.status === "success") {
    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "SUCCESS",
          paidAt: transaction.paid_at
            ? new Date(transaction.paid_at)
            : new Date(),

          // Keep the complete Paystack response in the database.
          gatewayResponse: response.data,
        },
      });

      const updatedOrder = await tx.order.update({
        where: {
          id: payment.orderId,
        },
        data: {
          paymentStatus: "SUCCESS",
          status: "PROCESSING",
        },
      });

      return {
        updatedPayment,
        updatedOrder,
      };
    });

    // Only return information the frontend actually needs.
    return {
      success: true,
      message: "Payment verified successfully",

      payment: {
        id: result.updatedPayment.id,
        reference: result.updatedPayment.reference,
        amount: Number(result.updatedPayment.amount),
        status: result.updatedPayment.status,
        gateway: result.updatedPayment.gateway,
        paidAt: result.updatedPayment.paidAt,
      },

      order: {
        id: result.updatedOrder.id,
        orderNumber: result.updatedOrder.orderNumber,
        totalAmount: Number(result.updatedOrder.totalAmount),
        paymentStatus: result.updatedOrder.paymentStatus,
        status: result.updatedOrder.status,
      },
    };
  }

  let paymentStatus = "PENDING";

  if (
    transaction.status === "failed" ||
    transaction.status === "abandoned"
  ) {
    paymentStatus = "FAILED";
  }

  await prisma.payment.update({
    where: {
      id: payment.id,
    },
    data: {
      status: paymentStatus,
      gatewayResponse: response.data,
    },
  });

  return {
    success: false,
    message: `Payment status: ${transaction.status}`,
    paymentStatus,
    reference: payment.reference,
  };
};

module.exports = {
  initializePayment,
  verifyPayment,
};