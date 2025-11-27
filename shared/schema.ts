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
  real,
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
  role: varchar("role").notNull().default("consumer"), // 'consumer' | 'vendor' | 'staff' | 'admin' | 'super-admin'
  staffRole: varchar("staff_role"), // 'individual' | 'business' | 'support' | 'sales' | 'mediator' | 'full_admin' (only for staff users)
  vendorStatus: varchar("vendor_status").notNull().default("none"), // 'none' | 'pending' | 'verified' | 'rejected'
  status: varchar("status").notNull().default("active"), // 'active' | 'suspended'
  timeDollarBalance: real("timedollar_balance").default(0), // TimeDollar balance (supports decimals for accurate combo payments)
  tdCashSplitPercentage: integer("td_cash_split_percentage").default(50), // Vendor's TD/cash split: % of CASH (0-100), TD is remainder
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

// Staff account creation schema - extends insertUserSchema with required fields
export const staffInsertSchema = insertUserSchema.extend({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.literal("staff"),
  staffRole: z.enum(["individual", "business", "support", "sales", "mediator", "full_admin"]),
}).omit({
  vendorStatus: true,
  timeDollarBalance: true,
  tdCashSplitPercentage: true,
});

export type InsertStaff = z.infer<typeof staffInsertSchema>;

// Staff role update schema
export const staffRoleUpdateSchema = z.object({
  staffRole: z.enum(["individual", "business", "support", "sales", "mediator", "full_admin"]),
});

export type StaffRoleUpdate = z.infer<typeof staffRoleUpdateSchema>;

