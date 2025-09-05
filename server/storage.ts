import {
  users,
  businessListings,
  type User,
  type UpsertUser,
  type BusinessListing,
  type InsertBusinessListing,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Business listing operations
  createListing(listing: any): Promise<BusinessListing>;
  getListings(): Promise<BusinessListing[]>;
  getUserListings(userId: string): Promise<BusinessListing[]>;
  updateListing(id: string, listing: any): Promise<BusinessListing>;
  deleteListing(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Business listing operations
  async createListing(listingData: any): Promise<BusinessListing> {
    const [listing] = await db
      .insert(businessListings)
      .values(listingData)
      .returning();
    return listing;
  }

  async getListings(): Promise<BusinessListing[]> {
    return db.select().from(businessListings);
  }

  async getUserListings(userId: string): Promise<BusinessListing[]> {
    return db.select().from(businessListings).where(eq(businessListings.userId, userId));
  }

  async updateListing(id: string, listingData: any): Promise<BusinessListing> {
    const [listing] = await db
      .update(businessListings)
      .set({ ...listingData, updatedAt: new Date() })
      .where(eq(businessListings.id, id))
      .returning();
    return listing;
  }

  async deleteListing(id: string): Promise<void> {
    await db.delete(businessListings).where(eq(businessListings.id, id));
  }
}

export const storage = new DatabaseStorage();
