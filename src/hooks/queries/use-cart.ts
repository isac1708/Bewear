import { useQuery } from "@tanstack/react-query";

import { getCart } from "@/actions/get-cart";
import { cartTable } from "@/db/schema";

export const getCartQueryKey = () => ["cart"] as const;

export type CartWithRelations = (typeof cartTable.$inferSelect) & {
  items: Array<{
    quantity: number;
    productVariant: {
      priceInCents: number;
    };
  }>;
  totalPriceInCents: number;
};

type UseCartParams = {
  initialData?: CartWithRelations;
};

export const useCart = (params?: UseCartParams) => {
  return useQuery<CartWithRelations>({
    queryKey: getCartQueryKey(),
    queryFn: async () => getCart(),
    initialData: params?.initialData,
  });
};
