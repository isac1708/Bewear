"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

import { db } from "@/db";
import { cartItemTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { decreaseCartProductQuantitySchema } from "./schema";

export const removeProductFromCart = async (
  data: z.infer<typeof decreaseCartProductQuantitySchema>,
) => {
  decreaseCartProductQuantitySchema.parse(data);
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("You must be logged in to add products to cart");
  }

  const cartItem = await db.query.cartItemTable.findFirst({
    where: (ci, { eq }) => eq(ci.id, data.cartItemId),
    with: { cart: true },
  });
  if (!cartItem) {
    throw new Error("Variante do produto não encontrada no carrinho");
  }
  const cartDoesntBelongToUser = cartItem.cart.userId !== session.user.id;
  if (cartDoesntBelongToUser) {
    throw new Error("Não autorizado");
  }
  if(cartItem.quantity === 1){
    await db.delete(cartItemTable).where(eq(cartItemTable.id, cartItem.id));
    return;
  }

   await db.update(cartItemTable)
  .set({ quantity: cartItem.quantity - 1 })
  .where(eq(cartItemTable.id, cartItem.id));
};
