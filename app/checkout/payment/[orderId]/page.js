
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

export default function OrderPaymentPage() {
  const { orderId } = useParams();
  const { data: session, status } = useSession();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [qrMissing, setQrMissing] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && orderId) {
      loadOrder();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, orderId]);

  async function loadOrder() {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/checkout/${encodeURIComponent(orderId)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load your order.");
      }

      setOrder(data.order);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function reportPayment() {
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/checkout/${encodeURIComponent(orderId)}/payment`,
        { method: "POST" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not submit payment status.");
      }

      setMessage(data.message);
      await loadOrder();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function formatPrice(paise) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(paise / 100);
  }

  if (status === "loading" || loading) {
    return <main className="payment-page"><p>Loading your order...</p></main>;
  }

  if (!session?.user) {
    return (
      <main className="payment-page">
        <h1>Order payment</h1>
        <p>Sign in to view your order.</p>
        <button onClick={() => signIn("google")}>
          Sign in with Google
        </button>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="payment-page">
        <h1>Order payment</h1>
        <p role="alert">{message || "Order not found."}</p>
        <Link href="/account">Go to your account</Link>
      </main>
    );
  }

  const paymentReported =
    order.paymentStatus === "pending_verification";
  const isPaid = order.paymentStatus === "paid";
  const isCancelled = order.paymentStatus === "cancelled";

  return (
    <main className="payment-page">
      <div className="payment-card">
        <p className="payment-eyebrow">GAREEB VASTARLAYA</p>
        <h1>{isPaid ? "Payment confirmed" : "Pay using UPI"}</h1>

        <p className="payment-order-number">
          Order number: <strong>{order.orderNumber}</strong>
        </p>

        <div className="payment-total">
          <span>Order total</span>
          <strong>{formatPrice(order.totalPaise)}</strong>
        </div>

        <div className="payment-status" role="status">
          <strong>
            {isPaid
              ? "Payment verified"
              : isCancelled
              ? "Order cancelled"
              : paymentReported
              ? "Payment verification pending"
              : "Payment pending"}
          </strong>
          <p>
            {isPaid
              ? "Your payment has been confirmed by the store."
              : isCancelled
              ? "Please contact the store if you need assistance."
              : paymentReported
              ? "Your payment report has been received. The store must verify receipt before confirming payment."
              : "Scan the store's QR code and pay the exact amount shown above."}
          </p>
        </div>

        {!isPaid && !isCancelled && !paymentReported && (
          <>
            <div className="payment-qr">
              {qrMissing ? (
                <p>
                  QR image not found. Add your store QR at
                  {" "}public/upi-qr.png and refresh this page.
                </p>
              ) : (
                <img
                  src="/upi-qr.png"
                  alt="Gareeb Vastarlaya UPI payment QR code"
                  onError={() => setQrMissing(true)}
                />
              )}
            </div>

            <ol className="payment-instructions">
              <li>Open your UPI app, such as Google Pay, PhonePe, or BHIM.</li>
              <li>Scan the QR code shown above.</li>
              <li>Verify the recipient name and pay the exact order amount.</li>
              <li>Keep your UPI transaction reference for your records.</li>
              <li>After paying, return here and report your payment.</li>
            </ol>

            <button
              type="button"
              className="payment-report-button"
              onClick={reportPayment}
              disabled={submitting || qrMissing}
            >
              {submitting ? "Submitting..." : "I've made the payment"}
            </button>

            <p className="payment-small-note">
              This only notifies the store. It does not confirm payment
              automatically. Never pay if the recipient details don't match
              the store's verified UPI details.
            </p>
          </>
        )}

        {paymentReported && (
          <p className="payment-small-note">
            Keep your UPI transaction reference. The store will verify the
            transaction and update your order status.
          </p>
        )}

        {message && <p className="payment-message" role="status">{message}</p>}

        <div className="payment-links">
          <Link href="/account">My account</Link>
          <Link href="/cart">Continue shopping</Link>
        </div>
      </div>
    </main>
  );
}
