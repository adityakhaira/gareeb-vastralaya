
"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

const emptyAddress = {
  label: "Home",
  recipientName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  isDefault: false,
};

export default function CheckoutPage() {
  const { data: session, status } = useSession();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      loadCheckout();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  async function loadCheckout() {
    setLoading(true);
    setMessage("");

    try {
      const addressResponse = await fetch("/api/account/addresses");
      const addressData = await addressResponse.json();

      if (!addressResponse.ok) {
        throw new Error(
          addressData.error || "Could not load addresses."
        );
      }

      const savedAddresses = addressData.addresses || [];
      setAddresses(savedAddresses);

      const defaultAddress = savedAddresses.find(
        (address) => address.isDefault
      );

      setSelectedAddressId(
        defaultAddress?.id || savedAddresses[0]?.id || ""
      );

      // Use the same cart key as components/cart/CartClient.js.
      const storedCart = localStorage.getItem("gv-cart");
      const parsedCart = storedCart ? JSON.parse(storedCart) : [];

      setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
    } catch (error) {
      setMessage(error.message || "Could not load checkout.");
    } finally {
      setLoading(false);
    }
  }

  function updateAddressField(event) {
    const { name, value, type, checked } = event.target;

    setAddressForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function saveNewAddress(event) {
    event.preventDefault();
    setSavingAddress(true);
    setMessage("");

    try {
      const response = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save address.");
      }

      await loadCheckout();
      setSelectedAddressId(data.address.id);
      setShowAddressForm(false);
      setAddressForm({ ...emptyAddress });

      setMessage("Address saved successfully.");
    } catch (error) {
      setMessage(error.message || "Could not save address.");
    } finally {
      setSavingAddress(false);
    }
  }

  function formatPriceFromPaise(paise) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(paise / 100);
  }

  async function placeOrder() {
    if (!selectedAddressId) {
      setMessage("Please add or select a delivery address.");
      return;
    }

    if (!cartItems.length) {
      setMessage(
        "Your cart appears empty. Return to your cart and add products first."
      );
      return;
    }

    setPlacingOrder(true);
    setMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddressId,
          // The cart uses SKU identifiers, not necessarily database IDs.
          items: cartItems.map((item) => ({
            sku: item.sku,
            quantity: Number(item.quantity),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not place your order.");
      }

      // Clear the cart only after the server confirms order creation.
      localStorage.removeItem("gv-cart");
      window.dispatchEvent(new Event("gv-cart-updated"));

      window.location.href =
        `/checkout/payment/${encodeURIComponent(data.order.id)}`;
    } catch (error) {
      setMessage(error.message || "Could not place your order.");
    } finally {
      setPlacingOrder(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="checkout-page">
        <p>Loading checkout...</p>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="checkout-page">
        <h1>Checkout</h1>
        <p>Please sign in before continuing to checkout.</p>
        <button onClick={() => signIn("google")}>
          Sign in with Google
        </button>
      </main>
    );
  }

  // Prices in gv-cart are stored in paise.
  // This is only a display estimate; the server calculates the real total.
  const subtotalPaise = cartItems.reduce((sum, item) => {
    const pricePaise = Number(item.pricePaise || 0);
    const quantity = Number(item.quantity || 0);

    if (
      !Number.isFinite(pricePaise) ||
      !Number.isFinite(quantity) ||
      pricePaise < 0 ||
      quantity < 0
    ) {
      return sum;
    }

    return sum + pricePaise * quantity;
  }, 0);

  return (
    <main className="checkout-page">
      <div className="checkout-heading">
        <div>
          <p className="checkout-eyebrow">GAREEB VASTARLAYA</p>
          <h1>Checkout</h1>
          <p>Choose where you would like your order delivered.</p>
        </div>

        <Link href="/cart">Back to cart</Link>
      </div>

      {message && (
        <p className="checkout-message" role="status">
          {message}
        </p>
      )}

      <div className="checkout-layout">
        <section className="checkout-main">
          <div className="checkout-section-heading">
            <h2>1. Delivery address</h2>

            <button
              type="button"
              className="checkout-secondary"
              onClick={() => {
                setShowAddressForm((current) => !current);
                setMessage("");
              }}
            >
              {showAddressForm ? "Cancel" : "+ Add new address"}
            </button>
          </div>

          {addresses.length === 0 && !showAddressForm && (
            <p>
              You haven't saved an address yet. Add one to continue.
            </p>
          )}

          {addresses.map((address) => (
            <label
              key={address.id}
              className={`checkout-address ${
                selectedAddressId === address.id ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="deliveryAddress"
                value={address.id}
                checked={selectedAddressId === address.id}
                onChange={() => setSelectedAddressId(address.id)}
              />

              <div className="checkout-address-details">
                <div className="checkout-address-title">
                  <strong>{address.recipientName}</strong>
                  <span>{address.label}</span>

                  {address.isDefault && <span>Default</span>}
                </div>

                <p>{address.phone}</p>
                <p>{address.addressLine1}</p>

                {address.addressLine2 && <p>{address.addressLine2}</p>}
                {address.landmark && <p>{address.landmark}</p>}

                <p>
                  {address.city}, {address.state} - {address.postalCode}
                </p>

                {selectedAddressId === address.id && (
                  <span className="deliver-selected">
                    Deliver to this address
                  </span>
                )}
              </div>
            </label>
          ))}

          {showAddressForm && (
            <form
              className="checkout-address-form"
              onSubmit={saveNewAddress}
            >
              <h3>Add a delivery address</h3>

              <label>
                Label
                <select
                  name="label"
                  value={addressForm.label}
                  onChange={updateAddressField}
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Recipient name *
                <input
                  name="recipientName"
                  value={addressForm.recipientName}
                  onChange={updateAddressField}
                  required
                />
              </label>

              <label>
                Mobile number *
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  value={addressForm.phone}
                  onChange={updateAddressField}
                  required
                />
              </label>

              <label>
                Address line 1 *
                <input
                  name="addressLine1"
                  value={addressForm.addressLine1}
                  onChange={updateAddressField}
                  required
                />
              </label>

              <label>
                Address line 2
                <input
                  name="addressLine2"
                  value={addressForm.addressLine2}
                  onChange={updateAddressField}
                />
              </label>

              <label>
                Landmark
                <input
                  name="landmark"
                  value={addressForm.landmark}
                  onChange={updateAddressField}
                />
              </label>

              <label>
                City *
                <input
                  name="city"
                  value={addressForm.city}
                  onChange={updateAddressField}
                  required
                />
              </label>

              <label>
                State *
                <input
                  name="state"
                  value={addressForm.state}
                  onChange={updateAddressField}
                  required
                />
              </label>

              <label>
                PIN code *
                <input
                  name="postalCode"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={addressForm.postalCode}
                  onChange={updateAddressField}
                  required
                />
              </label>

              <label className="checkout-checkbox">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={addressForm.isDefault}
                  onChange={updateAddressField}
                />
                Save as my default address
              </label>

              <button type="submit" disabled={savingAddress}>
                {savingAddress ? "Saving..." : "Save address"}
              </button>
            </form>
          )}
        </section>

        <aside className="checkout-summary">
          <h2>2. Order summary</h2>

          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <p>
                {cartItems.length} item type(s) in your cart
              </p>

              {cartItems.map((item) => (
                <p key={item.sku}>
                  {item.name} × {item.quantity}
                  {" — "}
                  {formatPriceFromPaise(
                    Number(item.pricePaise || 0) *
                      Number(item.quantity || 0)
                  )}
                </p>
              ))}

              <p className="checkout-subtotal">
                Displayed subtotal:
                <strong>{formatPriceFromPaise(subtotalPaise)}</strong>
              </p>

              <p className="checkout-note">
                Final price and stock availability are verified securely
                when you place your order.
              </p>
            </>
          )}

          <button
            type="button"
            className="checkout-place-order"
            onClick={placeOrder}
            disabled={
              placingOrder ||
              !selectedAddressId ||
              cartItems.length === 0
            }
          >
            {placingOrder ? "Placing order..." : "Place order"}
          </button>

          <p className="checkout-note">
            After the order is created, you'll be directed to the UPI
            payment page. Payment remains pending until verified.
          </p>
        </aside>
      </div>
    </main>
  );
}
