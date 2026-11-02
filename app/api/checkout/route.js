
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in before placing an order." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { addressId, items } = body;

    if (
      typeof addressId !== "string" ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Select a delivery address and add products to your cart." },
        { status: 400 }
      );
    }

    // Validate and combine quantities by SKU.
    const quantities = new Map();

    for (const item of items) {
      if (
        typeof item.sku !== "string" ||
        !item.sku.trim() ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
      ) {
        return NextResponse.json(
          { error: "Your cart contains an invalid SKU or quantity." },
          { status: 400 }
        );
      }

      const sku = item.sku.trim();
      quantities.set(sku, (quantities.get(sku) || 0) + item.quantity);

      if (quantities.get(sku) > 99) {
        return NextResponse.json(
          { error: "Maximum quantity per product is 99." },
          { status: 400 }
        );
      }
    }

    if (quantities.size > 50) {
      return NextResponse.json(
        { error: "Too many different products in one order." },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const address = await tx.address.findFirst({
        where: { id: addressId, userId: session.user.id },
      });

      if (!address) {
        throw new Error("ADDRESS_NOT_FOUND");
      }

      const orderItems = [];
      let subtotalPaise = 0;

      // Sort SKUs for consistent processing order.
      const sortedItems = [...quantities.entries()].sort(([a], [b]) =>
        a.localeCompare(b)
      );

      for (const [sku, quantity] of sortedItems) {
        const variant = await tx.productVariant.findUnique({
          where: { sku },
          include: {
            product: true,
            inventory: true,
          },
        });

        if (
          !variant ||
          !variant.active ||
          variant.product.status !== "active"
        ) {
          throw new Error("PRODUCT_UNAVAILABLE");
        }

        if (!variant.inventory) {
          throw new Error("STOCK_UNAVAILABLE");
        }

        const lineTotalPaise = variant.pricePaise * quantity;

        if (
          !Number.isSafeInteger(lineTotalPaise) ||
          lineTotalPaise < 0
        ) {
          throw new Error("INVALID_PRICE");
        }

        subtotalPaise += lineTotalPaise;

        if (!Number.isSafeInteger(subtotalPaise)) {
          throw new Error("INVALID_PRICE");
        }

        // Reserve stock only if enough unreserved stock remains.
        const stockUpdate = await tx.inventory.updateMany({
          where: {
            id: variant.inventory.id,
            availableQuantity: { gte: quantity },
            reservedQuantity: {
              lte: variant.inventory.availableQuantity - quantity,
            },
          },
          data: {
            reservedQuantity: { increment: quantity },
          },
        });

        if (stockUpdate.count !== 1) {
          throw new Error("INSUFFICIENT_STOCK");
        }

        orderItems.push({
          variantId: variant.id,
          skuSnapshot: variant.sku,
          productNameSnapshot: variant.product.name,
          variantDescriptionSnapshot:
            typeof variant.attributes === "string"
              ? variant.attributes
              : JSON.stringify(variant.attributes),
          unitPricePaise: variant.pricePaise,
          quantity,
          lineTotalPaise,
        });
      }

      const orderNumber =
        `GV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      return tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          customerName: address.recipientName,
          customerEmail: session.user.email || null,
          customerPhone: address.phone,
          shippingAddressSnapshot: {
            recipientName: address.recipientName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
          subtotalPaise,
          totalPaise: subtotalPaise,
          currency: "INR",
          paymentStatus: "pending",
          orderStatus: "pending_payment",
          items: { create: orderItems },
          payments: {
            create: {
              provider: "manual_upi",
              amountPaise: subtotalPaise,
              currency: "INR",
              status: "pending",
            },
          },
        },
        select: {
          id: true,
          orderNumber: true,
          totalPaise: true,
          paymentStatus: true,
          orderStatus: true,
        },
      });
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error.message === "ADDRESS_NOT_FOUND") {
      return NextResponse.json(
        { error: "Please select an address saved to your account." },
        { status: 404 }
      );
    }

    if (error.message === "PRODUCT_UNAVAILABLE") {
      return NextResponse.json(
        { error: "A product in your cart is no longer available." },
        { status: 409 }
      );
    }

    if (
      error.message === "STOCK_UNAVAILABLE" ||
      error.message === "INSUFFICIENT_STOCK"
    ) {
      return NextResponse.json(
        { error: "A product is out of stock or has insufficient stock." },
        { status: 409 }
      );
    }

    if (error.message === "INVALID_PRICE") {
      return NextResponse.json(
        { error: "A product has an invalid price." },
        { status: 400 }
      );
    }

    console.error("Checkout order creation failed:", error);

    return NextResponse.json(
      { error: "Could not place your order. Please try again." },
      { status: 500 }
    );
  }
}
