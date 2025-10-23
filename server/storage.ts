import {
  users,
  businessListings,
  categories,
  listings,
  bookings,
  orders,
  orderItems,
  coupons,
  couponUsage,
  vendorRequests,
  staffHelpRequests,
  activityLogs,
  transactions,
  type User,
  type InsertUser,
  type BusinessListing,
  type InsertBusinessListing,
  type Category,
  type InsertCategory,
  type Listing,
  type InsertListing,
  type Booking,
  type InsertBooking,
  type Coupon,
  type InsertCoupon,
  type CouponUsage,
  type VendorRequest,
  type InsertVendorRequest,
  type StaffHelpRequest,
  type InsertStaffHelpRequest,
  type ActivityLog,
  type Transaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, or, and, ilike, inArray, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations for email/password authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(id: string): Promise<void>;
  updateUserRole(id: string, role: string): Promise<User>;
  updateUserProfile(id: string, data: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'phone' | 'profileImageUrl'>>): Promise<User>;
  updateUserPassword(id: string, password: string): Promise<User>;
  setPasswordResetToken(email: string, token: string, expires: Date): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  clearPasswordResetToken(id: string): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  
  // Enhanced listing operations
  createListing(listing: InsertListing & { userId: string }): Promise<Listing>;
  getListings(filters?: { 
    categories?: string[],
    categoryId?: string,
    type?: string, 
    search?: string,
    isOnlineOnly?: boolean,
    status?: string
  }): Promise<Listing[]>;
  getUserListings(userId: string): Promise<Listing[]>;
  getListing(id: string): Promise<Listing | undefined>;
  updateListing(id: string, listing: Partial<InsertListing>): Promise<Listing>;
  deleteListing(id: string): Promise<void>;
  
  // Booking operations
  createBooking(booking: InsertBooking & { userId: string }): Promise<Booking>;
  getUserBookings(userId: string): Promise<Booking[]>;
  getListingBookings(listingId: string): Promise<Booking[]>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking>;
  
  // Coupon operations
  getCoupon(code: string): Promise<Coupon | undefined>;
  getCouponById(id: string): Promise<Coupon | undefined>;
  validateCoupon(code: string, vendorId: string | null, totalAmount: number, productIds?: string[]): Promise<{ 
    valid: boolean; 
    discount: number;
    coupon?: Coupon;
    error?: string;
  }>;
  useCoupon(couponId: string, userId: string, orderId: string, discount: number): Promise<void>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  getVendorCoupons(vendorId: string): Promise<Coupon[]>;
  getAllCoupons(filters?: { status?: string; issuer?: string }): Promise<Coupon[]>;
  getCouponUsage(couponId: string): Promise<any[]>;
  getCouponAnalytics(couponId: string): Promise<{ totalUsed: number; totalDiscount: number; users: any[] }>;
  updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<Coupon>;
  approveCoupon(id: string, adminId: string): Promise<Coupon>;
  rejectCoupon(id: string, adminId: string, reason: string): Promise<Coupon>;
  deleteCoupon(id: string): Promise<void>;
  
  // Admin moderation operations
  getModerationQueue(status?: string): Promise<Listing[]>;
  adminApproveListing(id: string, adminId: string, notes?: string): Promise<Listing>;
  adminRejectListing(id: string, adminId: string, reason: string): Promise<Listing>;
  getAllUsers(): Promise<User[]>;
  
  // User management operations
  getUsersWithFilters(filters?: {
    search?: string;
    role?: string;
    status?: string;
    vendorStatus?: string;
  }): Promise<User[]>;
  updateUser(id: string, data: Partial<Pick<User, 'username' | 'firstName' | 'lastName' | 'email' | 'phone' | 'bio' | 'profileImageUrl' | 'role' | 'vendorStatus' | 'status' | 'timeDollarBalance' | 'tdCashSplitPercentage'>>): Promise<User>;
  suspendUser(id: string, adminId: string): Promise<User>;
  reactivateUser(id: string, adminId: string): Promise<User>;
  adminResetUserPassword(id: string, newPassword: string): Promise<User>;
  
  // Soft delete and restore operations
  softDeleteListing(id: string): Promise<Listing>;
  restoreListing(id: string): Promise<Listing>;
  getDeletedListings(): Promise<Listing[]>;
  getUserDeletedListings(userId: string): Promise<Listing[]>;
  permanentlyDeleteListing(id: string): Promise<void>;
  updateListingStatus(id: string, status: string): Promise<Listing>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<{
    totalListings: number;
    publishedListings: number;
    draftListings: number;
    deletedListings: number;
    totalUsers: number;
    activeUsersDaily: number;
    activeUsersWeekly: number;
    activeUsersMonthly: number;
    totalSales: string;
    commission: string;
    timeBankTotal: string;
    recentSignups: Array<{ id: string; username: string; email: string; role: string; createdAt: Date | null }>;
    recentOrders: Array<any>;
    recentCouponRedemptions: Array<any>;
  }>;
  
  // Vendor request operations
  createVendorRequest(request: InsertVendorRequest & { userId: string }): Promise<VendorRequest>;
  getVendorRequests(status?: string): Promise<VendorRequest[]>;
  getUserVendorRequest(userId: string): Promise<VendorRequest | undefined>;
  approveVendorRequest(id: string, adminId: string): Promise<VendorRequest>;
  rejectVendorRequest(id: string, adminId: string, reason: string): Promise<VendorRequest>;
  updateUserVendorStatus(userId: string, status: string): Promise<User>;
  
  // Staff help request operations
  createStaffHelpRequest(request: InsertStaffHelpRequest & { userId: string; userName: string }): Promise<StaffHelpRequest>;
  getAllStaffHelpRequests(status?: string): Promise<StaffHelpRequest[]>;
  getUserStaffHelpRequests(userId: string): Promise<StaffHelpRequest[]>;
  updateStaffHelpRequest(id: string, data: Partial<StaffHelpRequest>): Promise<StaffHelpRequest>;
  assignStaffHelpRequest(id: string, staffId: string): Promise<StaffHelpRequest>;
  completeStaffHelpRequest(id: string, notes: string): Promise<StaffHelpRequest>;
  
  // Activity log operations
  createActivityLog(log: {
    userId: string;
    userName: string;
    actionType: string;
    entityType: string;
    entityId?: string;
    entityTitle?: string;
    description: string;
    metadata?: any;
  }): Promise<ActivityLog>;
  getAllActivityLogs(limit?: number): Promise<ActivityLog[]>;
  getUserActivityLogs(userId: string, limit?: number): Promise<ActivityLog[]>;
  
  // Analytics operations
  getAnalytics(): Promise<{
    userGrowth: Array<{ date: string; count: number }>;
    topUsersByActivity: Array<{ id: string; username: string; email: string; activityCount: number }>;
    topUsersBySpend: Array<{ id: string; username: string; email: string; totalSpent: string }>;
    salesVolume: string;
    averageOrderValue: string;
    topCategories: Array<{ category: string; count: number; revenue: string }>;
    topProducts: Array<{ id: string; title: string; orderCount: number; revenue: string }>;
    tdEarned: string;
    tdSpent: string;
    topTdContributors: Array<{ id: string; username: string; balance: number }>;
    couponRedemptionRate: string;
  }>;
  
  // TimeDollar operations
  updateTimeDollarBalance(userId: string, amount: number): Promise<User>;
  getTimeDollarBalance(userId: string): Promise<number>;
  
  // Shopping cart operations
  getUserCartItems(userId: string): Promise<any[]>;
  addToCart(userId: string, productId: string, quantity: number): Promise<any>;
  updateCartItemQuantity(itemId: string, quantity: number): Promise<any>;
  removeCartItem(itemId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  createOrder(userId: string, orderData: any): Promise<any>;
  getUserOrders(userId: string): Promise<any[]>;
  getVendorOrders(vendorId: string): Promise<any[]>;
  getOrderDetails(orderId: string): Promise<any>;
  updateOrderPaymentStatus(orderId: string, status: string, paymentIntentId: string): Promise<any>;
  updateOrderStatus(orderId: string, status: string): Promise<any>;
  
  // Transaction operations (Stripe payments)
  createTransaction(transaction: any): Promise<any>;
  getAllTransactions(): Promise<any[]>;
  getTransactionById(id: string): Promise<any | undefined>;
  getVendorTransactions(vendorId: string): Promise<any[]>;
  updateTransactionByPaymentIntent(paymentIntentId: string, updates: any): Promise<any>;
  
  // Legacy business listing operations (deprecated)
  createBusinessListing(listing: any): Promise<BusinessListing>;
  getBusinessListings(): Promise<BusinessListing[]>;
  getUserBusinessListings(userId: string): Promise<BusinessListing[]>;
  updateBusinessListing(id: string, listing: any): Promise<BusinessListing>;
  deleteBusinessListing(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations for email/password authentication

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.createdAt);
  }
  
  async getUsersWithFilters(filters?: {
    search?: string;
    role?: string;
    status?: string;
    vendorStatus?: string;
  }): Promise<User[]> {
    const conditions = [];
    
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(users.username, searchTerm),
          ilike(users.email, searchTerm),
          ilike(users.firstName, searchTerm),
          ilike(users.lastName, searchTerm),
          ilike(users.phone, searchTerm)
        )
      );
    }
    
    if (filters?.role) {
      conditions.push(eq(users.role, filters.role));
    }
    
    if (filters?.status) {
      conditions.push(eq(users.status, filters.status));
    }
    
    if (filters?.vendorStatus) {
      conditions.push(eq(users.vendorStatus, filters.vendorStatus));
    }
    
    const query = db.select().from(users);
    
    if (conditions.length > 0) {
      return query.where(and(...conditions)).orderBy(users.createdAt);
    }
    
    return query.orderBy(users.createdAt);
  }
  
  async updateUser(id: string, data: Partial<Pick<User, 'username' | 'firstName' | 'lastName' | 'email' | 'phone' | 'bio' | 'profileImageUrl' | 'role' | 'vendorStatus' | 'status' | 'timeDollarBalance' | 'tdCashSplitPercentage'>>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }
  
  async suspendUser(id: string, adminId: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ status: 'suspended', updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    // Log the activity
    const user = await this.getUser(id);
    const admin = await this.getUser(adminId);
    
    if (user && admin) {
      await this.createActivityLog({
        userId: adminId,
        userName: admin.username,
        actionType: 'suspend',
        entityType: 'user',
        entityId: id,
        entityTitle: user.username,
        description: `Suspended user: ${user.username}`,
        metadata: { adminId, userId: id }
      });
    }
    
    return updated;
  }
  
  async reactivateUser(id: string, adminId: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ status: 'active', updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    // Log the activity
    const user = await this.getUser(id);
    const admin = await this.getUser(adminId);
    
    if (user && admin) {
      await this.createActivityLog({
        userId: adminId,
        userName: admin.username,
        actionType: 'reactivate',
        entityType: 'user',
        entityId: id,
        entityTitle: user.username,
        description: `Reactivated user: ${user.username}`,
        metadata: { adminId, userId: id }
      });
    }
    
    return updated;
  }
  
  async adminResetUserPassword(id: string, newPassword: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ 
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    // Delete all related records before deleting the user
    // 1. Delete user's listings
    await db.delete(listings).where(eq(listings.userId, id));
    
    // 2. Clear moderatedBy references in listings
    await db.update(listings)
      .set({ moderatedBy: null })
      .where(eq(listings.moderatedBy, id));
    
    // 3. Delete user's bookings
    await db.delete(bookings).where(eq(bookings.userId, id));
    
    // 4. Delete user's business listings (deprecated table)
    await db.delete(businessListings).where(eq(businessListings.userId, id));
    
    // 5. Delete user's vendor requests
    await db.delete(vendorRequests).where(eq(vendorRequests.userId, id));
    
    // 6. Clear reviewedBy references in vendor requests
    await db.update(vendorRequests)
      .set({ reviewedBy: null })
      .where(eq(vendorRequests.reviewedBy, id));
    
    // Finally, delete the user
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUserProfile(id: string, data: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'phone' | 'profileImageUrl'>>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        ...data,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        role,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPassword(id: string, password: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        password,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async setPasswordResetToken(email: string, token: string, expires: Date): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        resetPasswordToken: token,
        resetPasswordExpires: expires,
        updatedAt: new Date()
      })
      .where(eq(users.email, email))
      .returning();
    return user;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetPasswordToken, token));
    return user;
  }

  async clearPasswordResetToken(id: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        resetPasswordToken: null,
        resetPasswordExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(categoryData)
      .returning();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Enhanced listing operations
  async createListing(listingData: InsertListing & { userId: string }): Promise<Listing> {
    const [listing] = await db
      .insert(listings)
      .values(listingData as any)
      .returning();
    return listing;
  }

  async getListings(filters?: { 
    categories?: string[],
    categoryId?: string,
    type?: string, 
    search?: string,
    isOnlineOnly?: boolean,
    status?: string
  }): Promise<Listing[]> {
    // Only show published, active, and non-deleted listings for public directory
    let conditions = [
      eq(listings.isActive, true),
      sql`${listings.deletedAt} IS NULL`
    ];
    
    // Filter by status - default to published for public listings
    const statusFilter = filters?.status || 'published';
    conditions.push(eq(listings.status, statusFilter));
    
    if (filters?.categories && filters.categories.length > 0) {
      conditions.push(inArray(listings.categoryId, filters.categories));
    }
    
    if (filters?.categoryId) {
      conditions.push(eq(listings.categoryId, filters.categoryId));
    }
    
    if (filters?.type) {
      conditions.push(eq(listings.type, filters.type));
    }
    
    if (filters?.search) {
      const searchCondition = or(
        ilike(listings.title, `%${filters.search}%`),
        ilike(listings.description, `%${filters.search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }
    
    if (filters?.isOnlineOnly !== undefined) {
      conditions.push(eq(listings.isOnlineOnly, filters.isOnlineOnly));
    }
    
    return db.select().from(listings).where(and(...conditions));
  }

  async getUserListings(userId: string): Promise<Listing[]> {
    // Return all user listings regardless of moderation status for "My Listings" page
    // Exclude soft-deleted items (those in recycle bin)
    return db.select().from(listings).where(and(
      eq(listings.userId, userId),
      sql`${listings.deletedAt} IS NULL`
    ));
  }

  async getListing(id: string): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing;
  }

  async updateListing(id: string, listingData: Partial<InsertListing>): Promise<Listing> {
    const [listing] = await db
      .update(listings)
      .set({ ...listingData, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }

  async deleteListing(id: string): Promise<void> {
    // Soft delete - set deletedAt timestamp instead of actually deleting
    await db
      .update(listings)
      .set({ deletedAt: new Date() })
      .where(eq(listings.id, id));
  }

  // Booking operations
  async createBooking(bookingData: InsertBooking & { userId: string }): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(bookingData)
      .returning();
    return booking;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getListingBookings(listingId: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.listingId, listingId));
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Coupon operations
  async getCoupon(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    return coupon;
  }

  async validateCoupon(code: string, vendorId: string | null, totalAmount: number, productIds?: string[]): Promise<{ 
    valid: boolean; 
    discount: number;
    coupon?: Coupon;
    error?: string;
  }> {
    const coupon = await this.getCoupon(code);
    
    console.log('Validating coupon:', { code, vendorId, totalAmount, productIds, coupon: coupon ? { 
      id: coupon.id, 
      couponType: coupon.couponType,
      issuer: coupon.issuer,
      scope: coupon.scope,
      vendorId: coupon.vendorId, 
      productId: coupon.productId,
      status: coupon.status 
    } : null });
    
    if (!coupon) {
      return { valid: false, discount: 0, error: 'Coupon not found' };
    }

    // Check status - vendor coupons must be approved, admin coupons can be active
    if (coupon.issuer === 'vendor' && coupon.status !== 'approved') {
      console.log('Vendor coupon not approved:', { status: coupon.status });
      return { valid: false, discount: 0, error: 'This coupon is not yet approved or is inactive' };
    }
    
    if (coupon.issuer === 'admin' && coupon.status !== 'approved' && coupon.status !== 'active') {
      console.log('Admin coupon not active:', { status: coupon.status });
      return { valid: false, discount: 0, error: 'This coupon is not active' };
    }

    // Check vendor ownership for vendor-issued coupons
    if (coupon.issuer === 'vendor' && coupon.vendorId !== vendorId) {
      console.log('Vendor coupon not valid for this vendor:', { couponVendorId: coupon.vendorId, cartVendorId: vendorId });
      return { valid: false, discount: 0, error: 'This coupon is only valid for products from its issuing vendor' };
    }

    // Check scope: platform-wide vs product-specific
    if (coupon.scope === 'product') {
      // Product-specific coupon - must have productId and it must be in cart
      if (!coupon.productId) {
        console.log('Product-specific coupon missing productId');
        return { valid: false, discount: 0, error: 'Invalid coupon configuration' };
      }
      
      if (!productIds || productIds.length === 0) {
        console.log('Product-specific coupon but no products in cart');
        return { valid: false, discount: 0, error: 'This coupon requires specific products in your cart' };
      }
      
      if (!productIds.includes(coupon.productId)) {
        console.log('Required product not in cart:', { requiredProductId: coupon.productId, cartProductIds: productIds });
        return { valid: false, discount: 0, error: 'This coupon is only valid for a specific product not in your cart' };
      }
    }
    // Platform-wide coupons (scope === 'platform') can be used with any products
    
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return { valid: false, discount: 0, error: 'Coupon is not yet valid' };
    }

    if (coupon.validUntil && now > coupon.validUntil) {
      return { valid: false, discount: 0, error: 'Coupon has expired' };
    }
    
    if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
      return { valid: false, discount: 0, error: 'Coupon usage limit reached' };
    }
    
    let discount = 0;

    // Calculate discount based on coupon type
    if (coupon.couponType === 'cash') {
      // Cash coupon: provides fixed cash value
      discount = Number(coupon.cashValue || 0);
    } else if (coupon.couponType === 'discount') {
      // Discount coupon: percentage or fixed amount off
      if (coupon.discountType === 'percentage') {
        discount = (totalAmount * Number(coupon.discountValue || 0)) / 100;
      } else if (coupon.discountType === 'fixed') {
        discount = Number(coupon.discountValue || 0);
      }
    }

    // Ensure discount doesn't exceed total amount
    discount = Math.min(discount, totalAmount);
    
    return { valid: true, discount, coupon };
  }

  async getCouponById(id: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon;
  }

  async useCoupon(couponId: string, userId: string, orderId: string, discount: number): Promise<void> {
    // Increment used count
    await db
      .update(coupons)
      .set({ usedCount: sql`used_count + 1` })
      .where(eq(coupons.id, couponId));

    // Record usage
    await db.insert(couponUsage).values({
      couponId,
      userId,
      orderId,
      cashDiscount: discount.toString(),
      tdDiscount: "0",
    });
  }

  async getCouponUsage(couponId: string): Promise<any[]> {
    const usage = await db
      .select({
        id: couponUsage.id,
        userId: couponUsage.userId,
        userName: users.username,
        userEmail: users.email,
        orderId: couponUsage.orderId,
        cashDiscount: couponUsage.cashDiscount,
        tdDiscount: couponUsage.tdDiscount,
        createdAt: couponUsage.createdAt,
      })
      .from(couponUsage)
      .leftJoin(users, eq(couponUsage.userId, users.id))
      .where(eq(couponUsage.couponId, couponId))
      .orderBy(couponUsage.createdAt);
    
    return usage;
  }

  async getCouponAnalytics(couponId: string): Promise<{ totalUsed: number; totalDiscount: number; users: any[] }> {
    const usage = await this.getCouponUsage(couponId);
    
    const totalUsed = usage.length;
    const totalDiscount = usage.reduce((sum, u) => sum + Number(u.cashDiscount || 0), 0);
    
    return {
      totalUsed,
      totalDiscount,
      users: usage,
    };
  }

  // Legacy business listing operations (deprecated but maintained for compatibility)
  async createBusinessListing(listingData: any): Promise<BusinessListing> {
    const [listing] = await db
      .insert(businessListings)
      .values(listingData)
      .returning();
    return listing;
  }

  async getBusinessListings(): Promise<BusinessListing[]> {
    return db.select().from(businessListings);
  }

  async getUserBusinessListings(userId: string): Promise<BusinessListing[]> {
    return db.select().from(businessListings).where(eq(businessListings.userId, userId));
  }

  async updateBusinessListing(id: string, listingData: any): Promise<BusinessListing> {
    const [listing] = await db
      .update(businessListings)
      .set({ ...listingData, updatedAt: new Date() })
      .where(eq(businessListings.id, id))
      .returning();
    return listing;
  }

  async deleteBusinessListing(id: string): Promise<void> {
    await db.delete(businessListings).where(eq(businessListings.id, id));
  }

  // Admin moderation operations implementation
  async getModerationQueue(status?: string): Promise<Listing[]> {
    let conditions = [
      eq(listings.isActive, true),
      sql`${listings.deletedAt} IS NULL`
    ];
    
    if (status) {
      conditions.push(eq(listings.moderationStatus, status));
    }
    
    return db.select().from(listings).where(and(...conditions));
  }

  async getListingsByStatus(status?: string): Promise<Listing[]> {
    if (status) {
      return db.select().from(listings).where(
        and(
          eq(listings.isActive, true), 
          eq(listings.moderationStatus, status),
          sql`${listings.deletedAt} IS NULL`
        )
      );
    }
    return db.select().from(listings).where(
      and(
        eq(listings.isActive, true),
        sql`${listings.deletedAt} IS NULL`
      )
    );
  }

  async adminApproveListing(id: string, adminId: string, notes?: string): Promise<Listing> {
    const [listing] = await db
      .update(listings)
      .set({ 
        moderationStatus: "approved",
        moderationNotes: notes || null,
        moderatedBy: adminId,
        moderatedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }

  async adminRejectListing(id: string, adminId: string, reason: string): Promise<Listing> {
    const [listing] = await db
      .update(listings)
      .set({ 
        moderationStatus: "rejected",
        moderationNotes: reason,
        moderatedBy: adminId,
        moderatedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }
  
  // Soft delete and restore operations
  async softDeleteListing(id: string): Promise<Listing> {
    const [listing] = await db
      .update(listings)
      .set({ 
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }
  
  async restoreListing(id: string): Promise<Listing> {
    const [listing] = await db
      .update(listings)
      .set({ 
        deletedAt: null,
        updatedAt: new Date()
      })
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }
  
  async getDeletedListings(): Promise<Listing[]> {
    return db.select().from(listings).where(sql`${listings.deletedAt} IS NOT NULL`);
  }
  
  async getUserDeletedListings(userId: string): Promise<Listing[]> {
    return db.select().from(listings).where(and(
      eq(listings.userId, userId),
      sql`${listings.deletedAt} IS NOT NULL`
    ));
  }
  
  async permanentlyDeleteListing(id: string): Promise<void> {
    await db.delete(listings).where(eq(listings.id, id));
  }
  
  async updateListingStatus(id: string, status: string): Promise<Listing> {
    const [listing] = await db
      .update(listings)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }
  
  // Dashboard statistics
  async getDashboardStats(): Promise<{
    totalListings: number;
    publishedListings: number;
    draftListings: number;
    deletedListings: number;
    totalUsers: number;
    activeUsersDaily: number;
    activeUsersWeekly: number;
    activeUsersMonthly: number;
    totalSales: string;
    commission: string;
    timeBankTotal: string;
    recentSignups: Array<{ id: string; username: string; email: string; role: string; createdAt: Date | null }>;
    recentOrders: Array<any>;
    recentCouponRedemptions: Array<any>;
  }> {
    // Count total listings (excluding deleted)
    const totalListingsResult = await db.select({ count: sql<number>`count(*)` })
      .from(listings)
      .where(sql`${listings.deletedAt} IS NULL`);
    
    // Count published listings
    const publishedListingsResult = await db.select({ count: sql<number>`count(*)` })
      .from(listings)
      .where(and(
        eq(listings.status, 'published'),
        sql`${listings.deletedAt} IS NULL`
      ));
    
    // Count draft listings
    const draftListingsResult = await db.select({ count: sql<number>`count(*)` })
      .from(listings)
      .where(and(
        eq(listings.status, 'draft'),
        sql`${listings.deletedAt} IS NULL`
      ));
    
    // Count deleted listings
    const deletedListingsResult = await db.select({ count: sql<number>`count(*)` })
      .from(listings)
      .where(sql`${listings.deletedAt} IS NOT NULL`);
    
    // Count total users
    const totalUsersResult = await db.select({ count: sql<number>`count(*)` })
      .from(users);
    
    // Active users (based on updatedAt as a proxy for activity)
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const activeUsersDailyResult = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.updatedAt} >= ${oneDayAgo}`);
    
    const activeUsersWeeklyResult = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.updatedAt} >= ${oneWeekAgo}`);
    
    const activeUsersMonthlyResult = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.updatedAt} >= ${oneMonthAgo}`);
    
    // Total sales from orders
    const totalSalesResult = await db.select({ 
      total: sql<string>`COALESCE(SUM(CAST(${orders.totalAmount} AS NUMERIC)), 0)` 
    }).from(orders);
    
    const totalSales = totalSalesResult[0]?.total || '0';
    const commission = (parseFloat(totalSales) * 0.05).toFixed(2); // 5% platform commission
    
    // TimeBank total (sum of all user balances)
    const timeBankTotalResult = await db.select({ 
      total: sql<string>`COALESCE(SUM(${users.timeDollarBalance}), 0)` 
    }).from(users);
    
    const timeBankTotal = timeBankTotalResult[0]?.total || '0';
    
    // Recent signups (last 10 users)
    const recentSignups = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(sql`${users.createdAt} DESC`)
    .limit(10);
    
    // Recent orders (last 10 orders with user info)
    const recentOrders = await db.select({
      id: orders.id,
      userId: orders.userId,
      username: users.username,
      totalAmount: orders.totalAmount,
      cashAmount: orders.cashAmount,
      tdAmount: orders.tdAmount,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(sql`${orders.createdAt} DESC`)
    .limit(10);
    
    // Recent coupon redemptions (last 10 orders with coupons)
    const recentCouponRedemptions = await db.select({
      id: orders.id,
      userId: orders.userId,
      username: users.username,
      couponCode: orders.couponCode,
      couponCashDiscount: orders.couponCashDiscount,
      couponTdDiscount: orders.couponTdDiscount,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(sql`${orders.couponId} IS NOT NULL`)
    .orderBy(sql`${orders.createdAt} DESC`)
    .limit(10);
    
    return {
      totalListings: Number(totalListingsResult[0]?.count || 0),
      publishedListings: Number(publishedListingsResult[0]?.count || 0),
      draftListings: Number(draftListingsResult[0]?.count || 0),
      deletedListings: Number(deletedListingsResult[0]?.count || 0),
      totalUsers: Number(totalUsersResult[0]?.count || 0),
      activeUsersDaily: Number(activeUsersDailyResult[0]?.count || 0),
      activeUsersWeekly: Number(activeUsersWeeklyResult[0]?.count || 0),
      activeUsersMonthly: Number(activeUsersMonthlyResult[0]?.count || 0),
      totalSales,
      commission,
      timeBankTotal,
      recentSignups: recentSignups.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role || 'consumer',
        createdAt: u.createdAt,
      })),
      recentOrders,
      recentCouponRedemptions,
    };
  }

  // Analytics
  async getAnalytics(): Promise<{
    userGrowth: Array<{ date: string; count: number }>;
    topUsersByActivity: Array<{ id: string; username: string; email: string; activityCount: number }>;
    topUsersBySpend: Array<{ id: string; username: string; email: string; totalSpent: string }>;
    salesVolume: string;
    averageOrderValue: string;
    topCategories: Array<{ category: string; count: number; revenue: string }>;
    topProducts: Array<{ id: string; title: string; orderCount: number; revenue: string }>;
    tdEarned: string;
    tdSpent: string;
    topTdContributors: Array<{ id: string; username: string; balance: number }>;
    couponRedemptionRate: string;
  }> {
    
    // User growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userGrowthData = await db.select({
      date: sql<string>`DATE(${users.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(users)
    .where(sql`${users.createdAt} >= ${thirtyDaysAgo}`)
    .groupBy(sql`DATE(${users.createdAt})`)
    .orderBy(sql`DATE(${users.createdAt})`);
    
    const userGrowth = userGrowthData.map(row => ({
      date: row.date || '',
      count: Number(row.count || 0),
    }));
    
    // Top users by activity
    const topActivityUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      activityCount: sql<number>`count(${activityLogs.id})`,
    })
    .from(users)
    .leftJoin(activityLogs, eq(users.id, activityLogs.userId))
    .groupBy(users.id, users.username, users.email)
    .orderBy(sql`count(${activityLogs.id}) DESC`)
    .limit(10);
    
    const topUsersByActivity = topActivityUsers.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      activityCount: Number(u.activityCount || 0),
    }));
    
    // Top users by spend
    const topSpendUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      totalSpent: sql<string>`COALESCE(SUM(CAST(${orders.totalAmount} AS NUMERIC)), 0)`,
    })
    .from(users)
    .leftJoin(orders, eq(users.id, orders.userId))
    .groupBy(users.id, users.username, users.email)
    .orderBy(sql`SUM(CAST(${orders.totalAmount} AS NUMERIC)) DESC`)
    .limit(10);
    
    const topUsersBySpend = topSpendUsers.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      totalSpent: u.totalSpent || '0',
    }));
    
    // Sales volume and average order value
    const salesStats = await db.select({
      totalVolume: sql<string>`COALESCE(SUM(CAST(${orders.totalAmount} AS NUMERIC)), 0)`,
      orderCount: sql<number>`count(*)`,
    }).from(orders);
    
    const salesVolume = salesStats[0]?.totalVolume || '0';
    const orderCount = Number(salesStats[0]?.orderCount || 0);
    const averageOrderValue = orderCount > 0 
      ? (parseFloat(salesVolume) / orderCount).toFixed(2) 
      : '0';
    
    // Top categories
    const topCategoriesData = await db.select({
      category: listings.category,
      count: sql<number>`count(DISTINCT ${orderItems.orderId})`,
      revenue: sql<string>`COALESCE(SUM(CAST(${orderItems.subtotal} AS NUMERIC)), 0)`,
    })
    .from(orderItems)
    .leftJoin(listings, eq(orderItems.productId, listings.id))
    .where(sql`${listings.category} IS NOT NULL`)
    .groupBy(listings.category)
    .orderBy(sql`SUM(CAST(${orderItems.subtotal} AS NUMERIC)) DESC`)
    .limit(10);
    
    const topCategories = topCategoriesData.map(c => ({
      category: c.category || 'Uncategorized',
      count: Number(c.count || 0),
      revenue: c.revenue || '0',
    }));
    
    // Top products
    const topProductsData = await db.select({
      id: listings.id,
      title: listings.title,
      orderCount: sql<number>`count(${orderItems.id})`,
      revenue: sql<string>`COALESCE(SUM(CAST(${orderItems.subtotal} AS NUMERIC)), 0)`,
    })
    .from(orderItems)
    .leftJoin(listings, eq(orderItems.productId, listings.id))
    .groupBy(listings.id, listings.title)
    .orderBy(sql`SUM(CAST(${orderItems.subtotal} AS NUMERIC)) DESC`)
    .limit(10);
    
    const topProducts = topProductsData.map(p => ({
      id: p.id || '',
      title: p.title || 'Unknown Product',
      orderCount: Number(p.orderCount || 0),
      revenue: p.revenue || '0',
    }));
    
    // TimeDollar earned (sum of all user balances)
    const tdEarnedResult = await db.select({
      total: sql<string>`COALESCE(SUM(${users.timeDollarBalance}), 0)`,
    }).from(users);
    
    const tdEarned = tdEarnedResult[0]?.total || '0';
    
    // TimeDollar spent (sum of tdAmount from orders)
    const tdSpentResult = await db.select({
      total: sql<string>`COALESCE(SUM(CAST(${orders.tdAmount} AS NUMERIC)), 0)`,
    }).from(orders);
    
    const tdSpent = tdSpentResult[0]?.total || '0';
    
    // Top TD contributors (users with highest balances)
    const topTdData = await db.select({
      id: users.id,
      username: users.username,
      balance: users.timeDollarBalance,
    })
    .from(users)
    .orderBy(sql`${users.timeDollarBalance} DESC`)
    .limit(10);
    
    const topTdContributors = topTdData.map(u => ({
      id: u.id,
      username: u.username,
      balance: u.balance || 0,
    }));
    
    // Coupon redemption rate
    const totalOrdersResult = await db.select({
      count: sql<number>`count(*)`,
    }).from(orders);
    
    const ordersWithCouponsResult = await db.select({
      count: sql<number>`count(*)`,
    }).from(orders).where(sql`${orders.couponId} IS NOT NULL`);
    
    const totalOrdersCount = Number(totalOrdersResult[0]?.count || 0);
    const ordersWithCouponsCount = Number(ordersWithCouponsResult[0]?.count || 0);
    
    const couponRedemptionRate = totalOrdersCount > 0
      ? ((ordersWithCouponsCount / totalOrdersCount) * 100).toFixed(2)
      : '0';
    
    return {
      userGrowth,
      topUsersByActivity,
      topUsersBySpend,
      salesVolume,
      averageOrderValue,
      topCategories,
      topProducts,
      tdEarned,
      tdSpent,
      topTdContributors,
      couponRedemptionRate,
    };
  }

  // Vendor request operations
  async createVendorRequest(requestData: InsertVendorRequest & { userId: string }): Promise<VendorRequest> {
    const [request] = await db
      .insert(vendorRequests)
      .values(requestData as any)
      .returning();
    return request;
  }

  async getVendorRequests(status?: string): Promise<VendorRequest[]> {
    if (status) {
      return db.select().from(vendorRequests).where(eq(vendorRequests.status, status)).orderBy(vendorRequests.createdAt);
    }
    return db.select().from(vendorRequests).orderBy(vendorRequests.createdAt);
  }

  async getUserVendorRequest(userId: string): Promise<VendorRequest | undefined> {
    const [request] = await db.select().from(vendorRequests).where(eq(vendorRequests.userId, userId));
    return request;
  }

  async approveVendorRequest(id: string, adminId: string): Promise<VendorRequest> {
    const [request] = await db
      .update(vendorRequests)
      .set({
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(vendorRequests.id, id))
      .returning();
    return request;
  }

  async rejectVendorRequest(id: string, adminId: string, reason: string): Promise<VendorRequest> {
    const [request] = await db
      .update(vendorRequests)
      .set({
        status: 'rejected',
        rejectionReason: reason,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(vendorRequests.id, id))
      .returning();
    return request;
  }

  async updateUserVendorStatus(userId: string, status: string): Promise<User> {
    const updateData: any = {
      vendorStatus: status,
      updatedAt: new Date(),
    };
    
    // If status is verified, update role to vendor
    if (status === 'verified') {
      updateData.role = 'vendor';
    }
    // If status is rejected or pending, downgrade role to consumer (unless they are admin/staff)
    else if (status === 'rejected' || status === 'pending') {
      const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
      if (currentUser && currentUser.role === 'vendor') {
        updateData.role = 'consumer';
      }
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  // Coupon operations implementation
  async createCoupon(couponData: InsertCoupon): Promise<Coupon> {
    const [coupon] = await db
      .insert(coupons)
      .values(couponData as any)
      .returning();
    return coupon;
  }
  
  async getVendorCoupons(vendorId: string): Promise<Coupon[]> {
    return db.select().from(coupons).where(eq(coupons.vendorId, vendorId)).orderBy(coupons.createdAt);
  }
  
  async getAllCoupons(filters?: { status?: string; issuer?: string }): Promise<Coupon[]> {
    let query = db.select().from(coupons);
    
    if (filters?.status) {
      query = query.where(eq(coupons.status, filters.status)) as any;
    }
    if (filters?.issuer) {
      query = query.where(eq(coupons.issuer, filters.issuer)) as any;
    }
    
    return query.orderBy(coupons.createdAt);
  }
  
  async updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<Coupon> {
    const [coupon] = await db
      .update(coupons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning();
    return coupon;
  }
  
  async approveCoupon(id: string, adminId: string): Promise<Coupon> {
    const [coupon] = await db
      .update(coupons)
      .set({ status: 'approved', approvedBy: adminId, updatedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning();
    return coupon;
  }
  
  async rejectCoupon(id: string, adminId: string, reason: string): Promise<Coupon> {
    const [coupon] = await db
      .update(coupons)
      .set({ status: 'rejected', approvedBy: adminId, rejectionReason: reason, updatedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning();
    return coupon;
  }
  
  async deleteCoupon(id: string): Promise<void> {
    await db.delete(coupons).where(eq(coupons.id, id));
  }
  
  // Staff help request operations implementation
  async createStaffHelpRequest(requestData: InsertStaffHelpRequest & { userId: string; userName: string }): Promise<StaffHelpRequest> {
    const [request] = await db
      .insert(staffHelpRequests)
      .values(requestData as any)
      .returning();
    return request;
  }
  
  async getAllStaffHelpRequests(status?: string): Promise<StaffHelpRequest[]> {
    if (status) {
      return db.select().from(staffHelpRequests).where(eq(staffHelpRequests.status, status)).orderBy(staffHelpRequests.createdAt);
    }
    return db.select().from(staffHelpRequests).orderBy(staffHelpRequests.createdAt);
  }
  
  async getUserStaffHelpRequests(userId: string): Promise<StaffHelpRequest[]> {
    return db.select().from(staffHelpRequests).where(eq(staffHelpRequests.userId, userId)).orderBy(staffHelpRequests.createdAt);
  }
  
  async updateStaffHelpRequest(id: string, data: Partial<StaffHelpRequest>): Promise<StaffHelpRequest> {
    const [request] = await db
      .update(staffHelpRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(staffHelpRequests.id, id))
      .returning();
    return request;
  }
  
  async assignStaffHelpRequest(id: string, staffId: string): Promise<StaffHelpRequest> {
    const [request] = await db
      .update(staffHelpRequests)
      .set({
        assignedTo: staffId,
        status: 'in_progress',
        updatedAt: new Date(),
      })
      .where(eq(staffHelpRequests.id, id))
      .returning();
    return request;
  }
  
  async completeStaffHelpRequest(id: string, notes: string): Promise<StaffHelpRequest> {
    const [request] = await db
      .update(staffHelpRequests)
      .set({
        status: 'completed',
        responseNotes: notes,
        updatedAt: new Date(),
      })
      .where(eq(staffHelpRequests.id, id))
      .returning();
    return request;
  }
  
  // Activity log operations implementation
  async createActivityLog(logData: {
    userId: string;
    userName: string;
    actionType: string;
    entityType: string;
    entityId?: string;
    entityTitle?: string;
    description: string;
    metadata?: any;
  }): Promise<ActivityLog> {
    const [log] = await db
      .insert(activityLogs)
      .values(logData as any)
      .returning();
    return log;
  }
  
  async getAllActivityLogs(limit: number = 100): Promise<ActivityLog[]> {
    return db.select()
      .from(activityLogs)
      .orderBy(sql`${activityLogs.createdAt} DESC`)
      .limit(limit);
  }
  
  async getUserActivityLogs(userId: string, limit: number = 100): Promise<ActivityLog[]> {
    return db.select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(sql`${activityLogs.createdAt} DESC`)
      .limit(limit);
  }
  
  // TimeDollar operations implementation
  async updateTimeDollarBalance(userId: string, amount: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        timeDollarBalance: sql`${users.timeDollarBalance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
  
  async getTimeDollarBalance(userId: string): Promise<number> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user?.timeDollarBalance || 0;
  }
  
  // Shopping cart operations implementation
  async getUserCartItems(userId: string): Promise<any[]> {
    const { cartItems, listings } = await import("@shared/schema");
    const items = await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        product: listings,
      })
      .from(cartItems)
      .leftJoin(listings, eq(cartItems.productId, listings.id))
      .where(eq(cartItems.userId, userId));
    return items;
  }
  
  async addToCart(userId: string, productId: string, quantity: number): Promise<any> {
    const { cartItems } = await import("@shared/schema");
    
    // Check if item already exists in cart
    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
    
    if (existing.length > 0) {
      // Update quantity
      const [item] = await db
        .update(cartItems)
        .set({
          quantity: sql`${cartItems.quantity} + ${quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return item;
    } else {
      // Add new item
      const [item] = await db
        .insert(cartItems)
        .values({ userId, productId, quantity })
        .returning();
      return item;
    }
  }
  
  async updateCartItemQuantity(itemId: string, quantity: number): Promise<any> {
    const { cartItems } = await import("@shared/schema");
    const [item] = await db
      .update(cartItems)
      .set({ quantity, updatedAt: new Date() })
      .where(eq(cartItems.id, itemId))
      .returning();
    return item;
  }
  
  async removeCartItem(itemId: string): Promise<void> {
    const { cartItems } = await import("@shared/schema");
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  }
  
  async clearCart(userId: string): Promise<void> {
    const { cartItems } = await import("@shared/schema");
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }
  
  // Order operations implementation
  async createOrder(userId: string, orderData: any): Promise<any> {
    const { orders, orderItems, cartItems, listings, activityLogs } = await import("@shared/schema");
    
    // Get cart items
    const cart = await this.getUserCartItems(userId);
    
    if (cart.length === 0) {
      throw new Error("Cart is empty");
    }
    
    // Extract vendor ID from the first product (assuming all products are from the same vendor)
    const vendorId = cart[0]?.product?.userId;
    if (!vendorId) {
      throw new Error("Could not determine vendor for this order");
    }
    
    // Calculate total
    let totalAmount = 0;
    const orderItemsData = cart.map((item: any) => {
      const price = parseFloat(item.product.price || 0);
      const subtotal = price * item.quantity;
      totalAmount += subtotal;
      
      return {
        productId: item.productId,
        productTitle: item.product.title,
        productPrice: item.product.price,
        quantity: item.quantity,
        subtotal: subtotal.toString(),
      };
    });
    
    // Extract payment and coupon data
    const { paymentMethod, cashAmount, tdAmount, couponId, cashDiscount, tdDiscount, ...shippingData } = orderData;
    const cashAmountValue = parseFloat(cashAmount || 0);
    const tdAmountValue = parseFloat(tdAmount || 0);
    const cashDiscountValue = parseFloat(cashDiscount || 0);
    const tdDiscountValue = parseFloat(tdDiscount || 0);
    
    // Validate payment method and amounts
    if (paymentMethod === 'timedollar' || paymentMethod === 'both') {
      const currentBalance = await this.getTimeDollarBalance(userId);
      if (currentBalance < tdAmountValue) {
        throw new Error(`Insufficient TimeDollar balance. You need ${tdAmountValue} TD but only have ${currentBalance} TD.`);
      }
    }
    
    // Deduct TimeDollars if applicable
    if (paymentMethod === 'timedollar' || paymentMethod === 'both') {
      if (tdAmountValue > 0) {
        await this.updateTimeDollarBalance(userId, -tdAmountValue);
        
        // Get user info for activity log
        const user = await this.getUser(userId);
        
        // Create activity log for TimeDollar deduction
        await db.insert(activityLogs).values({
          userId,
          userName: user?.username || 'Unknown',
          actionType: 'payment',
          entityType: 'timedollar_transaction',
          entityId: null,
          entityTitle: `Order Payment`,
          description: `Paid ${tdAmountValue} TD for order`,
          metadata: {
            amount: -tdAmountValue,
            paymentMethod,
            totalAmount,
            cashAmount: cashAmountValue,
            tdAmount: tdAmountValue,
          }
        });
      }
    }
    
    // Generate transaction ID for tracking
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create order with payment details
    const orderValues: any = {
      userId,
      vendorId,
      totalAmount: totalAmount.toString(),
      paymentMethod,
      cashAmount: cashAmountValue.toString(),
      tdAmount: tdAmountValue.toString(),
      transactionId,
      ...shippingData,
    };

    // Add coupon data if applied
    if (couponId) {
      orderValues.couponId = couponId;
      orderValues.cashDiscount = cashDiscountValue.toString();
      orderValues.tdDiscount = tdDiscountValue.toString();
    }

    const [order] = await db
      .insert(orders)
      .values(orderValues)
      .returning();
    
    // Create order items
    for (const itemData of orderItemsData) {
      await db.insert(orderItems).values({
        orderId: order.id,
        ...itemData,
      });
    }
    
    // Record coupon usage if a coupon was applied
    if (couponId) {
      const totalDiscount = cashDiscountValue + tdDiscountValue;
      await this.useCoupon(couponId, userId, order.id, totalDiscount);
    }

    // Create or update transaction record
    const platformCommission = totalAmount * 0.05; // 5% commission
    const vendorEarnings = totalAmount * 0.95; // 95% for vendor
    
    if (orderData.paymentIntentId) {
      // Update existing transaction (created by payment intent) with order details
      await this.updateTransactionByPaymentIntent(orderData.paymentIntentId, {
        orderId: order.id,
        paymentMethod,
        cashAmount: cashAmountValue.toFixed(2),
        tdAmount: tdAmountValue.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        platformCommission: platformCommission.toFixed(2),
        vendorEarnings: vendorEarnings.toFixed(2),
        status: 'completed',
        metadata: {
          couponId,
          cashDiscount: cashDiscountValue,
          tdDiscount: tdDiscountValue,
        },
      });
    } else {
      // Create new transaction (for TimeDollar-only payments)
      await this.createTransaction({
        orderId: order.id,
        vendorId,
        customerId: userId,
        stripePaymentIntentId: null,
        paymentMethod,
        totalAmount: totalAmount.toFixed(2),
        cashAmount: cashAmountValue.toFixed(2),
        tdAmount: tdAmountValue.toFixed(2),
        platformCommission: platformCommission.toFixed(2),
        vendorEarnings: vendorEarnings.toFixed(2),
        status: 'completed', // TimeDollar payments are immediately completed
        currency: 'hkd',
        description: `Payment for order ${order.id}`,
        metadata: {
          couponId,
          cashDiscount: cashDiscountValue,
          tdDiscount: tdDiscountValue,
        },
      });
    }

    // Clear cart
    await this.clearCart(userId);
    
    return order;
  }
  
  async getUserOrders(userId: string): Promise<any[]> {
    const { orders } = await import("@shared/schema");
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(sql`${orders.createdAt} DESC`);
  }
  
  async getVendorOrders(vendorId: string): Promise<any[]> {
    const { orders, orderItems, users } = await import("@shared/schema");
    
    // Get all orders for this vendor
    const vendorOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.vendorId, vendorId))
      .orderBy(sql`${orders.createdAt} DESC`);
    
    // Get order items and customer details for each order
    const ordersWithDetails = await Promise.all(
      vendorOrders.map(async (order: any) => {
        // Get order items
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        
        // Get customer details
        const [customer] = await db
          .select({
            id: users.id,
            username: users.username,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, order.userId));
        
        return {
          ...order,
          items,
          customer,
        };
      })
    );
    
    return ordersWithDetails;
  }
  
  async getOrderDetails(orderId: string): Promise<any> {
    const { orders, orderItems, listings } = await import("@shared/schema");
    
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    
    if (!order) {
      throw new Error("Order not found");
    }
    
    const items = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        productTitle: orderItems.productTitle,
        productPrice: orderItems.productPrice,
        quantity: orderItems.quantity,
        subtotal: orderItems.subtotal,
        product: listings,
      })
      .from(orderItems)
      .leftJoin(listings, eq(orderItems.productId, listings.id))
      .where(eq(orderItems.orderId, orderId));
    
    return { ...order, items };
  }

  async updateOrderPaymentStatus(orderId: string, status: string, paymentIntentId: string): Promise<any> {
    const { orders } = await import("@shared/schema");
    
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        status, 
        transactionId: paymentIntentId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
    
    return updatedOrder;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    const { orders } = await import("@shared/schema");
    
    const [updatedOrder] = await db
      .update(orders)
      .set({ 
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
    
    return updatedOrder;
  }

  // Transaction operations (Stripe payments)
  async createTransaction(transactionData: any): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    
    return transaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    // Get all transactions with customer and vendor information
    const result = await db
      .select({
        transaction: transactions,
        customer: {
          id: users.id,
          username: users.username,
          email: users.email,
        },
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.customerId, users.id))
      .orderBy(sql`${transactions.createdAt} DESC`);

    // Enrich with vendor information
    const enrichedTransactions = await Promise.all(
      result.map(async (row) => {
        const [vendor] = await db
          .select({
            id: users.id,
            username: users.username,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, row.transaction.vendorId));

        return {
          ...row.transaction,
          customer: row.customer,
          vendor,
        };
      })
    );

    return enrichedTransactions;
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    
    return transaction;
  }

  async getVendorTransactions(vendorId: string): Promise<any[]> {
    // Get vendor transactions with customer and order information
    const result = await db
      .select({
        transaction: transactions,
        customer: {
          id: users.id,
          username: users.username,
          email: users.email,
        },
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.customerId, users.id))
      .where(eq(transactions.vendorId, vendorId))
      .orderBy(sql`${transactions.createdAt} DESC`);

    // Enrich with order details
    const enrichedTransactions = await Promise.all(
      result.map(async (row) => {
        let orderDetails = null;
        if (row.transaction.orderId) {
          // Get order with items
          const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, row.transaction.orderId));
          
          if (order) {
            const items = await db
              .select()
              .from(orderItems)
              .where(eq(orderItems.orderId, order.id));
            
            orderDetails = {
              ...order,
              items,
            };
          }
        }

        return {
          ...row.transaction,
          customer: row.customer,
          order: orderDetails,
        };
      })
    );

    return enrichedTransactions;
  }

  async updateTransactionByPaymentIntent(paymentIntentId: string, updates: any): Promise<Transaction> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(transactions.stripePaymentIntentId, paymentIntentId))
      .returning();
    
    return updatedTransaction;
  }
}

export const storage = new DatabaseStorage();
