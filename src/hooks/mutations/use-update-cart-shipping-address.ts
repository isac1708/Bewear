import { useMutation } from "@tanstack/react-query";

import { updateCartShippingAddress } from "@/actions/update-cart-shipping-address";

export const getUpdateCartShippingAddressMutationKey = () =>
  ["update-cart-shipping-address"] as const;

export const useUpdateCartShippingAddress = () => {
  return useMutation({
    mutationKey: getUpdateCartShippingAddressMutationKey(),
    mutationFn: updateCartShippingAddress,
  });
};
