import { useQuery } from "@tanstack/react-query";

import { getShippingAddresses } from "@/actions/get-shipping-addresses";

export const getShippingAddressesQueryKey = () =>
  ["shipping-addresses"] as const;

export const useShippingAddresses = () => {
  return useQuery({
    queryKey: getShippingAddressesQueryKey(),
    queryFn: async () => getShippingAddresses(),
  });
};
