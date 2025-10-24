import { useQuery } from "@tanstack/react-query";

import { getShippingAddresses } from "@/actions/get-shipping-addresses";
import { shippingAddressTable } from "@/db/schema";

export const getShippingAddressesQueryKey = () =>
  ["shipping-addresses"] as const;

export const useShippingAddresses = (params?: {initialData?: (typeof shippingAddressTable.$inferSelect)[]}) => {
  return useQuery({
    queryKey: getShippingAddressesQueryKey(),
    queryFn: async () => getShippingAddresses(),
    initialData:  params?.initialData,
  });
};
