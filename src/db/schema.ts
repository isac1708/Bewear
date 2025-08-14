import { time } from "console";
import { create } from "domain";
import { relations } from "drizzle-orm";
import { boolean, integer,pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
                    id: text('id').primaryKey(),
                    name: text('name').notNull(),
 email: text('email').notNull().unique(),
 emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
 image: text('image'),
 createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
 updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
                });

export const session = pgTable("session", {
                    id: text('id').primaryKey(),
                    expiresAt: timestamp('expires_at').notNull(),
 token: text('token').notNull().unique(),
 createdAt: timestamp('created_at').notNull(),
 updatedAt: timestamp('updated_at').notNull(),
 ipAddress: text('ip_address'),
 userAgent: text('user_agent'),
 userId: text('user_id').notNull().references(()=> userTable.id, { onDelete: 'cascade' })
                });

export const account = pgTable("account", {
                    id: text('id').primaryKey(),
                    accountId: text('account_id').notNull(),
 providerId: text('provider_id').notNull(),
 userId: text('user_id').notNull().references(()=> userTable.id, { onDelete: 'cascade' }),
 accessToken: text('access_token'),
 refreshToken: text('refresh_token'),
 idToken: text('id_token'),
 accessTokenExpiresAt: timestamp('access_token_expires_at'),
 refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
 scope: text('scope'),
 password: text('password'),
 createdAt: timestamp('created_at').notNull(),
 updatedAt: timestamp('updated_at').notNull()
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
    categoryId: uuid().notNull().references(() => categoryTable.id,{onDelete:'set null'} ),
    name: text().notNull(),
    slug: text().notNull().unique(),
    description: text().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productVariantTable = pgTable("product_variant", {
    id: uuid().primaryKey().defaultRandom(),
    productId: uuid("product_id").notNull().references(() => productTable.id, { onDelete: 'cascade' }),
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
//RODAR MUDANÇAS NO BANCO DE DADOS npx drizzle-kit push
//slug é um identificador único, geralmente usado em URLs para identificar um recurso de forma legível e amigável ex: carro-de-compras