"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { shippingAddressTable } from "@/db/schema";
import { useCreateShippingAddress } from "@/hooks/mutations/use-add-address";
import { useUpdateCartShippingAddress } from "@/hooks/mutations/use-update-cart-shipping-address";
import { CartWithRelations, getCartQueryKey, useCart } from "@/hooks/queries/use-cart";
import { getShippingAddressesQueryKey } from "@/hooks/queries/use-shipping-addresses";

import { formatAddress } from "../../helpers/address";

interface AddressesProps {
  shippingAddresses: (typeof shippingAddressTable.$inferSelect)[];
  defaultSelectedAddressId?: string | null;
}


const Addresses = ({ shippingAddresses, defaultSelectedAddressId }: AddressesProps) => {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(defaultSelectedAddressId || null);
  const createShippingAddressMutation = useCreateShippingAddress();
  const updateCartShippingAddressMutation = useUpdateCartShippingAddress();
  const { data: cart, isLoading: isCartLoading } = useCart();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (createShippingAddressMutation.isSuccess) {
      window.location.reload();
    }
  }, [createShippingAddressMutation.isSuccess]);

  const formSchema = z.object({
    email: z.email("Email inválido").min(1, "Email é obrigatório"),
    fullName: z.string().min(1, "Nome Completo é obrigatório"),
    cpf: z.string().min(14, "CPF inválido"), // Assuming masked CPF will have 14 characters
    phone: z.string().min(15, "Celular inválido"), // Masked phone will have 15 characters (XX) XXXXX-XXXX
    zipCode: z.string().min(9, "CEP inválido"), // Masked CEP will have 9 characters
    address: z.string().min(1, "Endereço é obrigatório"),
    number: z.string().min(1, "Número é obrigatório"),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().min(1, "Estado é obrigatório"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
      cpf: "",
      phone: "",
      zipCode: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  const { isPending } = createShippingAddressMutation;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const newAddress = await createShippingAddressMutation.mutateAsync(values, {
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: getShippingAddressesQueryKey(),
          });
          queryClient.setQueryData(getCartQueryKey(), (oldCart: CartWithRelations | undefined) => {
            if (oldCart && data) {
              return { ...oldCart, shippingAddressId: data.id };
            }
            return oldCart;
          });
        },
      });

      if (!typedCart.id) {
        toast.error("Não foi possível encontrar o carrinho.");
        return;
      }

      await updateCartShippingAddressMutation.mutateAsync({
        cartId: typedCart.id,
        shippingAddressId: newAddress.id,
      });

      toast.success("Endereço criado e vinculado ao carrinho com sucesso!");
      form.reset();
      setSelectedAddress(newAddress.id); // Seleciona o novo endereço
    } catch (error) {
      toast.error("Erro ao criar endereço. Tente novamente.");
      console.error(error);
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedAddress || selectedAddress === "add_new") {
      toast.error("Por favor, selecione um endereço ou adicione um novo.");
      return;
    }

    if (!typedCart.id) {
      toast.error("Não foi possível encontrar o carrinho.");
      return;
    }

    try {
      await updateCartShippingAddressMutation.mutateAsync({
        cartId: typedCart.id,
        shippingAddressId: selectedAddress,
      });
      toast.success("Endereço vinculado ao carrinho com sucesso! Redirecionando para o pagamento...");
      router.push("/cart/confirmation");
      // TODO: Redirecionar para a página de pagamento
    } catch (error) {
      toast.error("Erro ao vincular endereço ao carrinho. Tente novamente.");
      console.error(error);
    }
  };

  if (isCartLoading) {
    return <div>Carregando carrinho...</div>;
  }

  if (!cart) {
    return <div>Não foi possível carregar o carrinho.</div>;
  }

  // Garante que o TypeScript saiba que `cart` é do tipo CartWithRelations a partir daqui
  const typedCart: CartWithRelations = cart;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identificação</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
          {shippingAddresses?.map((address) => (
            <Card key={address.id}>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={address.id} id={address.id} />
                  <Label htmlFor={address.id}>
                    <div>
                      <p className="text-sm">{formatAddress(address)}</p>
                    </div>
                  </Label>
                </div>
                {selectedAddress === address.id && ( // Botão "Ir para pagamento" apenas se este endereço estiver selecionado
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleProceedToPayment} disabled={updateCartShippingAddressMutation.isPending}>
                      Ir para pagamento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardContent>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="add_new" id="add_new" />
                <Label htmlFor="add_new">Adicionar novo endereço</Label>
              </div>
            </CardContent>
          </Card>
        </RadioGroup>
        {selectedAddress === "add_new" && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-4 space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome Completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="###.###.###-##"
                          placeholder="000.000.000-00"
                          customInput={Input}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="(##) #####-####"
                          placeholder="(11) 99999-9999"
                          customInput={Input}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <PatternFormat
                        format="#####-###"
                        placeholder="00000-000"
                        customInput={Input}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Endereço" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="Número" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Complemento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="Estado" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isPending}>Adicionar Endereço</Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};
export default Addresses;
