import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { 
  insertBusinessListingSchema, 
  insertListingSchema,
  insertCategorySchema,
  insertBookingSchema,
  users as usersTable
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
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
      
      // Auto-approve listings created by admins
      const moderationStatus = isAdmin ? 'approved' : 'pending';
      
      // New listings default to 'draft' status
      const listing = await storage.createListing({
        ...listingData,
        userId,
        moderationStatus,
        status: 'draft',
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

  app.get('/api/listings/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const listing = await storage.getListing(id);
      
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Only show approved and published listings to public
      if (listing.moderationStatus !== 'approved' || listing.status !== 'published') {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      res.json(listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ message: "Failed to fetch listing" });
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

  // Coupon validation route
  app.post('/api/coupons/validate', async (req, res) => {
    try {
      const { code, amount } = req.body;
      const validation = await storage.validateCoupon(code, amount);
      res.json(validation);
    } catch (error) {
      console.error("Error validating coupon:", error);
      res.status(500).json({ message: "Failed to validate coupon" });
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
        isAdmin: user.role === 'admin'
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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

  app.patch('/api/admin/listings/:id/approve', isAdminAuthenticated, async (req: any, res) => {
    try {
      const listingId = req.params.id;
      const { notes } = req.body;
      const adminId = req.session?.adminAuth?.userId || 'system';
      await storage.adminApproveListing(listingId, adminId, notes);
      res.json({ message: "Listing approved successfully" });
    } catch (error) {
      console.error("Error approving listing:", error);
      res.status(500).json({ message: "Failed to approve listing" });
    }
  });

  app.patch('/api/admin/listings/:id/reject', isAdminAuthenticated, async (req: any, res) => {
    try {
      const listingId = req.params.id;
      const { reason } = req.body;
      const adminId = req.session?.adminAuth?.userId || 'system';
      await storage.adminRejectListing(listingId, adminId, reason);
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
          
          // Prepare listing data
          const listingData: any = {
            title,
            type: 'business',
            description: row.Description?.toString() || '',
            categoryId: row.Category?.toString() || '',
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

  const httpServer = createServer(app);
  return httpServer;
}
