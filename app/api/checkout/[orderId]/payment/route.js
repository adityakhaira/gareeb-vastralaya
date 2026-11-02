
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in." },
        { status: 401 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: params.orderId,
          userId: session.user.id,
        },
      });

      if (!order) {
        return { error: "NOT_FOUND" };
      }

      if (order.paymentStatus === "paid") {
        return { error: "ALREADY_PAID" };
      }

      if (order.paymentStatus === "cancelled") {
        return { error: "CANCELLED" };
      }

      const payment = await tx.payment.findFirst({
        where: { orderId: order.id },
        orderBy: { createdAt: "desc" },
      });

      if (!payment) {
        return { error: "PAYMENT_NOT_FOUND" };
      }

      if (payment.status !== "pending_verification") {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "pending_verification",
            verificationNote: "Customer reported that UPI payment was made. Awaiting manual verification.",
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "pending_verification" },
        });
      }

      return { success: true };
    });

    if (result.error) {
      const status = result.error === "NOT_FOUND" ? 404 : 409;
      const messages = {
        NOT_FOUND: "Order not found.",
        ALREADY_PAID: "This order is already marked as paid.",
        CANCELLED: "This order has been cancelled.",
        PAYMENT_NOT_FOUND: "Payment record not found.",
      };

      return NextResponse.json(
        { error: messages[result.error] },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment reported. It is now awaiting store verification.",
    });
  } catch (error) {
    console.error("Payment submission failed:", error);
    return NextResponse.json(
      { error: "Could not submit payment status." },
      { status: 500 }
    );
  }
}
