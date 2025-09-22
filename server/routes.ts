import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertBusinessListingSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // Setup authentication middleware and routes (from blueprint: javascript_auth_all_persistance)
  setupAuth(app);

  // Business listing routes
  app.post('/api/listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        console.error("No userId found in request");
        return res.status(401).json({ message: "Authentication required - user ID not found" });
      }
      
      const listingData = insertBusinessListingSchema.parse(req.body);
      
      // Convert tags string to array if provided
      const tagsArray = listingData.tags ? listingData.tags.split(',').map((tag: string) => tag.trim()) : [];
      
      const listing = await storage.createListing({
        ...listingData,
        userId,
        tags: tagsArray,
      });
      
      res.json(listing);
    } catch (error: any) {
      console.error("Error creating listing:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  app.get('/api/listings', async (req, res) => {
    try {
      const listings = await storage.getListings();
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  app.get('/api/listings/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const listings = await storage.getUserListings(userId);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      res.status(500).json({ message: "Failed to fetch user listings" });
    }
  });

  app.put('/api/listings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const listingData = insertBusinessListingSchema.parse(req.body);
      
      // Convert tags string to array if provided
      const tagsArray = listingData.tags ? listingData.tags.split(',').map((tag: string) => tag.trim()) : [];
      
      // Verify the listing belongs to the user
      const existingListing = await storage.getUserListings(userId);
      const userListing = existingListing.find(listing => listing.id === id);
      
      if (!userListing) {
        return res.status(404).json({ message: "Listing not found or access denied" });
      }
      
      const updatedListing = await storage.updateListing(id, {
        ...listingData,
        userId,
        tags: tagsArray,
      });
      
      res.json(updatedListing);
    } catch (error: any) {
      console.error("Error updating listing:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update listing" });
    }
  });

  app.delete('/api/listings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Verify the listing belongs to the user
      const existingListings = await storage.getUserListings(userId);
      const userListing = existingListings.find(listing => listing.id === id);
      
      if (!userListing) {
        return res.status(404).json({ message: "Listing not found or access denied" });
      }
      
      await storage.deleteListing(id);
      res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });

  // Protected route example
  app.get("/api/protected", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.id;
    res.json({ message: "This is a protected route", userId });
  });


  const httpServer = createServer(app);
  return httpServer;
}
