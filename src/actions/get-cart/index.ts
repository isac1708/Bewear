"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { cartTable } from "@/db/schema";
import { CartWithRelations } from "@/hooks/queries/use-cart";
import { auth } from "@/lib/auth";

export const getCart = async (): Promise<CartWithRelations> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("You must be logged in to view cart");
  }
  const cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, session.user.id),
    with: {
      items: {
        with: {
          productVariant: {
            with: { product: true },
          },
        },
      },
    },
  });
  if (!cart) {
    const [newCart] = await db
      .insert(cartTable)
      .values({
        userId: session.user.id,
      })
      .returning();
    return {
      id: newCart.id,
      userId: newCart.userId,
      createdAt: newCart.createdAt,
      shippingAddressId: newCart.shippingAddressId || null, // Garante que seja null se não estiver definido
      items: [],
      totalPriceInCents:0,
    } as CartWithRelations;
  }
  return {
    ...cart,
    totalPriceInCents: cart.items.reduce(
      (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
      0,
    ),
  } as CartWithRelations;
};
