import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { 
  insertBusinessListingSchema, 
  insertListingSchema,
  insertCategorySchema,
  insertBookingSchema,
  insertVendorRequestSchema,
  users as usersTable
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { ObjectStorageService, ObjectNotFoundError, objectStorageClient } from "./objectStorage";
import { geocodeAddress, delay } from "./geocoding";

// Admin middleware for session-based admin authentication
const isAdminAuthenticated = async (req: any, res: any, next: any) => {
  console.log('Admin auth check:', { 
    hasSession: !!req.session, 
    adminAuth: req.session?.adminAuth,
    path: req.path 
  });
  
  if (!req.session?.adminAuth) {
    return res.status(401).json({ message: "Admin authentication required" });
  }
  next();
};

// Middleware that allows both user and admin authentication
const isAuthenticatedOrAdmin = async (req: any, res: any, next: any) => {
  // Check for admin authentication via session
  if (req.session?.adminAuth) {
    return next();
  }
  
  // Otherwise, require user authentication
  return isAuthenticated(req, res, next);
};

// Role-based authentication middleware factory
function requireRole(allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    
    const userRole = req.user?.role || 'consumer';
    if (allowedRoles.includes(userRole)) {
      return next();
    }
    
    res.status(403).json({ message: 'Access denied. Insufficient privileges.' });
  };
}

// Specific role middleware
const requireAdmin = requireRole(['admin']);
const requireStaffOrAbove = requireRole(['staff', 'admin']);
const requireVendorOrAbove = requireRole(['vendor', 'staff', 'admin']);

