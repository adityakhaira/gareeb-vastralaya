
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function AddressesPage() {
  const { data: session, status } = useSession();

  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyAddress);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadAddresses() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/account/addresses");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load addresses.");
      }

      setAddresses(data.addresses || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      loadAddresses();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function startEditing(address) {
    setEditingId(address.id);
    setForm({
      label: address.label || "Home",
      recipientName: address.recipientName || "",
      phone: address.phone || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      isDefault: address.isDefault,
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyAddress);
    setMessage("");
  }

  async function submitAddress(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/account/addresses", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { ...form, id: editingId } : form
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save address.");
      }

      setForm(emptyAddress);
      setEditingId(null);
      await loadAddresses();
      setMessage(
        editingId
          ? "Address updated successfully."
          : "Address saved successfully."
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function makeDefault(address) {
    setMessage("");

    try {
      const response = await fetch("/api/account/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...address,
          isDefault: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not set default address.");
      }

      await loadAddresses();
      setMessage("Default delivery address updated.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteAddress(id) {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(
        `/api/account/addresses?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete address.");
      }

      if (editingId === id) {
        resetForm();
      }

      await loadAddresses();
      setMessage("Address deleted successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (status === "loading") {
    return <main className="address-page"><p>Checking your account...</p></main>;
  }

  if (!session?.user) {
    return (
      <main className="address-page">
        <h1>Your addresses</h1>
        <p>Please sign in to manage your delivery addresses.</p>
        <button onClick={() => signIn("google")}>Sign in with Google</button>
      </main>
    );
  }

  return (
    <main className="address-page">
      <div className="address-heading">
        <div>
          <p className="address-eyebrow">YOUR ACCOUNT</p>
          <h1>Delivery addresses</h1>
          <p>Manage where your Gareeb Vastarlaya orders should be delivered.</p>
        </div>
        <Link href="/account" className="address-back">Back to account</Link>
      </div>

      {message && (
        <p className="address-message" role="status">{message}</p>
      )}

      <section className="address-form-card">
        <h2>{editingId ? "Edit address" : "Add a new address"}</h2>

        <form onSubmit={submitAddress} className="address-form">
          <label>
            Address label
            <select name="label" value={form.label} onChange={updateField}>
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Recipient name *
            <input name="recipientName" value={form.recipientName}
              onChange={updateField} required maxLength={100} />
          </label>

          <label>
            Mobile number *
            <input name="phone" type="tel" inputMode="numeric"
              value={form.phone} onChange={updateField}
              pattern="[6-9][0-9]{9}" maxLength={10}
              title="Enter a valid 10-digit Indian mobile number" required />
          </label>

          <label className="address-full">
            Address line 1 *
            <input name="addressLine1" value={form.addressLine1}
              onChange={updateField} required maxLength={200}
              placeholder="House number, street, locality" />
          </label>

          <label className="address-full">
            Address line 2
            <input name="addressLine2" value={form.addressLine2}
              onChange={updateField} maxLength={200}
              placeholder="Apartment, floor (optional)" />
          </label>

          <label>
            Landmark
            <input name="landmark" value={form.landmark}
              onChange={updateField} maxLength={150}
              placeholder="Near a landmark (optional)" />
          </label>

          <label>
            City *
            <input name="city" value={form.city}
              onChange={updateField} required maxLength={100} />
          </label>

          <label>
            State *
            <input name="state" value={form.state}
              onChange={updateField} required maxLength={100} />
          </label>

          <label>
            PIN code *
            <input name="postalCode" value={form.postalCode}
              onChange={updateField} required maxLength={6}
              inputMode="numeric" pattern="[0-9]{6}"
              title="Enter a 6-digit PIN code" />
          </label>

          <label className="address-checkbox address-full">
            <input type="checkbox" name="isDefault"
              checked={form.isDefault} onChange={updateField} />
            Set as default delivery address
          </label>

          <div className="address-form-actions address-full">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update address" : "Save address"}
            </button>
            {editingId && (
              <button type="button" className="address-secondary"
                onClick={resetForm}>
                Cancel editing
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="saved-addresses">
        <h2>Your saved addresses</h2>

        {loading ? (
          <p>Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <p>You haven't saved an address yet.</p>
        ) : (
          <div className="address-grid">
            {addresses.map((address) => (
              <article className="saved-address-card" key={address.id}>
                <div className="saved-address-top">
                  <h3>{address.label || "Address"}</h3>
                  {address.isDefault && (
                    <span className="default-address-badge">Default</span>
                  )}
                </div>

                <p><strong>{address.recipientName}</strong></p>
                <p>{address.phone}</p>
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                {address.landmark && <p>Landmark: {address.landmark}</p>}
                <p>{address.city}, {address.state} - {address.postalCode}</p>
                <p>{address.country || "India"}</p>

                <div className="saved-address-actions">
                  <button type="button" className="address-secondary"
                    onClick={() => startEditing(address)}>
                    Edit
                  </button>

                  {!address.isDefault && (
                    <button type="button" className="address-secondary"
                      onClick={() => makeDefault(address)}>
                      Set as default
                    </button>
                  )}

                  <button type="button" className="address-delete"
                    onClick={() => deleteAddress(address.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
