import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for email/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Business listings table
export const businessListings = pgTable("business_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: varchar("business_name").notNull(),
  category: varchar("category").notNull(),
  description: varchar("description", { length: 1000 }),
  address: varchar("address").notNull(),
  city: varchar("city").notNull(),
  postalCode: varchar("postal_code"),
  phone: varchar("phone"),
  email: varchar("email"),
  website: varchar("website"),
  operatingHours: jsonb("operating_hours"),
  cuisineType: varchar("cuisine_type"),
  priceRange: varchar("price_range"),
  tags: varchar("tags").array(),
  imageUrl: varchar("image_url"),
  isHalal: varchar("is_halal").default("yes"),
  isVerified: varchar("is_verified").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBusinessListingSchema = createInsertSchema(businessListings).omit({
  id: true,
  userId: true, // Server will set this from authenticated user
  createdAt: true,
  updatedAt: true,
}).extend({
  tags: z.string().optional(), // Accept tags as string from frontend
});

export type BusinessListing = typeof businessListings.$inferSelect;
export type InsertBusinessListing = z.infer<typeof insertBusinessListingSchema>;
