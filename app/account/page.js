
"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="container" style={{ padding: "60px 0" }}>
        Loading your account...
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main
        className="container"
        style={{ maxWidth: 600, margin: "70px auto", padding: 24 }}
      >
        <h1>Sign in to your account</h1>
        <p>Sign in to manage your profile, addresses and orders.</p>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/account" })}
        >
          Continue with Google
        </button>
      </main>
    );
  }

  return (
    <main
      className="container"
      style={{ maxWidth: 800, margin: "50px auto", padding: 24 }}
    >
      <h1>My Account</h1>
      <p>Welcome back, {session.user.name || "Customer"}!</p>

      <section
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          padding: 24,
          marginTop: 24,
        }}
      >
        <h2>Profile</h2>
        {session.user.image && (
          <img
            src={session.user.image}
            alt="Profile"
            width={72}
            height={72}
            style={{ borderRadius: "50%" }}
          />
        )}
        <p><strong>Name:</strong> {session.user.name || "Not provided"}</p>
        <p><strong>Email:</strong> {session.user.email || "Not provided"}</p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>My Shopping</h2>
        <p>
          <Link href="/account/addresses">Manage saved addresses</Link>
        </p>
        <p>
          <Link href="/account/orders">View my orders</Link>
        </p>
      </section>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        style={{ marginTop: 24, padding: "10px 20px", cursor: "pointer" }}
      >
        Sign out
      </button>
    </main>
  );
}