export function registerRoutes(app: Express): Server {
  // Setup authentication middleware and routes (from blueprint: javascript_auth_all_persistance)
  setupAuth(app);

  // Categories routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error: any) {
      console.error("Error creating category:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Enhanced listings routes (new system)
  app.post('/api/listings', isAuthenticatedOrAdmin, async (req: any, res) => {
    console.log('POST /api/listings - Request received');
    console.log('User:', req.user);
    console.log('Admin auth:', req.session?.adminAuth);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
      // For admin users, get the admin user ID from the database
      let userId = req.user?.id;
      const isAdmin = req.session?.adminAuth === true;
      
      if (isAdmin && !userId) {
        // Get the first admin user from the database
        const adminUsers = await db.select().from(usersTable).where(eq(usersTable.role, 'admin')).limit(1);
        if (adminUsers.length > 0) {
          userId = adminUsers[0].id;
          console.log('Using admin user ID:', userId);
        }
      }
      
      if (!userId) {
        console.error("No userId found in request");
        return res.status(401).json({ message: "Authentication required - user ID not found" });
      }
      
      console.log('About to parse listing data with userId:', userId);
      const listingData = insertListingSchema.parse(req.body);
      console.log('Parsed listing data:', listingData);
      
      // Auto-geocode if address exists but coordinates don't
      if (listingData.address && !listingData.isOnlineOnly) {
        if (!listingData.latitude || !listingData.longitude) {
          console.log('Attempting to geocode address:', listingData.address);
          // If the address already includes location info, just use it directly
          const coordinates = await geocodeAddress(listingData.address, '');
          if (coordinates) {
            listingData.latitude = coordinates.latitude;
            listingData.longitude = coordinates.longitude;
            console.log('Geocoding successful:', coordinates);
          } else {
            console.log('Geocoding failed or no results found');
          }
        }
      }
      
      // Use the status from the request, or default to 'pending' for new listings
      const status = listingData.status || 'pending';
      
      const listing = await storage.createListing({
        ...listingData,
        userId,
        status,
      });
      
      console.log('Created listing:', listing);
      res.json(listing);
    } catch (error: any) {
      console.error("Error creating listing:", error);
      if (error.name === 'ZodError') {
        console.error("Zod validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  app.get('/api/listings', async (req, res) => {
    console.log('GET /api/listings - Request received');
    console.log('Query params:', req.query);
    
    try {
      const { categories, categoryId, type, search, isOnlineOnly } = req.query;
      
      const filters: any = {};
      if (categories && typeof categories === 'string') {
        filters.categories = categories.split(',');
      }
      if (categoryId && typeof categoryId === 'string') {
        filters.categoryId = categoryId;
      }
      if (type && typeof type === 'string') {
        filters.type = type;
      }
      if (search && typeof search === 'string') {
        filters.search = search;
      }
      if (isOnlineOnly !== undefined) {
        filters.isOnlineOnly = isOnlineOnly === 'true';
      }
      
      // Only show published listings to the public
      filters.status = 'published';
      
      console.log('Filters:', filters);
      const listings = await storage.getListings(filters);
      console.log('Found listings:', listings.length);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  // IMPORTANT: Specific routes like /api/listings/user must come BEFORE parameterized routes like /api/listings/:id
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

  app.get('/api/listings/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const listing = await storage.getListing(id);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Check if user is admin
      const isAdmin = req.session?.adminAuth === true;
      
      // Only show published listings to public, but admins can see all
      if (!isAdmin && listing.status !== 'published') {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      res.json(listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

  app.put('/api/listings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const listingData = insertListingSchema.parse(req.body);
      
      // Verify the listing belongs to the user
      const existingListing = await storage.getListing(id);
      if (!existingListing || existingListing.userId !== userId) {
        return res.status(404).json({ message: "Listing not found or access denied" });
      }
      
      // Auto-geocode if address exists but coordinates don't
      if (listingData.address && !listingData.isOnlineOnly) {
        if (!listingData.latitude || !listingData.longitude) {
          console.log('Attempting to geocode address on update:', listingData.address);
          const coordinates = await geocodeAddress(listingData.address, '');
          if (coordinates) {
            listingData.latitude = coordinates.latitude;
            listingData.longitude = coordinates.longitude;
            console.log('Geocoding successful on update:', coordinates);
          } else {
            console.log('Geocoding failed or no results found on update');
          }
        }
      }
      
      const updatedListing = await storage.updateListing(id, listingData);
      
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
      const existingListing = await storage.getListing(id);
      if (!existingListing || existingListing.userId !== userId) {
        return res.status(404).json({ message: "Listing not found or access denied" });
      }
      
      await storage.deleteListing(id);
      res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });

  // Bookings routes
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking({ ...bookingData, userId });
      
      res.json(booking);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get('/api/bookings/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/listing/:listingId', isAuthenticated, async (req: any, res) => {
    try {
      const { listingId } = req.params;
      const userId = req.user.id;
      
      // Verify the listing belongs to the user
      const listing = await storage.getListing(listingId);
      if (!listing || listing.userId !== userId) {
        return res.status(404).json({ message: "Listing not found or access denied" });
      }
      
      const bookings = await storage.getListingBookings(listingId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching listing bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Legacy business listing routes (deprecated but maintained for compatibility)
  app.post('/api/business-listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        console.error("No userId found in request");
        return res.status(401).json({ message: "Authentication required - user ID not found" });
      }
      
      const listingData = insertBusinessListingSchema.parse(req.body);
      
      // Convert tags string to array if provided
      const tagsArray = listingData.tags ? listingData.tags.split(',').map((tag: string) => tag.trim()) : [];
      
      const listing = await storage.createBusinessListing({
        ...listingData,
        userId,
        tags: tagsArray,
      });
      
      res.json(listing);
    } catch (error: any) {
      console.error("Error creating business listing:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  app.get('/api/business-listings', async (req, res) => {
    try {
      const listings = await storage.getBusinessListings();
      res.json(listings);
    } catch (error) {
      console.error("Error fetching business listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });


  // Add endpoint to check if current user is admin
  app.get('/api/me', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        isAdmin: user.role === 'admin',
        vendorStatus: user.vendorStatus,
        profileImageUrl: user.profileImageUrl
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email, phone } = req.body;

      const updatedUser = await storage.updateUserProfile(userId, {
        firstName,
        lastName,
        email,
        phone
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Admin authentication routes
  app.post('/api/admin/login', async (req: any, res) => {
    try {
      console.log('Admin login attempt:', { session: !!req.session, body: req.body });
      const { username, password } = req.body;
      
      // Simple hardcoded admin credentials (you can enhance this later)
      if (username === 'admin' && password === 'admin123') {
        if (!req.session) {
          console.error('Session not available during admin login');
          return res.status(500).json({ message: "Session configuration error" });
        }
        req.session.adminAuth = true;
        console.log('Admin session set successfully');
        res.json({ message: "Admin login successful" });
      } else {
        res.status(401).json({ message: "Invalid admin credentials" });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Admin login failed" });
    }
  });

  app.get('/api/admin/check', async (req: any, res) => {
    console.log('Admin check:', { 
      hasSession: !!req.session, 
      adminAuth: req.session?.adminAuth,
      sessionId: req.session?.id 
    });
    
    if (req.session?.adminAuth) {
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

  app.post('/api/admin/logout', async (req: any, res) => {
    req.session.adminAuth = null;
    res.json({ message: "Admin logout successful" });
  });

  // Dashboard statistics endpoint
  app.get('/api/admin/stats', isAdminAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Admin routes for listing moderation
  app.get('/api/admin/listings', isAdminAuthenticated, async (req: any, res) => {
    try {
      const status = req.query.status as string;
      const listings = await storage.getListingsByStatus(status);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching admin listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  // Admin route to get all users
  app.get('/api/admin/users', isAdminAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin route to get pending approvals with user info
  app.get('/api/admin/pending-approvals', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { listings, users } = await import("@shared/schema");
      const pendingListings = await db
        .select({
          id: listings.id,
          userId: listings.userId,
          type: listings.type,
          title: listings.title,
          description: listings.description,
          categoryId: listings.categoryId,
          address: listings.address,
          city: listings.city,
          postalCode: listings.postalCode,
          latitude: listings.latitude,
          longitude: listings.longitude,
          isOnlineOnly: listings.isOnlineOnly,
          phone: listings.phone,
          email: listings.email,
          website: listings.website,
          images: listings.images,
          operatingHours: listings.operatingHours,
          tags: listings.tags,
          sku: listings.sku,
          price: listings.price,
          inventory: listings.inventory,
          paymentMethods: listings.paymentMethods,
          duration: listings.duration,
          eventDate: listings.eventDate,
          eventEndDate: listings.eventEndDate,
          capacity: listings.capacity,
          attendeeCount: listings.attendeeCount,
          eventPrice: listings.eventPrice,
          isActive: listings.isActive,
          isVerified: listings.isVerified,
          status: listings.status,
          moderationStatus: listings.moderationStatus,
          moderationNotes: listings.moderationNotes,
          moderatedBy: listings.moderatedBy,
          moderatedAt: listings.moderatedAt,
          createdAt: listings.createdAt,
          updatedAt: listings.updatedAt,
          deletedAt: listings.deletedAt,
          user: {
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
          }
        })
        .from(listings)
        .leftJoin(users, eq(listings.userId, users.id))
        .where(eq(listings.status, 'pending'));
      
      res.json(pendingListings);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
  });

  app.patch('/api/admin/listings/:id/approve', isAdminAuthenticated, async (req: any, res) => {
    try {
      const listingId = req.params.id;
      const { listings } = await import("@shared/schema");
      await db
        .update(listings)
        .set({ 
          status: 'published',
          updatedAt: new Date()
        })
        .where(eq(listings.id, listingId));
      res.json({ message: "Listing approved and published successfully" });
    } catch (error) {
      console.error("Error approving listing:", error);
      res.status(500).json({ message: "Failed to approve listing" });
    }
  });

  app.patch('/api/admin/listings/:id/reject', isAdminAuthenticated, async (req: any, res) => {
    try {
      const listingId = req.params.id;
      const { listings } = await import("@shared/schema");
      await db
        .update(listings)
        .set({ 
          status: 'rejected',
          updatedAt: new Date()
        })
        .where(eq(listings.id, listingId));
      res.json({ message: "Listing rejected successfully" });
    } catch (error) {
      console.error("Error rejecting listing:", error);
      res.status(500).json({ message: "Failed to reject listing" });
    }
  });

  // Admin route to update any listing
  app.patch('/api/admin/listings/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const listingId = req.params.id;
      const listingData = req.body;
      
      // Auto-geocode if address exists but coordinates don't
      if (listingData.address && !listingData.isOnlineOnly) {
        if (!listingData.latitude || !listingData.longitude) {
          console.log('Attempting to geocode address on admin update:', listingData.address);
          const coordinates = await geocodeAddress(listingData.address, '');
          if (coordinates) {
            listingData.latitude = coordinates.latitude;
            listingData.longitude = coordinates.longitude;
            console.log('Geocoding successful on admin update:', coordinates);
          } else {
            console.log('Geocoding failed or no results found on admin update');
          }
        }
      }
      
      const updatedListing = await storage.updateListing(listingId, listingData);
      res.json(updatedListing);
    } catch (error: any) {
      console.error("Error updating listing:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid listing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update listing" });
    }
  });

  // Admin route to delete any listing
  app.delete('/api/admin/listings/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const listingId = req.params.id;
      await storage.deleteListing(listingId);
      res.json({ message: "Listing deleted successfully" });
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });
  
  // Soft delete and restore operations
  app.post('/api/admin/listings/:id/soft-delete', isAdminAuthenticated, async (req: any, res) => {
    try {
      const listingId = req.params.id;
      const listing = await storage.softDeleteListing(listingId);
      res.json({ message: "Listing moved to recycle bin", listing });
    } catch (error) {
      console.error("Error soft deleting listing:", error);
      res.status(500).json({ message: "Failed to delete listing" });
    }
  });
  
  app.post('/api/admin/listings/:id/restore', isAdminAuthenticated, async (req: any, res) => {
    try {
      const listingId = req.params.id;
      const listing = await storage.restoreListing(listingId);
      res.json({ message: "Listing restored successfully", listing });
    } catch (error) {
      console.error("Error restoring listing:", error);
      res.status(500).json({ message: "Failed to restore listing" });
    }
  });
  
  app.get('/api/admin/listings/deleted', isAdminAuthenticated, async (req: any, res) => {
    try {
      const listings = await storage.getDeletedListings();
      res.json(listings);
    } catch (error) {
      console.error("Error fetching deleted listings:", error);
      res.status(500).json({ message: "Failed to fetch deleted listings" });
    }
  });
  
  app.delete('/api/admin/listings/:id/permanent', isAdminAuthenticated, async (req: any, res) => {
    try {
      const listingId = req.params.id;
      await storage.permanentlyDeleteListing(listingId);
      res.json({ message: "Listing permanently deleted" });
    } catch (error) {
      console.error("Error permanently deleting listing:", error);
      res.status(500).json({ message: "Failed to permanently delete listing" });
    }
  });
  
  app.patch('/api/admin/listings/:id/status', isAdminAuthenticated, async (req: any, res) => {
    try {
      const listingId = req.params.id;
      const { status } = req.body;
      const listing = await storage.updateListingStatus(listingId, status);
      res.json({ message: "Listing status updated", listing });
    } catch (error) {
      console.error("Error updating listing status:", error);
      res.status(500).json({ message: "Failed to update listing status" });
    }
  });

  // Bulk operations
  app.post('/api/admin/listings/bulk-delete', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid request. Provide an array of listing IDs." });
      }
      
      let count = 0;
      for (const id of ids) {
        await storage.softDeleteListing(id);
        count++;
      }
      
      res.json({ message: `${count} listing(s) moved to recycle bin`, count });
    } catch (error) {
      console.error("Error bulk deleting listings:", error);
      res.status(500).json({ message: "Failed to delete listings" });
    }
  });

  app.post('/api/admin/listings/bulk-publish', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid request. Provide an array of listing IDs." });
      }
      
      let count = 0;
      for (const id of ids) {
        await storage.updateListingStatus(id, 'published');
        count++;
      }
      
      res.json({ message: `${count} listing(s) published successfully`, count });
    } catch (error) {
      console.error("Error bulk publishing listings:", error);
      res.status(500).json({ message: "Failed to publish listings" });
    }
  });

  app.post('/api/admin/listings/bulk-restore', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid request. Provide an array of listing IDs." });
      }
      
      let count = 0;
      for (const id of ids) {
        await storage.restoreListing(id);
        count++;
      }
      
      res.json({ message: `${count} listing(s) restored successfully`, count });
    } catch (error) {
      console.error("Error bulk restoring listings:", error);
      res.status(500).json({ message: "Failed to restore listings" });
    }
  });

  app.post('/api/admin/listings/bulk-permanent-delete', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid request. Provide an array of listing IDs." });
      }
      
      let count = 0;
      for (const id of ids) {
        await storage.permanentlyDeleteListing(id);
        count++;
      }
      
      res.json({ message: `${count} listing(s) permanently deleted`, count });
    } catch (error) {
      console.error("Error bulk permanently deleting listings:", error);
      res.status(500).json({ message: "Failed to permanently delete listings" });
    }
  });

  app.post('/api/admin/users/bulk-delete', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid request. Provide an array of user IDs." });
      }
      
      // Prevent deleting the current admin user
      const currentUserId = req.user?.id;
      const filteredIds = ids.filter(id => id !== currentUserId);
      
      if (filteredIds.length !== ids.length) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      let count = 0;
      for (const id of filteredIds) {
        await storage.deleteUser(id);
        count++;
      }
      
      res.json({ message: `${count} user(s) deleted successfully`, count });
    } catch (error) {
      console.error("Error bulk deleting users:", error);
      res.status(500).json({ message: "Failed to delete users" });
    }
  });

  app.patch('/api/admin/users/:id/role', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      const validRoles = ['consumer', 'vendor', 'staff', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be one of: consumer, vendor, staff, admin" });
      }
      
      const user = await storage.updateUserRole(id, role);
      res.json({ message: "User role updated successfully", user });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Vendor request routes
  app.post('/api/vendor-requests', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user already has a pending or approved request
      const existingRequest = await storage.getUserVendorRequest(req.user.id);
      if (existingRequest && existingRequest.status === 'pending') {
        return res.status(400).json({ message: "You already have a pending vendor request" });
      }
      if (existingRequest && existingRequest.status === 'approved') {
        return res.status(400).json({ message: "You are already a verified vendor" });
      }

      const requestData = insertVendorRequestSchema.parse(req.body);
      const vendorRequest = await storage.createVendorRequest({
        ...requestData,
        userId: req.user.id,
      });

      // Update user vendor status to pending
      await storage.updateUserVendorStatus(req.user.id, 'pending');

      res.json(vendorRequest);
    } catch (error: any) {
      console.error("Error creating vendor request:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit vendor request" });
    }
  });

  app.get('/api/vendor-requests/my-request', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const request = await storage.getUserVendorRequest(req.user.id);
      res.json(request || null);
    } catch (error) {
      console.error("Error fetching vendor request:", error);
      res.status(500).json({ message: "Failed to fetch vendor request" });
    }
  });

  // Vendor application route (alias for vendor-requests)
  app.post('/api/vendor/apply', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user already has a pending or approved request
      const existingRequest = await storage.getUserVendorRequest(req.user.id);
      if (existingRequest && existingRequest.status === 'pending') {
        return res.status(400).json({ message: "You already have a pending vendor request" });
      }
      if (existingRequest && existingRequest.status === 'approved') {
        return res.status(400).json({ message: "You are already a verified vendor" });
      }

      const requestData = insertVendorRequestSchema.parse(req.body);
      const vendorRequest = await storage.createVendorRequest({
        ...requestData,
        userId: req.user.id,
      });

      // Update user vendor status to pending
      await storage.updateUserVendorStatus(req.user.id, 'pending');

      res.json(vendorRequest);
    } catch (error: any) {
      console.error("Error creating vendor request:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit vendor request" });
    }
  });

  // Admin vendor request routes
  app.get('/api/admin/vendor-requests', isAdminAuthenticated, async (req: any, res) => {
    try {
      const status = req.query.status as string;
      const requests = await storage.getVendorRequests(status);
      
      // Get user details for each request
      const { users, vendorRequests } = await import("@shared/schema");
      const requestsWithUsers = await db
        .select({
          id: vendorRequests.id,
          userId: vendorRequests.userId,
          businessName: vendorRequests.businessName,
          businessType: vendorRequests.businessType,
          contactNumber: vendorRequests.contactNumber,
          identificationDoc: vendorRequests.identificationDoc,
          businessRegistrationDoc: vendorRequests.businessRegistrationDoc,
          addressProofDoc: vendorRequests.addressProofDoc,
          description: vendorRequests.description,
          status: vendorRequests.status,
          rejectionReason: vendorRequests.rejectionReason,
          reviewedBy: vendorRequests.reviewedBy,
          reviewedAt: vendorRequests.reviewedAt,
          createdAt: vendorRequests.createdAt,
          updatedAt: vendorRequests.updatedAt,
          userName: users.username,
          userEmail: users.email,
        })
        .from(vendorRequests)
        .leftJoin(users, eq(vendorRequests.userId, users.id))
        .where(status ? eq(vendorRequests.status, status) : undefined)
        .orderBy(vendorRequests.createdAt);

      res.json(requestsWithUsers);
    } catch (error) {
      console.error("Error fetching vendor requests:", error);
      res.status(500).json({ message: "Failed to fetch vendor requests" });
    }
  });

  app.patch('/api/admin/vendor-requests/:id/approve', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Get admin user ID
      let adminId = req.user?.id;
      if (!adminId) {
        const adminUsers = await db.select().from(usersTable).where(eq(usersTable.role, 'admin')).limit(1);
        if (adminUsers.length > 0) {
          adminId = adminUsers[0].id;
        } else {
          return res.status(401).json({ message: "Admin user not found" });
        }
      }

      const request = await storage.approveVendorRequest(id, adminId);
      
      // Update user vendor status to verified
      await storage.updateUserVendorStatus(request.userId, 'verified');

      res.json({ message: "Vendor request approved successfully", request });
    } catch (error) {
      console.error("Error approving vendor request:", error);
      res.status(500).json({ message: "Failed to approve vendor request" });
    }
  });

  app.patch('/api/admin/vendor-requests/:id/reject', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }

      // Get admin user ID
      let adminId = req.user?.id;
      if (!adminId) {
        const adminUsers = await db.select().from(usersTable).where(eq(usersTable.role, 'admin')).limit(1);
        if (adminUsers.length > 0) {
          adminId = adminUsers[0].id;
        } else {
          return res.status(401).json({ message: "Admin user not found" });
        }
      }

      const request = await storage.rejectVendorRequest(id, adminId, reason);
      
      // Update user vendor status to rejected
      await storage.updateUserVendorStatus(request.userId, 'rejected');

      res.json({ message: "Vendor request rejected successfully", request });
    } catch (error) {
      console.error("Error rejecting vendor request:", error);
      res.status(500).json({ message: "Failed to reject vendor request" });
    }
  });

  // Admin route to download vendor request documents
  app.get('/api/admin/vendor-requests/:id/document/:type', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id, type } = req.params;
      
      // Get the vendor request from database
      const { vendorRequests } = await import("@shared/schema");
      const requests = await db.select().from(vendorRequests).where(eq(vendorRequests.id, id)).limit(1);
      const request = requests[0];
      
      if (!request) {
        return res.status(404).json({ message: "Vendor request not found" });
      }

      // Get the document path based on type
      let documentPath: string | null = null;
      switch (type) {
        case 'id':
          documentPath = request.identificationDoc;
          break;
        case 'business':
          documentPath = request.businessRegistrationDoc;
          break;
        case 'address':
          documentPath = request.addressProofDoc;
          break;
        default:
          return res.status(400).json({ message: "Invalid document type" });
      }

      if (!documentPath) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Parse the document path (format: bucket/path/to/file)
      const parts = documentPath.split('/');
      if (parts.length < 2) {
        return res.status(500).json({ message: "Invalid document path format" });
      }

      const bucketName = parts[0];
      const objectName = parts.slice(1).join('/');

      // Get the file from object storage
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).json({ message: "Document file not found in storage" });
      }

      // Download and stream the file
      const objectStorage = new ObjectStorageService();
      await objectStorage.downloadObject(file, res);
    } catch (error) {
      console.error("Error downloading vendor document:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to download document" });
      }
    }
  });

  // Admin route to geocode all listings without coordinates
  app.post('/api/admin/listings/geocode-all', isAdminAuthenticated, async (req: any, res) => {
    try {
      console.log('Starting geocoding for all listings without coordinates...');
      const allListings = await storage.getListings({});
      
      let geocodedCount = 0;
      let failedCount = 0;
      const results = [];
      
      for (const listing of allListings) {
        // Skip if already has coordinates or is online only
        if (listing.isOnlineOnly || (listing.latitude && listing.longitude)) {
          continue;
        }
        
        // Skip if no address information
        if (!listing.address && !listing.city) {
          continue;
        }
        
        console.log(`Geocoding listing ${listing.id}: ${listing.title}`);
        const coordinates = await geocodeAddress(
          listing.address || '', 
          listing.city || ''
        );
        
        if (coordinates) {
          await storage.updateListing(listing.id, {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          });
          geocodedCount++;
          results.push({
            id: listing.id,
            title: listing.title,
            success: true,
            coordinates
          });
          console.log(`Successfully geocoded listing ${listing.id}`);
        } else {
          failedCount++;
          results.push({
            id: listing.id,
            title: listing.title,
            success: false,
            address: listing.address,
            city: listing.city
          });
          console.log(`Failed to geocode listing ${listing.id}`);
        }
        
        // Add a small delay to avoid overwhelming the geocoding service
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      res.json({ 
        message: "Geocoding completed",
        geocodedCount,
        failedCount,
        results
      });
    } catch (error) {
      console.error("Error geocoding listings:", error);
      res.status(500).json({ message: "Failed to geocode listings" });
    }
  });

  // Admin route to export all listings to Excel
  app.get('/api/admin/listings/export', isAdminAuthenticated, async (req: any, res) => {
    try {
      const XLSX = (await import('xlsx')).default;
      const allListings = await storage.getListings({});
      
      // Prepare data for Excel
      const exportData = allListings.map(listing => ({
        ID: listing.id,
        Title: listing.title,
        Description: listing.description || '',
        Category: listing.categoryId || '',
        Address: listing.address || '',
        City: listing.city || '',
        PostalCode: listing.postalCode || '',
        Latitude: listing.latitude || '',
        Longitude: listing.longitude || '',
        Phone: listing.phone || '',
        Email: listing.email || '',
        Website: listing.website || '',
        Images: Array.isArray(listing.images) ? listing.images.join(', ') : '',
        Tags: Array.isArray(listing.tags) ? listing.tags.join(', ') : '',
        Status: listing.status || 'draft',
        IsOnlineOnly: listing.isOnlineOnly ? 'Yes' : 'No',
        ModerationStatus: listing.moderationStatus || 'pending',
        CreatedAt: listing.createdAt ? new Date(listing.createdAt).toISOString() : '',
      }));
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Auto-size columns
      const cols = Object.keys(exportData[0] || {}).map(key => ({ wch: Math.max(key.length, 15) }));
      ws['!cols'] = cols;
      
      XLSX.utils.book_append_sheet(wb, ws, 'Listings');
      
      // Generate buffer
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      
      // Send file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=listings-export-${Date.now()}.xlsx`);
      res.send(buf);
    } catch (error) {
      console.error('Error exporting listings:', error);
      res.status(500).json({ message: 'Failed to export listings' });
    }
  });

  // Admin route to import listings from Excel
  app.post('/api/admin/listings/import', isAdminAuthenticated, async (req: any, res) => {
    try {
      const XLSX = (await import('xlsx')).default;
      
      if (!req.body.fileData) {
        return res.status(400).json({ message: 'No file data provided' });
      }
      
      // Parse base64 file data
      const buffer = Buffer.from(req.body.fileData, 'base64');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      // Get admin user ID
      let userId = req.user?.id;
      const isAdmin = req.session?.adminAuth === true;
      
      if (isAdmin && !userId) {
        const adminUsers = await db.select().from(usersTable).where(eq(usersTable.role, 'admin')).limit(1);
        if (adminUsers.length > 0) {
          userId = adminUsers[0].id;
        }
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get all categories and create a mapping
      const allCategories = await storage.getCategories();
      const categoryMap = new Map<string, string>();
      
      // Map by name (case-insensitive)
      for (const cat of allCategories) {
        categoryMap.set(cat.name.toLowerCase(), cat.id);
      }
      
      console.log('Available categories:', Array.from(categoryMap.keys()));
      
      // Find a default category (School)
      const defaultCategoryId = allCategories.find(c => c.name === 'School')?.id || allCategories[0]?.id;
      
      let importedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      const results = [];
      
      for (const row of data as any[]) {
        try {
          const title = row.Title?.toString().trim();
          
          if (!title) {
            skippedCount++;
            results.push({ row, status: 'skipped', reason: 'Missing title' });
            continue;
          }
          
          // Parse images and tags
          const images = row.Images ? row.Images.toString().split(',').map((i: string) => i.trim()).filter(Boolean) : [];
          const tags = row.Tags ? row.Tags.toString().split(',').map((t: string) => t.trim()).filter(Boolean) : [];
          
          // Map category name to ID
          let categoryId = defaultCategoryId;
          if (row.Category) {
            const categoryName = row.Category.toString().trim().toLowerCase();
            categoryId = categoryMap.get(categoryName) || defaultCategoryId;
            if (!categoryMap.get(categoryName)) {
              console.log(`Category "${row.Category}" not found, using default. Available:`, Array.from(categoryMap.keys()));
            }
          }
          
          // Prepare listing data
          const listingData: any = {
            title,
            type: 'business',
            description: row.Description?.toString() || '',
            categoryId,
            address: row.Address?.toString() || '',
            city: row.City?.toString() || '',
            postalCode: row.PostalCode?.toString() || '',
            phone: row.Phone?.toString() || '',
            email: row.Email?.toString() || '',
            website: row.Website?.toString() || '',
            images,
            tags,
            status: row.Status?.toString() || 'draft',
            isOnlineOnly: row.IsOnlineOnly?.toString().toLowerCase() === 'yes',
            userId,
            moderationStatus: 'approved',
          };
          
          // Use coordinates from Excel if provided
          if (row.Latitude && row.Longitude) {
            listingData.latitude = row.Latitude?.toString() || '';
            listingData.longitude = row.Longitude?.toString() || '';
          }
          
          // Create the listing
          await storage.createListing(listingData);
          importedCount++;
          results.push({ row, status: 'imported', title });
        } catch (error: any) {
          console.error('Error importing listing:', error.message, 'Row:', row);
          errorCount++;
          results.push({ row, status: 'error', reason: error.message });
        }
      }
      
      res.json({
        message: 'Import completed',
        importedCount,
        skippedCount,
        errorCount,
        total: data.length,
        results
      });
    } catch (error) {
      console.error('Error importing listings:', error);
      res.status(500).json({ message: 'Failed to import listings' });
    }
  });

  // Admin reset categories route - keeps only specified categories
  app.post('/api/admin/reset-categories', isAdminAuthenticated, async (req: any, res) => {
    try {
      const requiredCategories = [
        { name: 'School', description: 'Educational institutions and schools' },
        { name: 'Online', description: 'Online services and businesses' },
        { name: 'Provision Store', description: 'Grocery and provision stores' },
        { name: 'Masjid', description: 'Mosques and Islamic centers' },
        { name: 'Services Store', description: 'Service-based businesses' },
        { name: 'Virtual Kitchen', description: 'Virtual and cloud kitchens' },
        { name: 'Arts Henna', description: 'Arts, henna, and creative services' },
        { name: 'Restaurant', description: 'Restaurants and dining establishments' },
      ];

      // Get all existing categories
      const existingCategories = await storage.getCategories();
      
      // First, create new categories if they don't exist
      const schoolCategory = requiredCategories.find(c => c.name === 'School');
      let schoolCategoryId = existingCategories.find(c => c.name === 'School')?.id;
      if (!schoolCategoryId && schoolCategory) {
        const newCat = await storage.createCategory(schoolCategory);
        schoolCategoryId = newCat.id;
      }
      
      // Update listings that use categories to be deleted to use School category
      let updatedListings = 0;
      for (const category of existingCategories) {
        if (!requiredCategories.find(rc => rc.name === category.name)) {
          // Get all listings using this category
          const listingsToUpdate = await storage.getListings({});
          for (const listing of listingsToUpdate) {
            if (listing.categoryId === category.id && schoolCategoryId) {
              await storage.updateListing(listing.id, { categoryId: schoolCategoryId });
              updatedListings++;
            }
          }
        }
      }
      
      // Now delete categories that are not in the required list
      let deletedCount = 0;
      for (const category of existingCategories) {
        if (!requiredCategories.find(rc => rc.name === category.name)) {
          try {
            await storage.deleteCategory(category.id);
            deletedCount++;
          } catch (error) {
            console.error(`Failed to delete category ${category.name}:`, error);
          }
        }
      }

      // Create missing categories
      let createdCount = 0;
      for (const reqCat of requiredCategories) {
        const exists = existingCategories.find(ec => ec.name === reqCat.name);
        if (!exists) {
          await storage.createCategory(reqCat);
          createdCount++;
        }
      }

      res.json({
        success: true,
        message: 'Categories reset successfully',
        deleted: deletedCount,
        created: createdCount,
        updatedListings,
        total: requiredCategories.length,
      });
    } catch (error: any) {
      console.error("Error resetting categories:", error);
      res.status(500).json({ 
        message: "Failed to reset categories", 
        error: error.message || String(error),
      });
    }
  });

  // Admin seed endpoint for demo data
  app.post('/api/admin/seed-demo', isAdminAuthenticated, async (req: any, res) => {
    try {
      // Get or find a valid user ID for creating listings
      let userId = req.session?.adminAuth?.userId;
      
      // If no user ID from session, try to find the admin user
      if (!userId) {
        const adminUser = await storage.getUserByUsername('admin');
        if (adminUser) {
          userId = adminUser.id;
        }
      }
      
      // If still no user, get any user from the database or create a system user
      if (!userId) {
        // Try to get any existing user
        const users = await db.select().from(usersTable).limit(1);
        if (users.length > 0) {
          userId = users[0].id;
        } else {
          // Create a system user for seeding if no users exist
          const [systemUser] = await db.insert(usersTable).values({
            username: 'system-seed',
            email: 'system@emchub.com',
            password: 'not-used', // This user won't be used for login
            role: 'admin',
          }).returning();
          userId = systemUser.id;
        }
      }

      const results = {
        categoriesCreated: 0,
        listingsCreated: 0,
        listingsSkipped: 0,
      };

      // 1. Ensure categories exist
      const categories = await storage.getCategories();
      let educationCategory = categories.find(c => c.name === 'Education');
      let artsCategory = categories.find(c => c.name === 'Arts');
      
      if (!educationCategory) {
        educationCategory = await storage.createCategory({
          name: 'Education',
          description: 'Educational institutions and services',
        });
        results.categoriesCreated++;
      }

      if (!artsCategory) {
        artsCategory = await storage.createCategory({
          name: 'Arts',
          description: 'Arts and creative services',
        });
        results.categoriesCreated++;
      }

      // 2. Define the demo listings
      const demoListings = [
        {
          title: 'Islamic Primary School',
          description: 'Islamic Primary School of Hong Kong provides quality Islamic education combining academic excellence with Islamic values. Located in Hong Kong, the school offers a comprehensive curriculum for primary-aged students.',
          type: 'business',
          categoryId: educationCategory.id,
          address: 'Hong Kong',
          city: 'Hong Kong',
          latitude: '22.3193',
          longitude: '114.1694',
          phone: '+852 1234 5678',
          email: 'info@islamicprimary.edu.hk',
          isOnlineOnly: false,
          status: 'published' as const,
        },
        {
          title: 'EdSquare',
          description: 'EdSquare is an educational center providing quality tutoring and learning support services. We focus on helping students achieve their academic goals through personalized learning approaches.',
          type: 'business',
          categoryId: educationCategory.id,
          address: 'Hong Kong',
          city: 'Hong Kong',
          latitude: '22.3220',
          longitude: '114.1700',
          phone: '+852 2345 6789',
          email: 'contact@edsquare.edu.hk',
          isOnlineOnly: false,
          status: 'published' as const,
        },
        {
          title: 'Ease Education Limited',
          description: 'TCCA 2/F, Waterside Plaza, 38 Wong Shun Street Tuen Wan, New Territories Hong Kong SAR\n\nEase Education is a charitable institution or trust of a public character, is exempt from tax under Section 88 of the Inland revenue ordinance. Our mission is to promote excellence in academics, personal responsibility, and character development and to instill life long learning.',
          type: 'business',
          categoryId: educationCategory.id,
          address: 'TCCA 2/F, Waterside Plaza, 38 Wong Shun Street Tuen Wan, New Territories',
          city: 'Hong Kong',
          latitude: '22.3705',
          longitude: '114.1090',
          phone: '+852 3456 7890',
          email: 'info@easeeducation.org.hk',
          isOnlineOnly: false,
          status: 'published' as const,
        },
        {
          title: 'Alif Complementary Educational Services',
          description: 'On-demand educational courses uniquely suited to the audiences needs such as note-taking, financial literacy, mnemonics and other study skills.',
          type: 'business',
          categoryId: educationCategory.id,
          address: 'Hong Kong SAR, China',
          city: 'Hong Kong',
          latitude: '22.3193',
          longitude: '114.1694',
          phone: '+852 4567 8901',
          email: 'support@alifservices.edu.hk',
          isOnlineOnly: true,
          status: 'published' as const,
        },
        {
          title: 'mehndilicious_',
          description: '📍🇵🇰|🇭🇰 ~💯Organic cones\n\nDm to book henna service for any occasion 🇭🇰',
          type: 'business',
          categoryId: artsCategory.id,
          address: 'Quarry Bay, Hong Kong',
          city: 'Hong Kong',
          latitude: '22.2875',
          longitude: '114.2100',
          phone: '+852 9876 5432',
          email: 'mehndilicious@example.com',
          website: 'https://www.instagram.com/mehndilicious/?hl=en',
          isOnlineOnly: false,
          status: 'published' as const,
        },
      ];

      // 3. Create listings if they don't already exist (check by title)
      const existingListings = await storage.getListings({});
      
      for (const demoListing of demoListings) {
        const exists = existingListings.some(l => l.title === demoListing.title);
        
        if (!exists) {
          // Create listing with system/admin as owner
          const newListing = await storage.createListing({
            ...demoListing,
            userId: userId,
          });
          
          // Immediately approve it so it shows publicly
          await storage.adminApproveListing(newListing.id, userId, 'Demo seed data');
          results.listingsCreated++;
        } else {
          results.listingsSkipped++;
        }
      }

      res.json({
        success: true,
        message: 'Demo data seeded successfully',
        results,
      });
    } catch (error: any) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ 
        message: "Failed to seed demo data", 
        error: error.message || String(error),
        details: error.stack 
      });
    }
  });

  // Protected route example
  app.get("/api/protected", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.id;
    res.json({ message: "This is a protected route", userId });
  });

  // Object Storage routes - for listing images
  app.post("/api/objects/upload", isAdminAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Profile picture upload - accessible to all authenticated users
  app.post("/api/profile/upload", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting profile upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/profile/image", isAuthenticated, async (req: any, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: req.user.id,
          visibility: "public",
        },
      );

      // Update user's profile image URL
      const userId = req.user.id;
      await storage.updateUserProfile(userId, { profileImageUrl: objectPath });

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting profile image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vendor document upload - accessible to all authenticated users
  app.post("/api/vendor/upload", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting vendor document upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/vendor/document", isAuthenticated, async (req: any, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: req.user.id,
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting vendor document:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Object storage upload URL for user listings - accessible to all authenticated users
  app.post("/api/object-storage/upload-url", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ url: uploadURL });
    } catch (error) {
      console.error("Error getting object storage upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.put("/api/listing-images", isAdminAuthenticated, async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: "admin",
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting listing image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ========================================
  // COUPON ROUTES
  // ========================================
  
  // Create new coupon (verified vendors only)
  app.post("/api/coupons", isAuthenticated, async (req, res) => {
    if (req.user.vendorStatus !== 'verified') {
      return res.status(403).json({ error: "Only verified vendors can create coupons" });
    }
    
    try {
      const { 
        code, 
        title, 
        description, 
        discountType, 
        cashDiscountType, 
        cashDiscountValue, 
        tdDiscountType, 
        tdDiscountValue, 
        usageLimit, 
        validFrom, 
        validUntil 
      } = req.body;
      
      const coupon = await storage.createCoupon({
        vendorId: req.user.id,
        code,
        title,
        description,
        discountType,
        cashDiscountType,
        cashDiscountValue,
        tdDiscountType,
        tdDiscountValue,
        usageLimit,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
      });
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id,
        userName: req.user.username,
        actionType: 'create',
        entityType: 'coupon',
        entityId: coupon.id,
        entityTitle: coupon.title || coupon.code,
        description: `Created coupon: ${coupon.code} - ${coupon.title}`,
        metadata: { coupon },
      });
      
      res.status(201).json(coupon);
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(500).json({ error: "Failed to create coupon" });
    }
  });
  
  // Get vendor's own coupons
  app.get("/api/coupons/vendor", isAuthenticated, async (req, res) => {
    try {
      const coupons = await storage.getVendorCoupons(req.user.id);
      res.json(coupons);
    } catch (error) {
      console.error("Error getting vendor coupons:", error);
      res.status(500).json({ error: "Failed to get coupons" });
    }
  });
  
  // Get all coupons (admin only)
  app.get("/api/admin/coupons", isAdminAuthenticated, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const coupons = await storage.getAllCoupons(status);
      res.json(coupons);
    } catch (error) {
      console.error("Error getting all coupons:", error);
      res.status(500).json({ error: "Failed to get coupons" });
    }
  });
  
  // Validate coupon
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, vendorId, cashAmount, tdAmount } = req.body;
      console.log('🎫 Coupon validation request:', { code, vendorId, cashAmount, tdAmount });
      const validation = await storage.validateCoupon(code, vendorId, cashAmount || 0, tdAmount || 0);
      console.log('🎫 Coupon validation result (full):', JSON.stringify(validation, null, 2));
      res.json(validation);
    } catch (error) {
      console.error("Error validating coupon:", error);
      res.status(500).json({ error: "Failed to validate coupon" });
    }
  });
  
  // Get coupon analytics (vendor only - for their own coupons)
  app.get("/api/coupons/:id/analytics", isAuthenticated, async (req, res) => {
    try {
      const coupon = await storage.getCouponById(req.params.id);
      
      if (!coupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      
      // Check if user owns this coupon
      if (coupon.vendorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const analytics = await storage.getCouponAnalytics(req.params.id);
      res.json(analytics);
    } catch (error) {
      console.error("Error getting coupon analytics:", error);
      res.status(500).json({ error: "Failed to get analytics" });
    }
  });
  
  // Update coupon
  app.put("/api/coupons/:id", isAuthenticated, async (req, res) => {
    try {
      const coupon = await storage.getCouponById(req.params.id);
      
      if (!coupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      
      // Check if user owns this coupon
      if (coupon.vendorId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updatedCoupon = await storage.updateCoupon(req.params.id, req.body);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id,
        userName: req.user.username,
        actionType: 'update',
        entityType: 'coupon',
        entityId: updatedCoupon.id,
        entityTitle: updatedCoupon.title || updatedCoupon.code,
        description: `Updated coupon: ${updatedCoupon.code}`,
        metadata: { coupon: updatedCoupon },
      });
      
      res.json(updatedCoupon);
    } catch (error) {
      console.error("Error updating coupon:", error);
      res.status(500).json({ error: "Failed to update coupon" });
    }
  });
  
  // Delete coupon
  app.delete("/api/coupons/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCoupon(req.params.id);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id,
        userName: req.user.username,
        actionType: 'delete',
        entityType: 'coupon',
        entityId: req.params.id,
        description: `Deleted coupon`,
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ error: "Failed to delete coupon" });
    }
  });
  
  // ========================================
  // STAFF HELP REQUEST ROUTES
  // ========================================
  
  // Create staff help request
  app.post("/api/staff-help", isAuthenticated, async (req, res) => {
    try {
      const { listingType, message } = req.body;
      
      const request = await storage.createStaffHelpRequest({
        userId: req.user.id,
        userName: req.user.username,
        listingType,
        message,
      });
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id,
        userName: req.user.username,
        actionType: 'create',
        entityType: 'staff_help_request',
        entityId: request.id,
        description: `Requested staff help for ${listingType}`,
        metadata: { request },
      });
      
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating staff help request:", error);
      res.status(500).json({ error: "Failed to create request" });
    }
  });
  
  // Get user's own staff help requests
  app.get("/api/staff-help/user", isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getUserStaffHelpRequests(req.user.id);
      res.json(requests);
    } catch (error) {
      console.error("Error getting user staff help requests:", error);
      res.status(500).json({ error: "Failed to get requests" });
    }
  });
  
  // Get all staff help requests (admin/staff only)
  app.get("/api/admin/staff-help", isAdminAuthenticated, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const requests = await storage.getAllStaffHelpRequests(status);
      res.json(requests);
    } catch (error) {
      console.error("Error getting all staff help requests:", error);
      res.status(500).json({ error: "Failed to get requests" });
    }
  });
  
  // Assign staff help request (admin/staff only)
  app.put("/api/admin/staff-help/:id/assign", isAdminAuthenticated, async (req, res) => {
    try {
      const request = await storage.assignStaffHelpRequest(req.params.id, req.user.id);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id,
        userName: req.user.username,
        actionType: 'update',
        entityType: 'staff_help_request',
        entityId: request.id,
        description: `Assigned staff help request to ${req.user.username}`,
        metadata: { request },
      });
      
      res.json(request);
    } catch (error) {
      console.error("Error assigning staff help request:", error);
      res.status(500).json({ error: "Failed to assign request" });
    }
  });
  
  // Complete staff help request (admin/staff only)
  app.put("/api/admin/staff-help/:id/complete", isAdminAuthenticated, async (req, res) => {
    try {
      const { notes } = req.body;
      const request = await storage.completeStaffHelpRequest(req.params.id, notes);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id,
        userName: req.user.username,
        actionType: 'update',
        entityType: 'staff_help_request',
        entityId: request.id,
        description: `Completed staff help request`,
        metadata: { request },
      });
      
      res.json(request);
    } catch (error) {
      console.error("Error completing staff help request:", error);
      res.status(500).json({ error: "Failed to complete request" });
    }
  });
  
  // ========================================
  // ACTIVITY LOG ROUTES
  // ========================================
  
  // Get all activity logs (admin only)
  app.get("/api/admin/activity-logs", isAdminAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getAllActivityLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error getting activity logs:", error);
      res.status(500).json({ error: "Failed to get activity logs" });
    }
  });
  
  // Get user's activity logs
  app.get("/api/activity-logs/user", isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getUserActivityLogs(req.user.id, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error getting user activity logs:", error);
      res.status(500).json({ error: "Failed to get activity logs" });
    }
  });
  
  // ========================================
  // TIMEDOLLAR ROUTES
  // ========================================
  
  // Get TimeDollar balance
  app.get("/api/timedollars/balance", isAuthenticated, async (req, res) => {
    try {
      const balance = await storage.getTimeDollarBalance(req.user.id);
      res.json({ balance });
    } catch (error) {
      console.error("Error getting TimeDollar balance:", error);
      res.status(500).json({ error: "Failed to get balance" });
    }
  });
  
  // Get TimeDollar transactions
  app.get("/api/timedollars/transactions", isAuthenticated, async (req, res) => {
    try {
      // For now, return empty array - will implement proper transactions table later
      res.json([]);
    } catch (error) {
      console.error("Error getting TimeDollar transactions:", error);
      res.status(500).json({ error: "Failed to get transactions" });
    }
  });
  
  // Update TimeDollar balance (admin only for manual adjustments)
  app.put("/api/admin/timedollars/:userId", isAdminAuthenticated, async (req, res) => {
    try {
      const { amount } = req.body;
      const user = await storage.updateTimeDollarBalance(req.params.userId, amount);
      
      // Log activity
      await storage.createActivityLog({
        userId: req.user.id,
        userName: req.user.username,
        actionType: 'update',
        entityType: 'timedollar',
        entityId: req.params.userId,
        description: `Adjusted TimeDollar balance by ${amount}`,
        metadata: { userId: req.params.userId, amount, newBalance: user.timeDollarBalance },
      });
      
      res.json({ balance: user.timeDollarBalance });
    } catch (error) {
      console.error("Error updating TimeDollar balance:", error);
      res.status(500).json({ error: "Failed to update balance" });
    }
  });

  // ========================================
  // SHOPPING CART ROUTES
  // ========================================
  
  // Get user's cart items
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const cartItems = await storage.getUserCartItems(req.user.id);
      res.json(cartItems);
    } catch (error) {
      console.error("Error getting cart items:", error);
      res.status(500).json({ error: "Failed to get cart items" });
    }
  });
  
  // Add item to cart
  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      const cartItem = await storage.addToCart(req.user.id, productId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });
  
  // Update cart item quantity
  app.put("/api/cart/:itemId", isAuthenticated, async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItemQuantity(req.params.itemId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });
  
  // Remove item from cart
  app.delete("/api/cart/:itemId", isAuthenticated, async (req, res) => {
    try {
      await storage.removeCartItem(req.params.itemId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });
  
  // Clear cart
  app.delete("/api/cart", isAuthenticated, async (req, res) => {
    try {
      await storage.clearCart(req.user.id);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });
  
  // ========================================
  // ORDER ROUTES
  // ========================================
  
  // Create order from cart
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orderData = req.body;
      const order = await storage.createOrder(req.user.id, orderData);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });
  
  // Get user's orders
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.user.id);
      res.json(orders);
    } catch (error) {
      console.error("Error getting orders:", error);
      res.status(500).json({ error: "Failed to get orders" });
    }
  });
  
  // Get user's orders (alias route)
  app.get("/api/orders/user", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.user.id);
      res.json(orders);
    } catch (error) {
      console.error("Error getting orders:", error);
      res.status(500).json({ error: "Failed to get orders" });
    }
  });
  
  // Get order details
  app.get("/api/orders/:orderId", isAuthenticated, async (req, res) => {
    try {
      const order = await storage.getOrderDetails(req.params.orderId);
      res.json(order);
    } catch (error) {
      console.error("Error getting order details:", error);
      res.status(500).json({ error: "Failed to get order details" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
