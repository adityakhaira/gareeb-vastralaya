
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/login" });
  }

  if (status === "loading") {
    return <main style={{ padding: 60, textAlign: "center" }}>
      Checking your sign-in status...
    </main>;
  }

  return (
    <main style={{
      maxWidth: 480,
      margin: "70px auto",
      padding: 32,
      textAlign: "center",
      border: "1px solid #e5e5e5",
      borderRadius: 16
    }}>
      {session?.user ? (
        <>
          <h1>You're signed in!</h1>

          {session.user.image && (
            <img
              src={session.user.image}
              alt="Your Google profile"
              width={76}
              height={76}
              style={{ borderRadius: "50%", margin: "20px auto" }}
            />
          )}

          <p>Welcome, {session.user.name || "Customer"}!</p>
          <p>{session.user.email}</p>

          <p style={{ color: "green" }}>
            Your customer session is active.
          </p>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{
              marginTop: 20,
              padding: "12px 24px",
              cursor: "pointer",
              borderRadius: 8
            }}
          >
            Sign out
          </button>
        </>
      ) : (
        <>
          <h1>Welcome to Gareeb Vastarlaya</h1>
          <p>Sign in to manage your account and orders.</p>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              marginTop: 24,
              padding: "12px 24px",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            {loading ? "Redirecting..." : "Continue with Google"}
          </button>
        </>
      )}
    </main>
  );
}
