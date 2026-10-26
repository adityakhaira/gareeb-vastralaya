import { readOrderByReference } from '@/lib/store-data';

export default async function OrderSuccessPage({ params }) {
  const order = await readOrderByReference(params.orderReference);

  return (
    <div className="container section">
      <div className="info-box">
        <h1>Order confirmed</h1>
        {order ? (
          <>
            <p>Your order number is {order.orderNumber}</p>
            <p>Total: ₹{(order.totalPaise / 100).toFixed(2)}</p>
            <p>Payment status: {order.paymentStatus}</p>
          </>
        ) : (
          <p>We could not load the order details yet.</p>
        )}
      </div>
    </div>
  );
}
