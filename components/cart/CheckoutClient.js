
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

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

export default function CheckoutClient() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [items, setItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("gv-cart") || "[]");
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setItems([]);
      setError("Your cart could not be read. Please review your cart.");
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoadingAddresses(status === "loading");
      return;
    }

    let cancelled = false;

    async function loadAddresses() {
      setLoadingAddresses(true);
      setError("");

      try {
        const response = await fetch("/api/account/addresses");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load your addresses.");
        }

        if (cancelled) return;

        const saved = data.addresses || [];
        setAddresses(saved);

        const preferred = saved.find((address) => address.isDefault) || saved[0];
        setSelectedAddressId(preferred?.id || "");
        setAddingAddress(saved.length === 0);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoadingAddresses(false);
      }
    }

    loadAddresses();

    return () => {
      cancelled = true;
    };
  }, [status]);

  const totals = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          const price = Number(item.pricePaise);
          const quantity = Number(item.quantity);

          if (
            Number.isSafeInteger(price) &&
            price >= 0 &&
            Number.isSafeInteger(quantity) &&
            quantity > 0
          ) {
            acc.total += price * quantity;
          }

          return acc;
        },
        { total: 0 }
      ),
    [items]
  );

  function updateAddressField(event) {
    const { name, value, checked, type } = event.target;

    setAddressForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!session?.user) {
      setError("Please sign in before placing your order.");
      return;
    }

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    try {
      let addressId = selectedAddressId;

      // Save a new address first if the customer chose to add one.
      if (addingAddress) {
        const addressResponse = await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressForm),
        });

        const addressData = await addressResponse.json();

        if (!addressResponse.ok) {
          throw new Error(
            addressData.error || "Could not save the delivery address."
          );
        }

        addressId = addressData.address.id;
      }

      if (!addressId) {
        throw new Error("Please select or add a delivery address.");
      }

      // Send only SKU and quantity.
      // The server calculates prices using the database.
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId,
          items: items.map((item) => ({
            sku: item.sku,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create your order.");
      }

      if (!data.order?.id) {
        throw new Error("The server did not return an order ID.");
      }

      // Clear the cart only after the order is successfully created.
      localStorage.removeItem("gv-cart");
      window.dispatchEvent(new Event("gv-cart-updated"));

      router.push(
        `/checkout/payment/${encodeURIComponent(data.order.id)}`
      );
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") {
    return <div className="container section">Checking your account...</div>;
  }

  if (!session?.user) {
    return (
      <div className="container section">
        <h1>Checkout</h1>
        <p>Please sign in before continuing to checkout.</p>
        <button
          type="button"
          className="primary-button"
          onClick={() => signIn("google", { callbackUrl: "/checkout" })}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="page-title">
        <h1>Checkout</h1>
        <p>Select where you want your order delivered.</p>
      </div>

      {error && (
        <div className="info-box" role="alert">
          <p>{error}</p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="info-box">
          <p>Your cart is empty. Start with the collection.</p>
          <Link href="/sarees" className="primary-button">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="cart-grid">
          <section className="checkout-form">
            <h2>Delivery address</h2>

            {loadingAddresses ? (
              <p>Loading your saved addresses...</p>
            ) : (
              <>
                {addresses.length > 0 && (
                  <div className="form-grid">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className="saved-address-card"
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="radio"
                          name="deliveryAddress"
                          value={address.id}
                          checked={
                            !addingAddress &&
                            selectedAddressId === address.id
                          }
                          onChange={() => {
                            setSelectedAddressId(address.id);
                            setAddingAddress(false);
                          }}
                        />

                        <strong>
                          {address.label || "Address"}
                          {address.isDefault ? " · Default" : ""}
                        </strong>

                        <p>{address.recipientName}</p>
                        <p>{address.phone}</p>
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        {address.landmark && <p>{address.landmark}</p>}
                        <p>
                          {address.city}, {address.state} - {address.postalCode}
                        </p>
                      </label>
                    ))}
                  </div>
                )}

                <div style={{ margin: "18px 0" }}>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => {
                      setAddingAddress(true);
                      setAddressForm(emptyAddress);
                    }}
                  >
                    + Add a new address
                  </button>

                  {addresses.length > 0 && addingAddress && (
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => {
                        setAddingAddress(false);
                        setSelectedAddressId(addresses[0].id);
                      }}
                      style={{ marginLeft: 8 }}
                    >
                      Choose a saved address instead
                    </button>
                  )}
                </div>

                {addingAddress && (
                  <>
                    <h3>New delivery address</h3>

                    <div className="form-grid">
                      <label>
                        Address label
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
                          maxLength={100}
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
                        City *
                        <input
                          name="city"
                          value={addressForm.city}
                          onChange={updateAddressField}
                          required
                        />
                      </label>

                      <label style={{ gridColumn: "1 / -1" }}>
                        Address line 1 *
                        <input
                          name="addressLine1"
                          value={addressForm.addressLine1}
                          onChange={updateAddressField}
                          placeholder="House number, street, locality"
                          required
                        />
                      </label>

                      <label style={{ gridColumn: "1 / -1" }}>
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
                          value={addressForm.postalCode}
                          onChange={updateAddressField}
                          inputMode="numeric"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          required
                        />
                      </label>

                      <label
                        style={{
                          gridColumn: "1 / -1",
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={addressForm.isDefault}
                          onChange={updateAddressField}
                        />
                        Save as my default address
                      </label>
                    </div>
                  </>
                )}
              </>
            )}

            <hr style={{ margin: "24px 0" }} />

            <h2>Payment method</h2>
            <p>UPI payment using the store's QR code.</p>
            <p>
              After placing your order, you will see the QR code and the exact
              amount to pay.
            </p>

            <button
              className="primary-button"
              type="button"
              disabled={
                submitting ||
                loadingAddresses ||
                (addingAddress === false && !selectedAddressId)
              }
              onClick={handleSubmit}
            >
              {submitting ? "Creating order..." : "Place order"}
            </button>
          </section>

          <aside className="checkout-form">
            <h3>Order summary</h3>

            {items.map((item, index) => (
              <div key={`${item.sku}-${index}`}>
                <p>
                  {item.name} × {item.quantity}
                </p>
              </div>
            ))}

            <p>
              Estimated subtotal: ₹{(totals.total / 100).toFixed(2)}
            </p>
            <p>Shipping: ₹0.00</p>
            <p>
              <strong>
                Estimated total: ₹{(totals.total / 100).toFixed(2)}
              </strong>
            </p>
            <small>
              The final amount is calculated and verified by the server.
            </small>

            <div style={{ marginTop: 16 }}>
              <Link href="/cart" className="ghost-button">
                Back to cart
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
