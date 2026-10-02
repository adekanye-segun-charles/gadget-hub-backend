const crypto = require("crypto");
const prisma = require("../config/database");

const processPaystackWebhook = async (rawBody, signature, event) => {
  if (!signature) {
    const error = new Error("Missing Paystack signature");
    error.statusCode = 401;
    throw error;
  }

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  if (hash !== signature) {
    const error = new Error("Invalid Paystack signature");
    error.statusCode = 401;
    throw error;
  }

  console.log("Paystack webhook received:", event.event);

  if (event.event !== "charge.success") {
    return {
      processed: false,
      message: `Webhook event ${event.event} received`,
    };
  }

  const transaction = event.data;
  const reference = transaction.reference;

  const payment = await prisma.payment.findUnique({
    where: {
      reference,
    },
  });

  if (!payment) {
    console.log(`Payment not found for reference: ${reference}`);

    return {
      processed: false,
      message: "Payment not found",
    };
  }

  if (payment.status === "SUCCESS") {
    console.log(`Payment ${reference} has already been processed`);

    return {
      processed: false,
      message: "Payment already processed",
    };
  }

  const expectedAmount = Math.round(Number(payment.amount) * 100);

  if (Number(transaction.amount) !== expectedAmount) {
    console.log(`Payment amount mismatch for reference: ${reference}`);

    return {
      processed: false,
      message: "Payment amount mismatch",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "SUCCESS",
        paidAt: transaction.paid_at
          ? new Date(transaction.paid_at)
          : new Date(),
        gatewayResponse: event,
      },
    });

    await tx.order.update({
      where: {
        id: payment.orderId,
      },
      data: {
        paymentStatus: "SUCCESS",
        status: "PROCESSING",
      },
    });
  });

  console.log(`Payment ${reference} successfully processed`);

  return {
    processed: true,
    message: "Payment successfully processed",
  };
};

module.exports = {
  processPaystackWebhook,
};