import { z } from "zod";

export const updateCartShippingAddressSchema = z.object({
  cartId: z.string().uuid("ID do carrinho inválido"),
  shippingAddressId: z.string().uuid("ID do endereço de entrega inválido"),
});

export type UpdateCartShippingAddressSchema = z.infer<
  typeof updateCartShippingAddressSchema
>;
