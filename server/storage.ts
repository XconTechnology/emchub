import {
  users,
  businessListings,
  categories,
  listings,
  bookings,
  coupons,
  vendorRequests,
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
  type VendorRequest,
  type InsertVendorRequest,
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
  validateCoupon(code: string, amount: number): Promise<{ valid: boolean; discount?: number; coupon?: Coupon }>;
  useCoupon(code: string): Promise<void>;
  
  // Admin moderation operations
  getModerationQueue(status?: string): Promise<Listing[]>;
  adminApproveListing(id: string, adminId: string, notes?: string): Promise<Listing>;
  adminRejectListing(id: string, adminId: string, reason: string): Promise<Listing>;
  getAllUsers(): Promise<User[]>;
  
  // Soft delete and restore operations
  softDeleteListing(id: string): Promise<Listing>;
  restoreListing(id: string): Promise<Listing>;
  getDeletedListings(): Promise<Listing[]>;
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
    return db.select().from(listings).where(eq(listings.userId, userId));
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
    await db.delete(listings).where(eq(listings.id, id));
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

  async validateCoupon(code: string, amount: number): Promise<{ valid: boolean; discount?: number; coupon?: Coupon }> {
    const coupon = await this.getCoupon(code);
    
    if (!coupon || !coupon.isActive) {
      return { valid: false };
    }
    
    const now = new Date();
    if (coupon.validUntil && now > coupon.validUntil) {
      return { valid: false };
    }
    
    if (coupon.maxUses && (coupon.usedCount || 0) >= coupon.maxUses) {
      return { valid: false };
    }
    
    if (coupon.minAmount && amount < Number(coupon.minAmount)) {
      return { valid: false };
    }
    
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (amount * Number(coupon.discountValue)) / 100;
    } else {
      discount = Number(coupon.discountValue);
    }
    
    return { valid: true, discount, coupon };
  }

  async useCoupon(code: string): Promise<void> {
    await db
      .update(coupons)
      .set({ usedCount: sql`used_count + 1` })
      .where(eq(coupons.code, code));
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
    
    // If status is verified, also update role to vendor
    if (status === 'verified') {
      updateData.role = 'vendor';
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
