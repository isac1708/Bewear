import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { removeProductFromCart } from "@/actions/remove-cart-product";
import { Button } from "@/components/ui/button";
import { formatCentesToBRL } from "@/helpers/money";

interface CartItemProps {
  id: string;
  productName: string;
  productVariantName: string;
  productVariantImageUrl: string;
  productVariantPriceInCents: number;
  quantity: number;
}

const CartItem = ({
  id,
  productName,
  productVariantName,
  productVariantImageUrl,
  productVariantPriceInCents,
  quantity,
}: CartItemProps) => {

  const queryClient = useQueryClient();
  const removeProductFromCartMutation = useMutation({
    mutationKey: ["remove-cart-product"],
    mutationFn: () => removeProductFromCart({ cartItemId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  });

  const decreaseProductQuantityMutation = useMutation({
    mutationKey: ["decrease-cart-product-quantity"],
    mutationFn: () => removeProductFromCart({ cartItemId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const handleRemoveProductFromCart = () => {
    removeProductFromCartMutation.mutate(undefined,{
      onSuccess: () => {
        toast.success("Produto removido do carrinho");
      }
    });
  }

  const handleDecreaseProductQuantity = () => {
    if(quantity === 1){
      handleRemoveProductFromCart();
      return;
    }
    decreaseProductQuantityMutation.mutate(undefined,{
      onSuccess: () => {
        toast.success("Quantidade do produto atualizada");
      }
    });
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image
          src={productVariantImageUrl}
          alt={productVariantName}
          width={78}
          height={78}
          className="rounded-lg"
        />
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold">{productName}</p>
          <p className="text-muted-foreground text-xs font-medium">
            {productVariantName}
          </p>
          <div className="flex w-[100px] items-center justify-between rounded-lg border p-1">
            <Button className="h-4 w-4" variant="ghost" onClick={handleDecreaseProductQuantity}>
              <MinusIcon className="h-2 w-2" />
            </Button>
            <p className="text-xs font-medium">{quantity}</p>
            <Button className="h-4 w-4" variant="ghost" onClick={() => {}}>
              <PlusIcon className="h-2 w-2" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end justify-center gap-2">
        <Button variant="outline" size="icon" onClick={handleRemoveProductFromCart}>
          <TrashIcon />
        </Button>
        <p className="text-sm font-bold">
          {formatCentesToBRL(productVariantPriceInCents)}
        </p>
      </div>
    </div>
  );
};
export default CartItem;
