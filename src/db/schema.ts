import { time } from "console";
import { create } from "domain";
import { relations } from "drizzle-orm";
import { integer,pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
});

export const categoryTable = pgTable("category", {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(), 
    slug: text().notNull().unique(),
    createdAt: timestamp().notNull().defaultNow(),
});

export const categoryRelation = relations(categoryTable, ({many}) => ({
    products: many(productTable),
}));



export const productTable = pgTable("product", {
    id: uuid().primaryKey().defaultRandom(),
    categoryId: uuid().notNull().references(() => categoryTable.id),
    name: text().notNull(),
    slug: text().notNull().unique(),
    description: text().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productVariantTable = pgTable("product_variant", {
    id: uuid().primaryKey().defaultRandom(),
    productId: uuid("product_id").notNull().references(() => productTable.id),
    name: text().notNull(),
    slug: text().notNull().unique(),
    color: text("color").notNull(),
    priceInCents: integer("price_in_cents").notNull(),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productRelation = relations(productTable, ({one,many}) => ({
    category: one(categoryTable, {
        fields: [productTable.categoryId],
        references: [categoryTable.id],
    }),
    variants: many(productVariantTable),
}));

export const productVariantRelation = relations(productVariantTable, ({one}) => ({
    product: one(productTable, {
        fields: [productVariantTable.productId],
        references: [productTable.id],
    }),
}));
//RODAR MUDANÇAS NO BANCO DE DADOS  drizzle-kit push
//slug é um identificador único, geralmente usado em URLs para identificar um recurso de forma legível e amigável ex: carro-de-compras