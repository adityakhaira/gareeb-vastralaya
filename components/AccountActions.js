
"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function AccountActions() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (session?.user) {
    return (
      <>
        <Link href="/account" className="cart-link">
          Account
        </Link>

        <button
          type="button"
          className="cart-link"
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            font: "inherit",
            padding: 0,
          }}
        >
          Sign out
        </button>
      </>
    );
  }

  return (
    <Link href="/login" className="cart-link">
      Sign in
    </Link>
  );
}
