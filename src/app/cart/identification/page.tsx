import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Footer from "@/app/authentication/components/common/footer";
import Header from "@/app/authentication/components/common/header";
import { db } from "@/db";
import { cartTable, shippingAddressTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import CartSummary from "../components/cart-summary";
import Addresses from "./components/addresses";

const IdentificationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/");
  }
  const cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, session.user.id),
    with: {
      items: {
        with: {
          productVariant: {
            with: {
              product: true,
            },
          },
        },
      },
    },
  });
  if (!cart || cart.items.length === 0) {
    redirect("/");
  }
  const shippingAddresses = await db.query.shippingAddressTable.findMany({
    where: eq(shippingAddressTable.userId, session.user.id),
  });


  const CartTotalPriceInCents = cart.items.reduce(
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
    0,
  );
  return (
    <div className="space-y-12">
      <Header />
      <div className="space-y-4 px-5">
        <Addresses
          shippingAddresses={shippingAddresses}
          defaultSelectedAddressId={cart.shippingAddressId}
        />
        <CartSummary
          subtotalInCents={CartTotalPriceInCents}
          totalInCents={CartTotalPriceInCents}
          products={cart.items.map((item) => ({
            id: item.id,
            name: item.productVariant.product?.name ?? item.productVariant.name,
            variantName: item.productVariant.name,
            quantity: item.quantity,
            priceInCents: item.productVariant.priceInCents,
            imageUrl: item.productVariant.imageUrl,
          }))}
        />
      </div>
      <Footer/>
    </div>
  );
};
export default IdentificationPage;
