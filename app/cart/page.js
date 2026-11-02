
import CartClient from '@/components/cart/CartClient';

export const metadata = {
  title: 'Your Shopping Bag | Gareeb Vastarlaya',
  description:
    'Review your selected sarees and lehengas in your Gareeb Vastarlaya shopping bag.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartPage() {
  return (
    <div className="cart-page">
      <div className="container">
        <CartClient />
      </div>
    </div>
  );
}