// Vendor Requests table - for tracking vendor verification applications
export const vendorRequests = pgTable("vendor_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: varchar("business_name").notNull(),
  businessType: varchar("business_type").notNull(), // 'individual' | 'company'
  identificationDoc: varchar("identification_doc").notNull(), // URL to uploaded ID document (REQUIRED)
  businessRegistrationDoc: varchar("business_registration_doc"), // URL to business registration (required for companies)
  addressProofDoc: varchar("address_proof_doc").notNull(), // URL to address proof document (REQUIRED)
  contactNumber: varchar("contact_number").notNull(), // Contact phone number
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
  tdPrice: decimal("td_price", { precision: 10, scale: 2 }), // Fixed TimeDollar price for products with 'both' payment option
  
  // Service-specific fields
  duration: integer("duration_minutes"), // Duration in minutes
  
  // Event-specific fields
  eventDate: timestamp("event_date"),
  eventEndDate: timestamp("event_end_date"),
  capacity: integer("capacity"),
  attendeeCount: integer("attendee_count").default(0),
  eventPrice: decimal("event_price", { precision: 10, scale: 2 }),
  
  // TimeDollar eligibility fields
  tdEligible: boolean("td_eligible").default(false), // Whether listing is eligible for TD transactions
  tdValue: integer("td_value"), // TimeDollar value for services (integer)
  
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

// Event Registrations table - users can register for events
export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => listings.id), // Event (listing with type='event')
  vendorId: varchar("vendor_id").notNull().references(() => users.id), // Event owner/vendor
  userId: varchar("user_id").references(() => users.id), // Registered user (nullable for guest registrations)
  fullName: varchar("full_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  notes: text("notes"), // Additional notes from registrant
  status: varchar("status").notNull().default("confirmed"), // 'confirmed', 'cancelled', 'attended'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced coupon codes system
export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Coupon Type: 'discount' or 'cash'
  couponType: varchar("coupon_type").notNull(), // 'discount' | 'cash'
  
  // Issuer: 'vendor' or 'admin'
  issuer: varchar("issuer").notNull(), // 'vendor' | 'admin'
  vendorId: varchar("vendor_id").references(() => users.id), // Vendor who created (null for admin coupons)
  
  // Applicability
  scope: varchar("scope").notNull().default("platform"), // 'platform' (all products) | 'product' (specific product only)
  productId: varchar("product_id").references(() => listings.id), // Required when scope='product': specific product this coupon applies to
  
  code: varchar("code").notNull().unique(),
  title: varchar("title").notNull(),
  description: text("description"),
  
  // For discount coupons: percentage or fixed amount off
  discountType: varchar("discount_type"), // 'percentage' | 'fixed' (for discount coupons)
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }), // Discount amount or percentage
  
  // For cash coupons: fixed HK$ value (e.g., HK$60 = 1 TD)
  cashValue: decimal("cash_value", { precision: 10, scale: 2 }), // Cash value for cash coupons
  
  // Usage limits and tracking
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  
  // Validity period
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  
  // Status and approval (for vendor coupons)
  status: varchar("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected' | 'expired' | 'inactive'
  approvedBy: varchar("approved_by").references(() => users.id), // Admin who approved (for vendor coupons)
  rejectionReason: text("rejection_reason"), // Reason for rejection
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coupon Usage Tracking - track which users used which coupons
export const couponUsage = pgTable("coupon_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  couponId: varchar("coupon_id").notNull().references(() => coupons.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  orderId: varchar("order_id").references(() => orders.id),
  cashDiscount: decimal("cash_discount", { precision: 10, scale: 2 }).default("0"),
  tdDiscount: decimal("td_discount", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
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

// Shopping Cart - for users to add products before purchasing
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => listings.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

// Saved Items / Wishlist - for users to save products they're interested in
export const savedItems = pgTable("saved_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  listingId: varchar("listing_id").notNull().references(() => listings.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSavedItemSchema = createInsertSchema(savedItems).omit({
  id: true,
  createdAt: true,
});

export type SavedItem = typeof savedItems.$inferSelect;
export type InsertSavedItem = z.infer<typeof insertSavedItemSchema>;

// Reviews - for users to leave reviews on products and services
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  listingId: varchar("listing_id").notNull().references(() => listings.id),
  vendorId: varchar("vendor_id").notNull().references(() => users.id), // Vendor who owns the listing
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Orders table for completed purchases
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  vendorId: varchar("vendor_id").notNull().references(() => users.id), // Vendor who receives the order
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: varchar("payment_method"), // 'cash' | 'timedollar' | 'both'
  cashAmount: decimal("cash_amount", { precision: 10, scale: 2 }).default("0"),
  tdAmount: decimal("td_amount", { precision: 10, scale: 2 }).default("0"),
  transactionId: varchar("transaction_id"),
  
  // Coupon information
  couponId: varchar("coupon_id").references(() => coupons.id),
  couponCode: varchar("coupon_code"),
  couponCashDiscount: decimal("coupon_cash_discount", { precision: 10, scale: 2 }).default("0"),
  couponTdDiscount: decimal("coupon_td_discount", { precision: 10, scale: 2 }).default("0"),
  
  shippingName: varchar("shipping_name").notNull(),
  shippingEmail: varchar("shipping_email").notNull(),
  shippingPhone: varchar("shipping_phone").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: varchar("shipping_city"),
  shippingPostalCode: varchar("shipping_postal_code"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => listings.id),
  productTitle: varchar("product_title").notNull(),
  productPrice: decimal("product_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Transactions table for tracking Stripe payments and commissions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id),
  serviceRequestId: varchar("service_request_id"), // For service request fee transactions
  vendorId: varchar("vendor_id").notNull().references(() => users.id), // Vendor who receives the payment
  customerId: varchar("customer_id").notNull().references(() => users.id), // Customer who made the payment
  
  // Stripe payment details
  stripePaymentIntentId: varchar("stripe_payment_intent_id").unique(),
  stripeChargeId: varchar("stripe_charge_id"),
  
  // Payment method and amounts (in HKD)
  paymentMethod: varchar("payment_method").notNull().default('cash'), // 'cash' | 'timedollar' | 'both' | 'service_request'
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(), // Total payment amount
  cashAmount: decimal("cash_amount", { precision: 10, scale: 2 }).default('0'), // Amount paid in cash (HKD)
  tdAmount: decimal("td_amount", { precision: 10, scale: 2 }).default('0'), // Amount paid in TimeDollars (TD)
  platformCommission: decimal("platform_commission", { precision: 10, scale: 2 }).notNull(), // 5% commission for admin (or 100% for service requests)
  vendorEarnings: decimal("vendor_earnings", { precision: 10, scale: 2 }).notNull(), // 95% earnings for vendor (or 0 for service requests)
  
  // Payment status
  status: varchar("status").notNull().default("pending"), // 'pending' | 'completed' | 'failed' | 'refunded'
  currency: varchar("currency").notNull().default("hkd"),
  
  // Metadata
  description: text("description"),
  metadata: jsonb("metadata"), // Additional Stripe metadata
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

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
  address: z.string().optional().nullable(),
  city: z.string().optional(),
  website: z.string().optional().nullable(),
  
  // Status field - pending (awaiting approval), published (approved and live), rejected (not approved)
  status: z.enum(["pending", "published", "rejected", "draft"]).optional().default("pending"),
  
  // Event date fields - accept ISO strings and transform to Date objects
  eventDate: z.union([z.date(), z.string().transform((str) => new Date(str))]).optional(),
  eventEndDate: z.union([z.date(), z.string().transform((str) => new Date(str))]).optional(),
  
  // Numeric fields - accept both string and number, transform to number
  eventPrice: z.union([z.number(), z.string().transform((s) => s ? parseFloat(s) : undefined)]).optional().nullable(),
  capacity: z.union([z.number(), z.string().transform((s) => s ? parseInt(s) : undefined)]).optional().nullable(),
  price: z.union([z.number(), z.string().transform((s) => s ? parseFloat(s) : undefined)]).optional().nullable(),
  inventory: z.union([z.number(), z.string().transform((s) => s ? parseInt(s) : undefined)]).optional().nullable(),
  timedollarPercentage: z.union([z.number(), z.string().transform((s) => s ? parseInt(s) : undefined)]).optional().nullable(),
  cashPercentage: z.union([z.number(), z.string().transform((s) => s ? parseInt(s) : undefined)]).optional().nullable(),
  
  // Optional arrays
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
}).passthrough();

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  vendorId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

// Form schema for user registration (excludes server-set fields)
export const eventRegistrationFormSchema = insertEventRegistrationSchema.omit({
  eventId: true,
  userId: true,
  status: true,
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  usedCount: true,
  approvedBy: true,
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

// ========================================
// MESSAGING SYSTEM
// ========================================

// Conversations table - tracks conversations between customers and vendors
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  vendorId: varchar("vendor_id").notNull().references(() => users.id),
  productId: varchar("product_id").references(() => listings.id), // Optional: conversation about a specific product
  productTitle: varchar("product_title"), // Cached product title for display
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  lastMessage: text("last_message"), // Cached for preview
  unreadByCustomer: integer("unread_by_customer").default(0), // Unread count for customer
  unreadByVendor: integer("unread_by_vendor").default(0), // Unread count for vendor
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

// Messages table - individual messages within conversations
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  senderRole: varchar("sender_role").notNull(), // 'customer' | 'vendor' - for quick filtering
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Support Tickets table - for user support and enquiries
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id), // User who submitted the ticket
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  issueType: varchar("issue_type").default("general"), // 'general' | 'support' | 'sales' | 'listing' | 'mediator' | 'other'
  attachmentUrl: varchar("attachment_url"), // Optional file attachment (image or document)
  status: varchar("status").notNull().default("open"), // 'open' | 'assigned' | 'pending' | 'closed'
  priority: varchar("priority").default("normal"), // 'low' | 'normal' | 'high' | 'urgent'
  assignedTo: varchar("assigned_to").references(() => users.id), // Staff member assigned to handle ticket
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

// Support Ticket Messages table - for conversations within support tickets
// Messages are sent directly between assigned staff and the ticket submitter
export const supportTicketMessages = pgTable("support_ticket_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").notNull().references(() => supportTickets.id, { onDelete: 'cascade' }),
  senderId: varchar("sender_id").notNull().references(() => users.id), // Who sent the message
  receiverId: varchar("receiver_id").notNull().references(() => users.id), // Who receives the message (user or staff, never admin)
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false), // Track if message has been read
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSupportTicketMessageSchema = createInsertSchema(supportTicketMessages).omit({
  id: true,
  createdAt: true,
});

export type SupportTicketMessage = typeof supportTicketMessages.$inferSelect;
export type InsertSupportTicketMessage = z.infer<typeof insertSupportTicketMessageSchema>;

// Staff Audit Logs table - for tracking all staff actions
export const staffAuditLogs = pgTable("staff_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").notNull().references(() => users.id),
  staffUsername: varchar("staff_username").notNull(),
  staffRole: varchar("staff_role").notNull(), // The staff's role at time of action
  action: varchar("action").notNull(), // 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'assign' | 'message'
  entityType: varchar("entity_type").notNull(), // 'ticket' | 'listing' | 'refund' | 'dispute' | 'user' | 'coupon'
  entityId: varchar("entity_id"),
  entityTitle: varchar("entity_title"),
  description: text("description").notNull(),
  metadata: text("metadata"), // JSON string with additional details
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStaffAuditLogSchema = createInsertSchema(staffAuditLogs).omit({
  id: true,
  createdAt: true,
});

export type StaffAuditLog = typeof staffAuditLogs.$inferSelect;
export type InsertStaffAuditLog = z.infer<typeof insertStaffAuditLogSchema>;

// TimeDollar Wallet table - each user has one wallet
export const tdWallet = pgTable("td_wallet", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  tdBalance: decimal("td_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  tdEarned: decimal("td_earned", { precision: 10, scale: 2 }).notNull().default("0"),
  tdSpent: decimal("td_spent", { precision: 10, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTdWalletSchema = createInsertSchema(tdWallet).omit({
  id: true,
  updatedAt: true,
});

export type TdWallet = typeof tdWallet.$inferSelect;
export type InsertTdWallet = z.infer<typeof insertTdWalletSchema>;

// TimeDollar Transactions table - tracks all TD earnings and spending
export const tdTransactions = pgTable("td_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'earn' | 'spend'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  listingId: varchar("listing_id").references(() => listings.id),
  orderId: varchar("order_id").references(() => orders.id),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTdTransactionSchema = createInsertSchema(tdTransactions).omit({
  id: true,
  createdAt: true,
});

export type TdTransaction = typeof tdTransactions.$inferSelect;
export type InsertTdTransaction = z.infer<typeof insertTdTransactionSchema>;

// TimeDollar Conversions table - tracks TD to coupon conversions
export const tdConversions = pgTable("td_conversions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tdSpent: decimal("td_spent", { precision: 10, scale: 2 }).notNull(),
  couponCode: varchar("coupon_code").notNull(),
  couponId: varchar("coupon_id").references(() => coupons.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTdConversionSchema = createInsertSchema(tdConversions).omit({
  id: true,
  createdAt: true,
});

export type TdConversion = typeof tdConversions.$inferSelect;
export type InsertTdConversion = z.infer<typeof insertTdConversionSchema>;

// TimeDollar Disputes table - for handling TD transaction disputes
export const tdDisputes = pgTable("td_disputes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  mediatorId: varchar("mediator_id").references(() => users.id), // Staff member assigned to mediate
  status: varchar("status").notNull().default("open"), // 'open' | 'in_review' | 'resolved' | 'closed'
  reason: text("reason").notNull(),
  deadline: timestamp("deadline"),
  resolutionNote: text("resolution_note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTdDisputeSchema = createInsertSchema(tdDisputes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TdDispute = typeof tdDisputes.$inferSelect;
export type InsertTdDispute = z.infer<typeof insertTdDisputeSchema>;

// Service Requests table - for user/vendor service requests to admin
export const serviceRequests = pgTable("service_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  requesterType: varchar("requester_type").notNull(), // 'user' | 'vendor'
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
  preferredDate: varchar("preferred_date"),
  status: varchar("status").notNull().default("pending"), // 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected'
  assignedAdminId: varchar("assigned_admin_id").references(() => users.id),
  completedAt: timestamp("completed_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  status: true,
  assignedAdminId: true,
  completedAt: true,
  rejectionReason: true,
  createdAt: true,
  updatedAt: true,
});

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;

// Service Request Messages table - for live chat within service requests
export const serviceRequestMessages = pgTable("service_request_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceRequestId: varchar("service_request_id").notNull().references(() => serviceRequests.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  attachmentUrl: varchar("attachment_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceRequestMessageSchema = createInsertSchema(serviceRequestMessages).omit({
  id: true,
  createdAt: true,
});

export type ServiceRequestMessage = typeof serviceRequestMessages.$inferSelect;
export type InsertServiceRequestMessage = z.infer<typeof insertServiceRequestMessageSchema>;

// Service Offers table - for admin to create offers for service requests
export const serviceOffers = pgTable("service_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceRequestId: varchar("service_request_id").notNull().references(() => serviceRequests.id),
  serviceName: varchar("service_name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  hours: decimal("hours", { precision: 5, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // 'pending' | 'accepted' | 'paid' | 'cancelled'
  paymentIntentId: varchar("payment_intent_id"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServiceOfferSchema = createInsertSchema(serviceOffers).omit({
  id: true,
  status: true,
  paymentIntentId: true,
  createdAt: true,
  updatedAt: true,
});

export type ServiceOffer = typeof serviceOffers.$inferSelect;
export type InsertServiceOffer = z.infer<typeof insertServiceOfferSchema>;

// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;

export type CouponUsage = typeof couponUsage.$inferSelect;

// Legacy types (deprecated)
export type BusinessListing = typeof businessListings.$inferSelect;
export type InsertBusinessListing = z.infer<typeof insertBusinessListingSchema>;
