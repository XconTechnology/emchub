import {
  users,
  businessListings,
  type User,
  type InsertUser,
  type BusinessListing,
  type InsertBusinessListing,
} from "@shared/schema";
import { db } from "./db";
import { eq, or } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations for email/password authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Business listing operations
  createListing(listing: any): Promise<BusinessListing>;
  getListings(): Promise<BusinessListing[]>;
  getUserListings(userId: string): Promise<BusinessListing[]>;
  updateListing(id: string, listing: any): Promise<BusinessListing>;
  deleteListing(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations for email/password authentication

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
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
