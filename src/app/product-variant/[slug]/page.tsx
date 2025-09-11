import { eq } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";

import Footer from "@/app/authentication/components/common/footer";
import Header from "@/app/authentication/components/common/header";
import ProductList from "@/app/authentication/components/common/product-list";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { productTable, productVariantTable } from "@/db/schema";
import { formatCentesToBRL } from "@/helpers/money";

import QuantitySelector from "./components/quantity-selector";
import VariantSelector from "./components/variant-selector";

interface ProductVariantPageProps {
  params: Promise<{ slug: string }>;
}

const ProductVariantPage = async ({ params }: ProductVariantPageProps) => {
  const { slug } = await params;
  const productVariant = await db.query.productVariantTable.findFirst({
    where: eq(productVariantTable.slug, slug),
    with: {
      product: {
        with: { variants: true },
      },
    },
  });
  if (!productVariant) {
    return notFound();
  }

  const likelyProducts = await db.query.productTable.findMany({
    where: eq(productTable.categoryId, productVariant.product.categoryId),
    with: {
      variants: true,
    },
  });

  return (
    <>
      <Header />
      <div className="flex flex-col space-y-6">
        <Image
          src={productVariant.imageUrl}
          alt={productVariant.name}
          sizes="100vw"
          width={0}
          height={0}
          className="h-auto w-full object-cover"
        />
        <div className="px-5">
          <VariantSelector variants={productVariant.product.variants} selectedVariantSlug={productVariant.slug} />
        </div>
        <div className="px-5">
          {/* DESCRIÇÃO*/}

          <h2 className="text-xl font-semibold">
            {productVariant.product.name}
          </h2>
          <h3 className="text-muted-foreground text-sm">
            {productVariant.name}
          </h3>
          <h3 className="text-lg font-semibold">
            {formatCentesToBRL(productVariant.priceInCents)}
          </h3>
        </div>
        <div className="px-5">
          {/* QUANTIDADE*/}
          <QuantitySelector />
          </div>

        <div className="flex flex-col space-y-4 px-5">
          {/* BOTÃO DE ADICIONAR AO CARRINHO  E COMPRAR AGORA*/}

          <Button className="rounded-full" size="lg" variant="outline">
            Adicionar ao carrinho
          </Button>
          <Button className="rounded-full" size="lg">
            Comprar Agora
          </Button>
        </div>
        <div className="px-5">
          {/* INFORMAÇÕES ADICIONAIS*/}
          <p className="text-sm">{productVariant.product.description}</p>
        </div>
        <ProductList title="Produtos similares" products={likelyProducts} />
        <Footer />
      </div>
    </>
  );
};
export default ProductVariantPage;
