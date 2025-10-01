"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

import { db } from "@/db";
import { cartItemTable, cartTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { removeProductFromCartSchema } from "./schema";

export const removeProductFromCart = async (data: z.infer<typeof removeProductFromCartSchema>) => {
  removeProductFromCartSchema.parse(data);
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
    const cartDoesntBelongToUser = cartItem?.cart.userId !== session.user.id;
    if (cartDoesntBelongToUser) {
    throw new Error("Não autorizado");
    }
 if(!cartItem) {
    throw new Error("Variante do produto não encontrada no carrinho");
 }
    await db.delete(cartItemTable).where(eq(cartItemTable.id, cartItem.id));
};