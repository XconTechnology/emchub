import {
  users,
  businessListings,
  categories,
  listings,
  bookings,
  coupons,
  couponUsage,
  vendorRequests,
  staffHelpRequests,
  activityLogs,
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
  validateCoupon(code: string, vendorId: string, cashAmount: number, tdAmount: number): Promise<{ 
    valid: boolean; 
    cashDiscount: number; 
    tdDiscount: number;
    coupon?: Coupon;
    error?: string;
  }>;
  useCoupon(couponId: string, userId: string, orderId: string, cashDiscount: number, tdDiscount: number): Promise<void>;
  createCoupon(coupon: InsertCoupon & { vendorId: string }): Promise<Coupon>;
  getVendorCoupons(vendorId: string): Promise<Coupon[]>;
  getAllCoupons(status?: string): Promise<Coupon[]>;
  getCouponUsage(couponId: string): Promise<any[]>;
  getCouponAnalytics(couponId: string): Promise<{ totalUsed: number; totalCashDiscount: number; totalTdDiscount: number; users: any[] }>;
  updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<Coupon>;
  deleteCoupon(id: string): Promise<void>;
  
  // Admin moderation operations
  getModerationQueue(status?: string): Promise<Listing[]>;
  adminApproveListing(id: string, adminId: string, notes?: string): Promise<Listing>;
  adminRejectListing(id: string, adminId: string, reason: string): Promise<Listing>;
  getAllUsers(): Promise<User[]>;
  
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
  getOrderDetails(orderId: string): Promise<any>;
  
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

  async validateCoupon(code: string, vendorId: string, cashAmount: number, tdAmount: number): Promise<{ 
    valid: boolean; 
    cashDiscount: number; 
    tdDiscount: number;
    coupon?: Coupon;
    error?: string;
  }> {
    const coupon = await this.getCoupon(code);
    
    console.log('Validating coupon:', { code, vendorId, coupon: coupon ? { id: coupon.id, vendorId: coupon.vendorId, isActive: coupon.isActive, status: coupon.status } : null });
    
    if (!coupon) {
      return { valid: false, cashDiscount: 0, tdDiscount: 0, error: 'Coupon not found' };
    }

    if (!coupon.isActive || coupon.status !== 'active') {
      console.log('Coupon inactive check failed:', { isActive: coupon.isActive, status: coupon.status });
      return { valid: false, cashDiscount: 0, tdDiscount: 0, error: 'Coupon is inactive' };
    }

    // Check if coupon belongs to the same vendor
    if (coupon.vendorId !== vendorId) {
      console.log('Vendor mismatch:', { couponVendorId: coupon.vendorId, providedVendorId: vendorId });
      return { valid: false, cashDiscount: 0, tdDiscount: 0, error: 'Coupon is not valid for this vendor' };
    }
    
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return { valid: false, cashDiscount: 0, tdDiscount: 0, error: 'Coupon is not yet valid' };
    }

    if (coupon.validUntil && now > coupon.validUntil) {
      return { valid: false, cashDiscount: 0, tdDiscount: 0, error: 'Coupon has expired' };
    }
    
    if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
      return { valid: false, cashDiscount: 0, tdDiscount: 0, error: 'Coupon usage limit reached' };
    }
    
    let cashDiscount = 0;
    let tdDiscount = 0;

    // Calculate discounts based on coupon type
    if (coupon.discountType === 'cash' || coupon.discountType === 'both') {
      if (coupon.cashDiscountType === 'percentage') {
        cashDiscount = (cashAmount * Number(coupon.cashDiscountValue || 0)) / 100;
      } else if (coupon.cashDiscountType === 'fixed') {
        cashDiscount = Number(coupon.cashDiscountValue || 0);
      }
    }

    if (coupon.discountType === 'timedollar' || coupon.discountType === 'both') {
      if (coupon.tdDiscountType === 'percentage') {
        tdDiscount = (tdAmount * Number(coupon.tdDiscountValue || 0)) / 100;
      } else if (coupon.tdDiscountType === 'fixed') {
        tdDiscount = Number(coupon.tdDiscountValue || 0);
      }
    }

    // Ensure discounts don't exceed the amounts
    cashDiscount = Math.min(cashDiscount, cashAmount);
    tdDiscount = Math.min(tdDiscount, tdAmount);
    
    return { valid: true, cashDiscount, tdDiscount, coupon };
  }

  async getCouponById(id: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon;
  }

  async useCoupon(couponId: string, userId: string, orderId: string, cashDiscount: number, tdDiscount: number): Promise<void> {
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
      cashDiscount: cashDiscount.toString(),
      tdDiscount: tdDiscount.toString(),
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

  async getCouponAnalytics(couponId: string): Promise<{ totalUsed: number; totalCashDiscount: number; totalTdDiscount: number; users: any[] }> {
    const usage = await this.getCouponUsage(couponId);
    
    const totalUsed = usage.length;
    const totalCashDiscount = usage.reduce((sum, u) => sum + Number(u.cashDiscount || 0), 0);
    const totalTdDiscount = usage.reduce((sum, u) => sum + Number(u.tdDiscount || 0), 0);
    
    return {
      totalUsed,
      totalCashDiscount,
      totalTdDiscount,
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
    
    return {
      totalListings: Number(totalListingsResult[0]?.count || 0),
      publishedListings: Number(publishedListingsResult[0]?.count || 0),
      draftListings: Number(draftListingsResult[0]?.count || 0),
      deletedListings: Number(deletedListingsResult[0]?.count || 0),
      totalUsers: Number(totalUsersResult[0]?.count || 0),
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
  async createCoupon(couponData: InsertCoupon & { vendorId: string }): Promise<Coupon> {
    const [coupon] = await db
      .insert(coupons)
      .values(couponData as any)
      .returning();
    return coupon;
  }
  
  async getVendorCoupons(vendorId: string): Promise<Coupon[]> {
    return db.select().from(coupons).where(eq(coupons.vendorId, vendorId)).orderBy(coupons.createdAt);
  }
  
  async getAllCoupons(status?: string): Promise<Coupon[]> {
    if (status) {
      return db.select().from(coupons).where(eq(coupons.status, status)).orderBy(coupons.createdAt);
    }
    return db.select().from(coupons).orderBy(coupons.createdAt);
  }
  
  async updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<Coupon> {
    const [coupon] = await db
      .update(coupons)
      .set({ ...data, updatedAt: new Date() })
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
      await this.useCoupon(couponId, userId, order.id, cashDiscountValue, tdDiscountValue);
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
}

export const storage = new DatabaseStorage();
