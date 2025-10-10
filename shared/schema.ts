import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  decimal,
  boolean,
  text,
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
  phone: varchar("phone"),
  bio: text("bio"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("consumer"), // 'consumer' | 'vendor' | 'staff' | 'admin'
  vendorStatus: varchar("vendor_status").notNull().default("none"), // 'none' | 'pending' | 'verified' | 'rejected'
  timeDollarBalance: integer("timedollar_balance").default(0), // TimeDollar balance
  resetPasswordToken: varchar("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
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

// Vendor Requests table - for tracking vendor verification applications
export const vendorRequests = pgTable("vendor_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: varchar("business_name").notNull(),
  identificationDoc: varchar("identification_doc"), // URL to uploaded ID document
  businessRegistrationDoc: varchar("business_registration_doc"), // URL to business registration (optional)
  addressProofDoc: varchar("address_proof_doc"), // URL to address proof document
  description: text("description"), // Reason for becoming a vendor
  status: varchar("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
  rejectionReason: text("rejection_reason"), // Optional reason for rejection
  reviewedBy: varchar("reviewed_by").references(() => users.id), // Admin who reviewed
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVendorRequestSchema = createInsertSchema(vendorRequests).omit({
  id: true,
  userId: true,
  status: true,
  rejectionReason: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type VendorRequest = typeof vendorRequests.$inferSelect;
export type InsertVendorRequest = z.infer<typeof insertVendorRequestSchema>;

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  icon: varchar("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced listings table to support different types
export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'business', 'product', 'service', 'event'
  title: varchar("title").notNull(),
  description: text("description"),
  categoryId: varchar("category_id").references(() => categories.id),
  customCategory: text("custom_category"), // Free-text category for products (comma-separated)
  
  // Location data
  address: varchar("address"),
  city: varchar("city"),
  postalCode: varchar("postal_code"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  isOnlineOnly: boolean("is_online_only").default(false),
  
  // Contact information
  phone: varchar("phone"),
  email: varchar("email"),
  website: varchar("website"),
  
  // Images (array of URLs)
  images: varchar("images").array(),
  
  // General business information
  operatingHours: jsonb("operating_hours"),
  tags: varchar("tags").array(),
  
  // Product-specific fields
  sku: varchar("sku"),
  price: decimal("price", { precision: 10, scale: 2 }),
  inventory: integer("inventory"),
  paymentMethods: varchar("payment_methods").array(), // ['cash', 'td', 'both']
  
  // Pricing system fields
  paymentType: varchar("payment_type").default("cash_only"), // 'cash_only' | 'timedollar_only' | 'both_choice' | 'combo'
  cashPercentage: integer("cash_percentage"), // For 'combo' type: 0-100
  timedollarPercentage: integer("timedollar_percentage"), // For 'combo' type: 0-100
  
  // Service-specific fields
  duration: integer("duration_minutes"), // Duration in minutes
  
  // Event-specific fields
  eventDate: timestamp("event_date"),
  eventEndDate: timestamp("event_end_date"),
  capacity: integer("capacity"),
  attendeeCount: integer("attendee_count").default(0),
  eventPrice: decimal("event_price", { precision: 10, scale: 2 }),
  
  // Status and verification
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  status: varchar("status").notNull().default("pending"), // 'pending' | 'published' | 'rejected'
  
  // Moderation fields
  moderationStatus: varchar("moderation_status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
  moderationNotes: text("moderation_notes"),
  moderatedBy: varchar("moderated_by").references(() => users.id),
  moderatedAt: timestamp("moderated_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"), // Soft delete - if set, listing is in recycle bin
});

// Bookings table for services and events
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listingId: varchar("listing_id").notNull().references(() => listings.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  bookingDate: timestamp("booking_date").notNull(),
  duration: integer("duration_minutes"),
  numberOfPeople: integer("number_of_people").default(1),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  status: varchar("status").notNull().default("pending"), // 'pending', 'confirmed', 'cancelled'
  paymentIntentId: varchar("payment_intent_id"), // Stripe payment intent ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced coupon codes system
export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => users.id), // Vendor who created the coupon
  vendorName: varchar("vendor_name").notNull(), // Auto-filled from vendor's business name
  code: varchar("code").notNull().unique(),
  discountType: varchar("discount_type").notNull(), // 'percentage' | 'fixed'
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit"), // Max number of total uses
  usedCount: integer("used_count").default(0),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  applicableListings: varchar("applicable_listings").array(), // IDs of listings this coupon applies to (empty = all vendor's listings)
  status: varchar("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
  rejectionReason: text("rejection_reason"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff Help Requests - users can request help from staff for filling listings
export const staffHelpRequests = pgTable("staff_help_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  userName: varchar("user_name").notNull(),
  listingType: varchar("listing_type").notNull(), // 'business' | 'product' | 'service' | 'event'
  message: text("message"), // Optional message from user explaining what they need help with
  status: varchar("status").notNull().default("pending"), // 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assignedTo: varchar("assigned_to").references(() => users.id), // Staff member assigned
  responseNotes: text("response_notes"), // Staff's notes or response
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStaffHelpRequestSchema = createInsertSchema(staffHelpRequests).omit({
  id: true,
  userId: true,
  userName: true,
  status: true,
  assignedTo: true,
  responseNotes: true,
  createdAt: true,
  updatedAt: true,
});

export type StaffHelpRequest = typeof staffHelpRequests.$inferSelect;
export type InsertStaffHelpRequest = z.infer<typeof insertStaffHelpRequestSchema>;

// Activity Logs - track all user actions for admin visibility
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  userName: varchar("user_name").notNull(),
  actionType: varchar("action_type").notNull(), // 'create' | 'update' | 'delete'
  entityType: varchar("entity_type").notNull(), // 'listing' | 'product' | 'service' | 'event' | 'coupon' | 'vendor_request'
  entityId: varchar("entity_id"), // ID of the entity affected
  entityTitle: varchar("entity_title"), // Title/name of the entity for display
  description: text("description"), // Human-readable description of the action
  metadata: jsonb("metadata"), // Additional data (old values, new values, etc.)
  createdAt: timestamp("created_at").defaultNow(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;

// Keep the old business_listings table for backward compatibility but mark as deprecated
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

// Schemas for the new tables
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  userId: true,
  attendeeCount: true,
  // Omit moderation fields - server controlled
  moderationStatus: true,
  moderationNotes: true,
  moderatedBy: true,
  moderatedAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Make all fields optional - user can choose what to provide
  title: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  
  // Location fields optional
  address: z.string().optional(),
  city: z.string().optional(),
  
  // Status field - pending (awaiting approval), published (approved and live), rejected (not approved)
  status: z.enum(["pending", "published", "rejected"]).optional().default("pending"),
  
  // Optional arrays
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  vendorId: true,
  vendorName: true,
  usedCount: true,
  status: true,
  rejectionReason: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Legacy schema (deprecated)
export const insertBusinessListingSchema = createInsertSchema(businessListings).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  tags: z.string().optional(),
});

// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;

// Legacy types (deprecated)
export type BusinessListing = typeof businessListings.$inferSelect;
export type InsertBusinessListing = z.infer<typeof insertBusinessListingSchema>;
