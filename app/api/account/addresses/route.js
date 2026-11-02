
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

function validateAddress(data) {
  const required = [
    "recipientName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "postalCode",
  ];

  for (const field of required) {
    if (
      typeof data[field] !== "string" ||
      !data[field].trim()
    ) {
      return `${field} is required.`;
    }
  }

  if (!/^[6-9]\d{9}$/.test(data.phone.trim())) {
    return "Enter a valid 10-digit Indian mobile number.";
  }

  if (!/^\d{6}$/.test(data.postalCode.trim())) {
    return "Enter a valid 6-digit PIN code.";
  }

  return null;
}

function addressFields(data) {
  return {
    label:
      typeof data.label === "string" && data.label.trim()
        ? data.label.trim()
        : "Home",
    recipientName: data.recipientName.trim(),
    phone: data.phone.trim(),
    addressLine1: data.addressLine1.trim(),
    addressLine2: data.addressLine2?.trim() || null,
    landmark: data.landmark?.trim() || null,
    city: data.city.trim(),
    state: data.state.trim(),
    postalCode: data.postalCode.trim(),
    country: "India",
  };
}

// GET: List the signed-in customer's addresses.
export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in first." },
        { status: 401 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Get addresses failed:", error);
    return NextResponse.json(
      { error: "Could not load addresses." },
      { status: 500 }
    );
  }
}

// POST: Create a new address.
export async function POST(request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in first." },
        { status: 401 }
      );
    }

    const data = await request.json();
    const validationError = validateAddress(data);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const address = await prisma.$transaction(async (tx) => {
      const existingCount = await tx.address.count({
        where: { userId },
      });

      const makeDefault =
        data.isDefault === true || existingCount === 0;

      if (makeDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          ...addressFields(data),
          userId,
          isDefault: makeDefault,
        },
      });
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    console.error("Create address failed:", error);
    return NextResponse.json(
      { error: "Could not save address." },
      { status: 500 }
    );
  }
}

// PUT: Edit an address or make it the default.
export async function PUT(request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in first." },
        { status: 401 }
      );
    }

    const data = await request.json();

    if (typeof data.id !== "string" || !data.id.trim()) {
      return NextResponse.json(
        { error: "Address ID is required." },
        { status: 400 }
      );
    }

    const validationError = validateAddress(data);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const existing = await prisma.address.findFirst({
      where: {
        id: data.id,
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Address not found." },
        { status: 404 }
      );
    }

    const address = await prisma.$transaction(async (tx) => {
      // Only one address per customer can be the default.
      if (data.isDefault === true) {
        await tx.address.updateMany({
          where: {
            userId,
            id: { not: data.id },
          },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: data.id },
        data: {
          ...addressFields(data),
          // Editing a default address keeps it default.
          // Selecting "Set as default" makes it the default.
          isDefault:
            data.isDefault === true || existing.isDefault,
        },
      });
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Update address failed:", error);
    return NextResponse.json(
      { error: "Could not update address." },
      { status: 500 }
    );
  }
}

// DELETE: Delete only an address belonging to this customer.
export async function DELETE(request) {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in first." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Address ID is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Address not found." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: { id },
      });

      // If the default was deleted, choose the newest
      // remaining address as the new default.
      if (existing.isDefault) {
        const nextAddress = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });

        if (nextAddress) {
          await tx.address.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete address failed:", error);
    return NextResponse.json(
      { error: "Could not delete address." },
      { status: 500 }
    );
  }
}
