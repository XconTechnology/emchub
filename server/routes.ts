import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword } from "./auth";
import { isSuperAdmin, isStaffAuthenticated, requireStaffAccess, Resources, StaffRoles } from "./rbac";
import { 
  insertBusinessListingSchema, 
  insertListingSchema,
  insertCategorySchema,
  insertBookingSchema,
  insertVendorRequestSchema,
  insertEventRegistrationSchema,
  eventRegistrationFormSchema,
  users as usersTable,
  serviceOffers,
  serviceRequests,
  serviceRequestFees
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, or, desc } from "drizzle-orm";
import { ObjectStorageService, ObjectNotFoundError, objectStorageClient } from "./objectStorage";
import { geocodeAddress, delay } from "./geocoding";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs";

// Initialize Stripe with test mode keys
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

// WebSocket clients storage
const wsClients = new Set<WebSocket>();

// Broadcast event to all connected WebSocket clients
function broadcastEvent(event: { type: string; data: any }) {
  const message = JSON.stringify(event);
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Debug endpoint to test domain
function setupDebugRoutes(app: Express) {
  app.get('/api/debug', (req, res) => {
    res.json({
      domain: req.hostname,
      headers: req.headers,
      protocol: req.protocol,
      url: req.url,
      originalUrl: req.originalUrl,
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT
      }
    });
  });

  app.get('/debug.html', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Domain Debug - ${req.hostname}</title>
    <style>
        body { font-family: Arial; padding: 50px; background: #f0f0f0; }
        .success { color: green; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        .info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="success">✅ Server is Responding!</div>
    <div class="info">
        <h2>Domain Information:</h2>
        <p><strong>Current Domain:</strong> <code id="domain"></code></p>
        <p><strong>JavaScript Status:</strong> <span id="js-status" style="color:green">✅ Working</span></p>
        <p><strong>Server Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Client Time:</strong> <span id="time"></span></p>
    </div>
    <script>
        document.getElementById('domain').textContent = window.location.hostname;
        document.getElementById('time').textContent = new Date().toLocaleString();
        console.log('✅ JavaScript executing on:', window.location.hostname);
        console.log('✅ Page loaded successfully');
    </script>
</body>
</html>`);
  });
}

// Admin middleware for session-based admin authentication
const isAdminAuthenticated = async (req: any, res: any, next: any) => {
  console.log('Admin auth check:', { 
    hasSession: !!req.session, 
    adminAuth: req.session?.adminAuth,
    userRole: req.user?.role,
    path: req.path 
  });
  
  // Check if logged in via admin session OR if regular user with admin role
  if (req.session?.adminAuth || req.user?.role === 'admin') {
    return next();
  }
  
  return res.status(401).json({ message: "Admin authentication required" });
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

  // Setup debug routes for troubleshooting domain issues
  setupDebugRoutes(app);

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

      // Create coupon if requested (only for products and vendors)
      let couponCreated = false;
      if (req.body.createCoupon && req.body.coupon && listing.type === 'product') {
        // Check if user is vendor or admin
        const user = await storage.getUser(userId);
        if (user && (user.role === 'vendor' || user.role === 'admin')) {
          try {
            const couponData = req.body.coupon;
            
            // Validate coupon fields
            if (!couponData.code || !couponData.title || !couponData.discountType || !couponData.discountValue) {
              console.error('Invalid coupon data: missing required fields');
            } else {
              const coupon = await storage.createCoupon({
                vendorId: userId,
                productId: listing.id,
                code: couponData.code.toUpperCase(),
                title: couponData.title,
                description: couponData.description || `${couponData.title} for ${listing.title}`,
                couponType: 'discount', // Product coupons are always discount type
                issuer: 'vendor', // Product coupons are vendor-issued
                scope: 'product', // Automatically product-specific
                discountType: couponData.discountType,
                discountValue: parseFloat(couponData.discountValue),
                usageLimit: couponData.usageLimit ? parseInt(couponData.usageLimit) : null,
                validUntil: couponData.validUntil ? new Date(couponData.validUntil) : null,
                status: 'pending', // Vendor coupons require admin approval
                isActive: true,
              });
              couponCreated = true;
              console.log('Created coupon:', coupon);
            }
          } catch (couponError) {
            console.error('Error creating coupon:', couponError);
            // Don't fail the listing creation if coupon creation fails
          }
        } else {
          console.error('Only vendors and admins can create product coupons');
        }
      }
      
      res.json({ ...listing, couponCreated });
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

  // Vendor recycle bin routes
  app.get('/api/listings/user/deleted', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const deletedListings = await storage.getUserDeletedListings(userId);
      res.json(deletedListings);
    } catch (error) {
      console.error("Error fetching deleted listings:", error);
      res.status(500).json({ message: "Failed to fetch deleted listings" });
    }
  });

  app.post('/api/listings/:id/restore', isAuthenticated, async (req: any, res) => {
    try {
      const listingId = req.params.id;
      const userId = req.user.id;
      
      // Verify the listing belongs to the user
      const existingListing = await storage.getListing(listingId);
      if (!existingListing || existingListing.userId !== userId) {
        return res.status(404).json({ message: "Listing not found or access denied" });
      }
      
      const listing = await storage.restoreListing(listingId);
      res.json({ message: "Listing restored successfully", listing });
    } catch (error) {
      console.error("Error restoring listing:", error);
      res.status(500).json({ message: "Failed to restore listing" });
    }
  });

  app.delete('/api/listings/:id/permanent', isAuthenticated, async (req: any, res) => {
    try {
      const listingId = req.params.id;
      const userId = req.user.id;
      
      // Verify the listing belongs to the user
      const existingListing = await storage.getListing(listingId);
      if (!existingListing || existingListing.userId !== userId) {
        return res.status(404).json({ message: "Listing not found or access denied" });
      }
      
      await storage.permanentlyDeleteListing(listingId);
      res.json({ message: "Listing permanently deleted" });
    } catch (error) {
      console.error("Error permanently deleting listing:", error);
      res.status(500).json({ message: "Failed to permanently delete listing" });
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
      
      // Handle coupon update/creation if requested
      let couponUpdated = false;
      if (req.body.createCoupon && req.body.coupon && existingListing.type === 'product') {
        // Check if user is vendor or admin
        const user = await storage.getUser(userId);
        if (user && (user.role === 'vendor' || user.role === 'admin')) {
          try {
            const couponData = req.body.coupon;
            const { coupons: couponsTable } = await import("@shared/schema");
            
            // Check if coupon already exists for this product
            const existingCoupons = await db
              .select()
              .from(couponsTable)
              .where(eq(couponsTable.productId, id))
              .limit(1);
            
            if (existingCoupons.length > 0) {
              // Check if existing coupon is approved and user is not admin
              const existingCoupon = existingCoupons[0];
              if (existingCoupon.status === 'approved' && user.role !== 'admin') {
                console.log('Cannot update approved coupon - it is locked');
                // Skip coupon update for approved coupons
              } else {
                // Update existing coupon
                await db
                  .update(couponsTable)
                  .set({
                    code: couponData.code.toUpperCase(),
                    title: couponData.title,
                    description: couponData.description || `${couponData.title} for ${updatedListing.title}`,
                    discountType: couponData.discountType,
                    discountValue: parseFloat(couponData.discountValue),
                    usageLimit: couponData.usageLimit ? parseInt(couponData.usageLimit) : null,
                    validUntil: couponData.validUntil ? new Date(couponData.validUntil) : null,
                    status: 'pending', // Re-submit for approval when updated
                  })
                  .where(eq(couponsTable.id, existingCoupon.id));
                couponUpdated = true;
                console.log('Updated existing coupon:', existingCoupon.id);
              }
            } else {
              // Create new coupon
              const coupon = await storage.createCoupon({
                vendorId: userId,
                productId: id,
                code: couponData.code.toUpperCase(),
                title: couponData.title,
                description: couponData.description || `${couponData.title} for ${updatedListing.title}`,
                couponType: 'discount',
                issuer: 'vendor',
                scope: 'product',
                discountType: couponData.discountType,
                discountValue: parseFloat(couponData.discountValue),
                usageLimit: couponData.usageLimit ? parseInt(couponData.usageLimit) : null,
                validUntil: couponData.validUntil ? new Date(couponData.validUntil) : null,
                status: 'pending',
                isActive: true,
              });
              couponUpdated = true;
              console.log('Created new coupon:', coupon);
            }
          } catch (couponError) {
            console.error('Error updating/creating coupon:', couponError);
          }
        }
      }
      
      res.json({ ...updatedListing, couponUpdated });
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
      
      // Delete associated coupons first (if product type)
      if (existingListing.type === 'product') {
        const { coupons: couponsTable } = await import("@shared/schema");
        await db.delete(couponsTable).where(eq(couponsTable.productId, id));
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

  // Event Registration endpoints
  app.post('/api/events/:eventId/register', async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id || null;

      // Get event to check capacity and vendor
      const event = await storage.getListing(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (event.type !== 'event') {
        return res.status(400).json({ message: "Not an event listing" });
      }
      if (event.status !== 'published') {
        return res.status(400).json({ message: "Event is not available for registration" });
      }

      // Check capacity
      if (event.capacity && event.attendeeCount && event.attendeeCount >= event.capacity) {
        return res.status(400).json({ message: "Event is at full capacity" });
      }

      // Parse registration data (only user-submitted fields)
      const registrationData = eventRegistrationFormSchema.parse(req.body);

      // Check if already registered (by userId or email)
      const alreadyRegistered = await storage.checkUserRegisteredForEvent(
        eventId, 
        userId, 
        registrationData.email
      );
      if (alreadyRegistered) {
        return res.status(400).json({ message: "You are already registered for this event" });
      }

      // Create registration
      const registration = await storage.createEventRegistration({
        ...registrationData,
        eventId,
        vendorId: event.userId,
        userId,
      });

      res.json(registration);
    } catch (error: any) {
      console.error("Error creating event registration:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid registration data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  app.get('/api/vendor/events/:eventId/registrations', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Verify event ownership
      const event = await storage.getListing(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      if (event.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to view these registrations" });
      }

      const registrations = await storage.getEventRegistrationsByEvent(eventId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching event registrations:", error);
      res.status(500).json({ message: "Failed to fetch event registrations" });
    }
  });

  app.get('/api/vendor/all-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const registrations = await storage.getVendorEventRegistrations(userId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching vendor event registrations:", error);
      res.status(500).json({ message: "Failed to fetch event registrations" });
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
        role: user.role,
        isAdmin: user.role === 'admin',
        vendorStatus: user.vendorStatus,
        profileImageUrl: user.profileImageUrl,
        tdCashSplitPercentage: user.tdCashSplitPercentage
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get user by ID (for fetching vendor info at checkout)
  app.get('/api/users/:userId', async (req: any, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return only public user information
      res.json({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        vendorStatus: user.vendorStatus,
        profileImageUrl: user.profileImageUrl,
        tdCashSplitPercentage: user.tdCashSplitPercentage
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

  // Admin analytics endpoint
  app.get('/api/admin/analytics', isAdminAuthenticated, async (req: any, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  // Admin transactions endpoint
  app.get('/api/admin/transactions', isAdminAuthenticated, async (req: any, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
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

  // Admin route to get all users with filters
  app.get('/api/admin/users', isAdminAuthenticated, async (req: any, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        role: req.query.role as string,
        status: req.query.status as string,
        vendorStatus: req.query.vendorStatus as string,
      };
      
      const users = await storage.getUsersWithFilters(filters);
      
      // If user is not super-admin, remove PII fields
      // Session-based admins are always regular admins (not super-admins)
      const isSuperAdmin = req.user?.role === 'super-admin';
      
      if (!isSuperAdmin) {
        const sanitizedUsers = users.map(user => ({
          ...user,
          email: undefined,
          phone: undefined,
          password: undefined,
          firstName: undefined,
          lastName: undefined,
        }));
        return res.json(sanitizedUsers);
      }
      
      // Super-admins get full data (but still hide password)
      const sanitizedUsers = users.map(user => ({
        ...user,
        password: undefined,
      }));
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Admin route to update user
  app.put('/api/admin/users/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const updates = req.body;
      
      // Check if trying to update PII fields
      const piiFields = ['email', 'phone', 'firstName', 'lastName'];
      const hasPiiUpdate = piiFields.some(field => updates.hasOwnProperty(field));
      
      // Only super-admins can update PII fields
      // Session-based admins are always regular admins (not super-admins)
      const isSuperAdmin = req.user?.role === 'super-admin';
      
      if (hasPiiUpdate && !isSuperAdmin) {
        return res.status(403).json({ message: "Only super-admins can update PII fields (email, phone, firstName, lastName)" });
      }
      
      // Don't allow updating password through this endpoint
      delete updates.password;
      delete updates.resetPasswordToken;
      delete updates.resetPasswordExpires;
      delete updates.createdAt;
      delete updates.id;
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      // Get admin ID and username for activity log
      let adminId: string;
      let adminUsername: string;
      
      if (req.user) {
        adminId = req.user.id;
        adminUsername = req.user.username;
      } else if (req.session?.adminAuth === true) {
        // Use system admin for session-based admin
        const adminUsers = await db.select().from(usersTable)
          .where(eq(usersTable.username, 'system_admin'))
          .limit(1);
        
        if (adminUsers.length > 0) {
          adminId = adminUsers[0].id;
          adminUsername = adminUsers[0].username;
        } else {
          adminId = 'system';
          adminUsername = 'admin';
        }
      } else {
        adminId = 'unknown';
        adminUsername = 'admin';
      }
      
      // Log the activity
      await storage.createActivityLog({
        userId: adminId,
        userName: adminUsername,
        actionType: 'update',
        entityType: 'user',
        entityId: userId,
        entityTitle: updatedUser.username,
        description: `Updated user: ${updatedUser.username}`,
        metadata: { updates }
      });
      
      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Admin route to suspend user
  app.post('/api/admin/users/:id/suspend', isAdminAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      
      // Get admin ID - handle both Passport and session-based auth
      let adminId: string;
      if (req.user) {
        adminId = req.user.id;
      } else if (req.session?.adminAuth === true) {
        // Use system admin for session-based admin
        const adminUsers = await db.select().from(usersTable)
          .where(eq(usersTable.username, 'system_admin'))
          .limit(1);
        adminId = adminUsers.length > 0 ? adminUsers[0].id : 'system';
      } else {
        adminId = 'unknown';
      }
      
      const updatedUser = await storage.suspendUser(userId, adminId);
      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      console.error("Error suspending user:", error);
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });
  
  // Admin route to reactivate user
  app.post('/api/admin/users/:id/reactivate', isAdminAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      
      // Get admin ID - handle both Passport and session-based auth
      let adminId: string;
      if (req.user) {
        adminId = req.user.id;
      } else if (req.session?.adminAuth === true) {
        // Use system admin for session-based admin
        const adminUsers = await db.select().from(usersTable)
          .where(eq(usersTable.username, 'system_admin'))
          .limit(1);
        adminId = adminUsers.length > 0 ? adminUsers[0].id : 'system';
      } else {
        adminId = 'unknown';
      }
      
      const updatedUser = await storage.reactivateUser(userId, adminId);
      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      console.error("Error reactivating user:", error);
      res.status(500).json({ message: "Failed to reactivate user" });
    }
  });
  
  // Admin route to reset user password
  app.post('/api/admin/users/:id/reset-password', isAdminAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      
      // Hash the new password using the same method as auth system
      const { hashPassword } = await import("./auth");
      const hashedPassword = await hashPassword(newPassword);
      
      const updatedUser = await storage.adminResetUserPassword(userId, hashedPassword);
      
      // Get admin user ID and username for activity log
      let adminId: string;
      let adminUsername: string;
      
      if (req.user) {
        // Admin via Passport authentication
        adminId = req.user.id;
        adminUsername = req.user.username;
      } else if (req.session?.adminAuth === true) {
        // Admin via session - use system admin
        const adminUsers = await db.select().from(usersTable)
          .where(eq(usersTable.username, 'system_admin'))
          .limit(1);
        
        if (adminUsers.length > 0) {
          adminId = adminUsers[0].id;
          adminUsername = adminUsers[0].username;
        } else {
          // Fallback if system admin doesn't exist
          adminId = 'system';
          adminUsername = 'admin';
        }
      } else {
        // Fallback (should not happen due to middleware)
        adminId = 'unknown';
        adminUsername = 'admin';
      }
      
      // Log the activity
      await storage.createActivityLog({
        userId: adminId,
        userName: adminUsername,
        actionType: 'reset_password',
        entityType: 'user',
        entityId: userId,
        entityTitle: updatedUser.username,
        description: `Reset password for user: ${updatedUser.username}`,
        metadata: { userId }
      });
      
      res.json({ message: "Password reset successfully", user: { ...updatedUser, password: undefined } });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // ========================================
  // STAFF MANAGEMENT ROUTES (Admin Only)
  // ========================================
  
  // Create new staff user
  app.post('/api/staff/create', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { username, email, password, staffRole, firstName, lastName } = req.body;
      
      // Validate required fields
      if (!username || !email || !password || !staffRole) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Validate staff role
      const validRoles = Object.values(StaffRoles);
      if (!validRoles.includes(staffRole)) {
        return res.status(400).json({ message: "Invalid staff role" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create staff user
      const staff = await storage.createStaffUser({
        username,
        email,
        password: hashedPassword,
        staffRole,
        firstName,
        lastName,
      });
      
      // Get admin info for audit log
      let adminId: string;
      let adminUsername: string;
      
      if (req.user) {
        adminId = req.user.id;
        adminUsername = req.user.username;
      } else {
        // Session admin - use system_admin
        const adminUsers = await db.select().from(usersTable)
          .where(eq(usersTable.username, 'system_admin'))
          .limit(1);
        adminId = adminUsers.length > 0 ? adminUsers[0].id : 'system';
        adminUsername = adminUsers.length > 0 ? adminUsers[0].username : 'admin';
      }
      
      // Log the staff creation
      await storage.createStaffAuditLog({
        staffId: adminId,
        staffUsername: adminUsername,
        staffRole: 'super_admin',
        action: 'create',
        entityType: 'staff',
        entityId: staff.id,
        entityTitle: staff.username,
        description: `Created staff user: ${staff.username} with role: ${staff.staffRole}`,
        metadata: JSON.stringify({ staffRole: staff.staffRole }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.json({ ...staff, password: undefined });
    } catch (error: any) {
      console.error("Error creating staff:", error);
      res.status(500).json({ message: "Failed to create staff user", error: error.message });
    }
  });
  
  // Get all staff users
  app.get('/api/staff', isAdminAuthenticated, async (req: any, res) => {
    try {
      const staff = await storage.getAllStaff();
      const sanitized = staff.map(s => ({ ...s, password: undefined }));
      res.json(sanitized);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });
  
  // Update staff role
  app.put('/api/staff/:id/role', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { staffRole } = req.body;
      
      // Validate staff role
      const validRoles = Object.values(StaffRoles);
      if (!validRoles.includes(staffRole)) {
        return res.status(400).json({ message: "Invalid staff role" });
      }
      
      const updated = await storage.updateStaffRole(id, staffRole);
      
      // Get admin info for audit log
      let adminId: string;
      let adminUsername: string;
      
      if (req.user) {
        adminId = req.user.id;
        adminUsername = req.user.username;
      } else {
        const adminUsers = await db.select().from(usersTable)
          .where(eq(usersTable.username, 'system_admin'))
          .limit(1);
        adminId = adminUsers.length > 0 ? adminUsers[0].id : 'system';
        adminUsername = adminUsers.length > 0 ? adminUsers[0].username : 'admin';
      }
      
      // Log the role update
      await storage.createStaffAuditLog({
        staffId: adminId,
        staffUsername: adminUsername,
        staffRole: 'super_admin',
        action: 'update',
        entityType: 'staff',
        entityId: id,
        entityTitle: updated.username,
        description: `Updated staff role for ${updated.username} to: ${staffRole}`,
        metadata: JSON.stringify({ newRole: staffRole }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.json({ ...updated, password: undefined });
    } catch (error) {
      console.error("Error updating staff role:", error);
      res.status(500).json({ message: "Failed to update staff role" });
    }
  });
  
  // Delete staff user
  app.delete('/api/staff/:id', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const staff = await storage.getStaffById(id);
      
      if (!staff) {
        return res.status(404).json({ message: "Staff user not found" });
      }
      
      await storage.deleteStaffUser(id);
      
      // Get admin info for audit log
      let adminId: string;
      let adminUsername: string;
      
      if (req.user) {
        adminId = req.user.id;
        adminUsername = req.user.username;
      } else {
        const adminUsers = await db.select().from(usersTable)
          .where(eq(usersTable.username, 'system_admin'))
          .limit(1);
        adminId = adminUsers.length > 0 ? adminUsers[0].id : 'system';
        adminUsername = adminUsers.length > 0 ? adminUsers[0].username : 'admin';
      }
      
      // Log the deletion
      await storage.createStaffAuditLog({
        staffId: adminId,
        staffUsername: adminUsername,
        staffRole: 'super_admin',
        action: 'delete',
        entityType: 'staff',
        entityId: id,
        entityTitle: staff.username,
        description: `Deleted staff user: ${staff.username}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.json({ message: "Staff user deleted successfully" });
    } catch (error) {
      console.error("Error deleting staff:", error);
      res.status(500).json({ message: "Failed to delete staff user" });
    }
  });
  
  // Get staff audit logs
  app.get('/api/staff/audit-logs', isAdminAuthenticated, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const logs = await storage.getStaffAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
  
  // Get audit logs for a specific staff member
  app.get('/api/staff/:id/audit-logs', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const logs = await storage.getStaffUserAuditLogs(id, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching staff audit logs:", error);
      res.status(500).json({ message: "Failed to fetch staff audit logs" });
    }
  });

  // Admin route to get all verified vendors
  app.get('/api/admin/vendors', isAdminAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      const vendors = users.filter(user => user.role === 'vendor' && user.vendorStatus === 'verified');
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
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
      const { listings, coupons: couponsTable, users: usersTable } = await import("@shared/schema");
      
      // Get the listing to find the user ID for cache invalidation
      const [listing] = await db.select().from(listings).where(eq(listings.id, listingId));
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Get admin user ID (handle session-based auth where req.user might be undefined)
      let adminId = req.user?.id;
      if (!adminId) {
        const adminUsers = await db.select().from(usersTable).where(eq(usersTable.role, 'admin')).limit(1);
        if (adminUsers.length > 0) {
          adminId = adminUsers[0].id;
        } else {
          return res.status(401).json({ message: "Admin user not found" });
        }
      }
      
      // Approve the listing
      const [updatedListing] = await db
        .update(listings)
        .set({ 
          status: 'published',
          updatedAt: new Date()
        })
        .where(eq(listings.id, listingId))
        .returning();
      
      // Auto-approve any pending coupons linked to this product
      const linkedCoupons = await db
        .select()
        .from(couponsTable)
        .where(
          sql`${couponsTable.productId} = ${listingId} AND ${couponsTable.status} = 'pending'`
        );
      
      // Approve each linked coupon
      for (const coupon of linkedCoupons) {
        await storage.approveCoupon(coupon.id, adminId);
      }
      
      // Broadcast cache invalidation to the vendor/user
      broadcastEvent({
        type: 'listing-approved',
        data: {
          listingId,
          userId: listing.userId,
          status: 'published'
        }
      });
      
      res.json({ 
        message: "Listing approved and published successfully",
        couponsApproved: linkedCoupons.length,
        listing: updatedListing
      });
    } catch (error) {
      console.error("Error approving listing:", error);
      res.status(500).json({ message: "Failed to approve listing" });
    }
  });

  app.patch('/api/admin/listings/:id/reject', isAdminAuthenticated, async (req: any, res) => {
    try {
      const listingId = req.params.id;
      const { listings } = await import("@shared/schema");
      
      // Get the listing to find the user ID for notification
      const [listing] = await db.select().from(listings).where(eq(listings.id, listingId));
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Reject the listing
      const [updatedListing] = await db
        .update(listings)
        .set({ 
          status: 'rejected',
          updatedAt: new Date()
        })
        .where(eq(listings.id, listingId))
        .returning();
      
      // Broadcast notification to the vendor
      broadcastEvent({
        type: 'listing-rejected',
        data: {
          listingId,
          userId: listing.userId,
          status: 'rejected',
          title: listing.title
        }
      });
      
      res.json({ message: "Listing rejected successfully", listing: updatedListing });
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

      // Broadcast real-time event to admin
      broadcastEvent({
        type: 'VENDOR_REQUEST_SUBMITTED',
        data: {
          requestId: vendorRequest.id,
          userId: req.user.id,
          userName: req.user.username,
          businessName: vendorRequest.businessName,
          businessType: vendorRequest.businessType,
        }
      });

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

      // Broadcast real-time event to admin
      broadcastEvent({
        type: 'VENDOR_REQUEST_SUBMITTED',
        data: {
          requestId: vendorRequest.id,
          userId: req.user.id,
          userName: req.user.username,
          businessName: vendorRequest.businessName,
          businessType: vendorRequest.businessType,
        }
      });

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

      // Broadcast real-time event to user
      broadcastEvent({
        type: 'VENDOR_REQUEST_APPROVED',
        data: {
          requestId: id,
          userId: request.userId,
          businessName: request.businessName,
        }
      });

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

      // Broadcast real-time event to user
      broadcastEvent({
        type: 'VENDOR_REQUEST_REJECTED',
        data: {
          requestId: id,
          userId: request.userId,
          businessName: request.businessName,
          rejectionReason: reason,
        }
      });

      res.json({ message: "Vendor request rejected successfully", request });
    } catch (error) {
      console.error("Error rejecting vendor request:", error);
      res.status(500).json({ message: "Failed to reject vendor request" });
    }
  });

  // Admin route to get vendor request documents
  app.get('/api/admin/vendor-requests/:id/document/:type', isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id, type } = req.params;
      console.log(`Fetching document ${type} for vendor request ${id}`);
      
      // Get the vendor request from database
      const { vendorRequests } = await import("@shared/schema");
      const requests = await db.select().from(vendorRequests).where(eq(vendorRequests.id, id)).limit(1);
      const request = requests[0];
      
      if (!request) {
        return res.status(404).json({ message: "Vendor request not found" });
      }

      // Get the document URL based on type
      let documentUrl: string | null = null;
      switch (type) {
        case 'id':
          documentUrl = request.identificationDoc;
          break;
        case 'business':
          documentUrl = request.businessRegistrationDoc;
          break;
        case 'address':
          documentUrl = request.addressProofDoc;
          break;
        default:
          return res.status(400).json({ message: "Invalid document type" });
      }

      if (!documentUrl) {
        return res.status(404).json({ message: "Document not found" });
      }

      console.log(`Document URL: ${documentUrl}`);

      // Extract bucket and object path from URL
      // URL format: https://storage.googleapis.com/bucket-name/.private/uploads/filename
      const urlParts = new URL(documentUrl);
      const pathParts = urlParts.pathname.split('/').filter(p => p);
      const bucketName = pathParts[0];
      const objectPath = pathParts.slice(1).join('/');

      console.log(`Bucket: ${bucketName}, Path: ${objectPath}`);

      // Download from Google Cloud Storage
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectPath);

      // Get file metadata
      try {
        const [metadata] = await file.getMetadata();
        const contentType = metadata.contentType || 'application/octet-stream';
        const fileName = objectPath.split('/').pop() || 'document';
        
        console.log(`File metadata - Type: ${contentType}, Name: ${fileName}`);

        // Download file content
        const [content] = await file.download();
        
        // Convert buffer to base64 for transfer
        const base64Content = content.toString('base64');
        const dataUrl = `data:${contentType};base64,${base64Content}`;

        // Return data URL with metadata
        res.json({ 
          url: dataUrl,
          contentType,
          fileName
        });
      } catch (error) {
        console.error("Error downloading file:", error);
        return res.status(404).json({ message: "Document file not found in storage" });
      }
    } catch (error) {
      console.error("Error getting document:", error);
      res.status(500).json({ message: "Failed to get document" });
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
      let userId: string | undefined;
      
      // First check if admin is authenticated via Passport
      if (req.user) {
        userId = req.user.id;
      } else if (req.session?.adminAuth === true) {
        // Session-based admin - use system admin
        const adminUsers = await db.select().from(usersTable)
          .where(eq(usersTable.username, 'system_admin'))
          .limit(1);
        userId = adminUsers.length > 0 ? adminUsers[0].id : undefined;
      }
      
      // If no user ID from auth, try to find the admin user
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

  // Object Storage routes - for listing images (accessible to all authenticated users)
  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
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

  // Update vendor TD/cash split percentage
  app.patch("/api/vendor/td-cash-split", isAuthenticated, async (req: any, res) => {
    try {
      const { tdCashSplitPercentage } = req.body;
      
      if (req.user?.role !== 'vendor') {
        return res.status(403).json({ error: "Only vendors can update payment split settings" });
      }

      if (typeof tdCashSplitPercentage !== 'number' || tdCashSplitPercentage < 0 || tdCashSplitPercentage > 100) {
        return res.status(400).json({ error: "TD/Cash split percentage must be between 0 and 100" });
      }

      await db.update(usersTable)
        .set({ tdCashSplitPercentage })
        .where(eq(usersTable.id, req.user.id));

      res.json({ message: "Payment split updated successfully", tdCashSplitPercentage });
    } catch (error) {
      console.error("Error updating TD/cash split:", error);
      res.status(500).json({ error: "Failed to update payment split" });
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

  app.put("/api/listing-images", isAuthenticated, async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: req.user?.id || "admin",
          visibility: "public",
        },
      );

      res.status(200).json({
        publicURL: objectPath,
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
        couponType,
        discountType, 
        discountValue,
        scope,
        productId,
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
        couponType: couponType || 'discount',
        issuer: 'vendor',
        scope: scope || 'platform',
        productId: productId || null,
        discountType,
        discountValue: discountValue ? parseFloat(discountValue) : null,
        cashDiscountType,
        cashDiscountValue,
        tdDiscountType,
        tdDiscountValue,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        status: 'pending',
        isActive: true,
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
  
  // Get coupon for a specific product
  app.get("/api/coupons/product/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const { coupons: couponsTable } = await import("@shared/schema");
      const coupons = await db
        .select()
        .from(couponsTable)
        .where(eq(couponsTable.productId, productId))
        .limit(1);
      
      if (coupons.length > 0) {
        res.json(coupons[0]);
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error getting product coupon:", error);
      res.status(500).json({ error: "Failed to get product coupon" });
    }
  });
  
  // Get all coupons (admin only)
  app.get("/api/admin/coupons", isAdminAuthenticated, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const issuer = req.query.issuer as string | undefined;
      const coupons = await storage.getAllCoupons({ status, issuer });
      res.json(coupons);
    } catch (error) {
      console.error("Error getting all coupons:", error);
      res.status(500).json({ error: "Failed to get coupons" });
    }
  });
  
  // Validate coupon
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, vendorId, totalAmount, productIds } = req.body;
      console.log('🎫 Coupon validation request:', { code, vendorId, totalAmount, productIds });
      const validation = await storage.validateCoupon(code, vendorId, totalAmount || 0, productIds);
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
      
      // 🔒 COUPON LOCK: Prevent vendors from editing approved coupons
      if (coupon.status === 'approved' && req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: "Approved coupons cannot be edited. Please contact support if you need to make changes." 
        });
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
  
  // Approve coupon (admin only)
  app.post("/api/admin/coupons/:id/approve", isAdminAuthenticated, async (req, res) => {
    try {
      const coupon = await storage.approveCoupon(req.params.id, req.user.id);
      res.json(coupon);
    } catch (error) {
      console.error("Error approving coupon:", error);
      res.status(500).json({ error: "Failed to approve coupon" });
    }
  });

  // Reject coupon (admin only)
  app.post("/api/admin/coupons/:id/reject", isAdminAuthenticated, async (req, res) => {
    try {
      const { reason } = req.body;
      const coupon = await storage.rejectCoupon(req.params.id, req.user.id, reason);
      res.json(coupon);
    } catch (error) {
      console.error("Error rejecting coupon:", error);
      res.status(500).json({ error: "Failed to reject coupon" });
    }
  });

  // Create platform coupon (admin only)
  app.post("/api/admin/coupons", isAdminAuthenticated, async (req: any, res) => {
    try {
      // Get admin ID - handle both Passport and session-based auth
      let adminId: string | undefined;
      let adminUsername: string = 'Admin';
      
      if (req.user) {
        adminId = req.user.id;
        adminUsername = req.user.username;
      } else if (req.session?.adminAuth === true) {
        // Session-based admin - use system admin
        const adminUsers = await db.select().from(usersTable)
          .where(eq(usersTable.username, 'system_admin'))
          .limit(1);
        if (adminUsers.length > 0) {
          adminId = adminUsers[0].id;
          adminUsername = adminUsers[0].username;
        }
      }
      
      if (!adminId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { 
        code, 
        title, 
        description, 
        couponType,
        discountType, 
        discountValue,
        scope,
        productId,
        cashValue,
        usageLimit, 
        validFrom, 
        validUntil 
      } = req.body;
      
      const coupon = await storage.createCoupon({
        vendorId: adminId,
        code,
        title,
        description,
        couponType: couponType || 'discount',
        issuer: 'admin',
        scope: scope || 'platform',
        productId: productId || null,
        discountType: couponType === 'discount' ? discountType : null,
        discountValue: couponType === 'discount' ? discountValue : null,
        cashValue: couponType === 'cash' ? cashValue : null,
        usageLimit,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        status: 'approved', // Admin-created coupons are auto-approved
      });
      
      // Log activity
      await storage.createActivityLog({
        userId: adminId,
        userName: adminUsername,
        actionType: 'create',
        entityType: 'coupon',
        entityId: coupon.id,
        entityTitle: coupon.title || coupon.code,
        description: `Created platform coupon: ${coupon.code}`,
        metadata: { coupon },
      });
      
      res.status(201).json(coupon);
    } catch (error) {
      console.error("Error creating admin coupon:", error);
      res.status(500).json({ error: "Failed to create coupon" });
    }
  });

  // Update platform coupon (admin only)
  app.put("/api/admin/coupons/:id", isAdminAuthenticated, async (req: any, res) => {
    try {
      // Get admin ID
      let adminId: string | undefined;
      let adminUsername: string = 'Admin';
      
      if (req.user) {
        adminId = req.user.id;
        adminUsername = req.user.username;
      } else if (req.session?.adminAuth === true) {
        const adminUsers = await db.select().from(usersTable)
          .where(eq(usersTable.username, 'system_admin'))
          .limit(1);
        if (adminUsers.length > 0) {
          adminId = adminUsers[0].id;
          adminUsername = adminUsers[0].username;
        }
      }
      
      if (!adminId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const coupon = await storage.updateCoupon(req.params.id, req.body);
      
      // Log activity
      await storage.createActivityLog({
        userId: adminId,
        userName: adminUsername,
        actionType: 'update',
        entityType: 'coupon',
        entityId: coupon.id,
        entityTitle: coupon.title || coupon.code,
        description: `Updated platform coupon: ${coupon.code}`,
        metadata: { coupon },
      });
      
      res.json(coupon);
    } catch (error) {
      console.error("Error updating admin coupon:", error);
      res.status(500).json({ error: "Failed to update coupon" });
    }
  });

  // Delete platform coupon (admin only)
  app.delete("/api/admin/coupons/:id", isAdminAuthenticated, async (req: any, res) => {
    try {
      // Get admin ID
      let adminId: string | undefined;
      let adminUsername: string = 'Admin';
      
      if (req.user) {
        adminId = req.user.id;
        adminUsername = req.user.username;
      } else if (req.session?.adminAuth === true) {
        const adminUsers = await db.select().from(usersTable)
          .where(eq(usersTable.username, 'system_admin'))
          .limit(1);
        if (adminUsers.length > 0) {
          adminId = adminUsers[0].id;
          adminUsername = adminUsers[0].username;
        }
      }
      
      if (!adminId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const couponId = req.params.id;
      await storage.deleteCoupon(couponId);
      
      // Log activity
      await storage.createActivityLog({
        userId: adminId,
        userName: adminUsername,
        actionType: 'delete',
        entityType: 'coupon',
        entityId: couponId,
        description: `Deleted platform coupon`,
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting admin coupon:", error);
      res.status(500).json({ error: "Failed to delete coupon" });
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
  app.get("/api/td/transactions", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getTdTransactionsByUser(req.user.id);
      res.json(transactions);
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
  
  // Convert TD to Cash Coupon (1 TD = HK$60)
  app.post("/api/td/convert-to-coupon", isAuthenticated, async (req, res) => {
    try {
      const { tdAmount } = req.body;
      const TD_TO_HKD_RATE = 60; // 1 TD = HK$60
      
      if (!tdAmount || tdAmount <= 0) {
        return res.status(400).json({ error: "Invalid TD amount" });
      }
      
      // Check if user has enough TD balance
      const currentBalance = await storage.getTimeDollarBalance(req.user.id);
      if (currentBalance < tdAmount) {
        return res.status(400).json({ error: "Insufficient TimeDollar balance" });
      }
      
      // Calculate cash value
      const cashValue = tdAmount * TD_TO_HKD_RATE;
      
      // Generate unique coupon code
      const couponCode = `TD${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Create cash coupon
      const coupon = await storage.createCoupon({
        couponType: 'cash',
        issuer: 'admin', // TD conversions are admin-issued
        vendorId: null,
        scope: 'platform',
        productId: null,
        code: couponCode,
        title: `TimeDollar Conversion - ${tdAmount} TD`,
        description: `Converted from ${tdAmount} TimeDollars (HK$${cashValue})`,
        discountType: null,
        discountValue: null,
        cashValue: cashValue.toString(),
        usageLimit: 1,
        usedCount: 0,
        validFrom: new Date(),
        validUntil: null,
        status: 'approved', // Auto-approved for TD conversions
        approvedBy: req.user.id,
        rejectionReason: null,
      });
      
      // Create TD conversion record
      await storage.createTdConversion({
        userId: req.user.id,
        tdSpent: tdAmount,
        couponCode: couponCode,
        couponId: coupon.id,
      });
      
      // Deduct TD from user's wallet via transaction
      await storage.createTdTransaction({
        userId: req.user.id,
        type: 'spend',
        amount: tdAmount,
        note: `Converted ${tdAmount} TD to HK$${cashValue} cash coupon (${couponCode})`,
      });
      
      res.json({
        success: true,
        coupon: {
          code: couponCode,
          cashValue: cashValue,
          tdSpent: tdAmount,
          expiresAt: null,
        },
      });
    } catch (error) {
      console.error("Error converting TD to coupon:", error);
      res.status(500).json({ error: "Failed to convert TimeDollars to coupon" });
    }
  });

  // ========================================
  // DISPUTE ROUTES
  // ========================================
  
  // Create a dispute
  app.post("/api/disputes", isAuthenticated, async (req, res) => {
    try {
      const { orderId, reason } = req.body;
      
      if (!orderId || !reason) {
        return res.status(400).json({ error: "Order ID and reason are required" });
      }
      
      // Get order details
      const order = await storage.getOrderDetails(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Verify user is either buyer or seller
      if (order.userId !== req.user.id && order.vendorId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized to create dispute for this order" });
      }
      
      // Verify order involves TimeDollar payment
      if (order.paymentMethod !== 'timedollar' && order.paymentMethod !== 'both') {
        return res.status(400).json({ error: "Disputes can only be created for orders paid with TimeDollars" });
      }
      
      // Verify order is delivered (TD has been paid to seller)
      if (order.status !== 'delivered') {
        return res.status(400).json({ error: "Disputes can only be created for delivered orders" });
      }
      
      // Check if dispute already exists for this order
      const existingDisputes = await storage.getTdDisputes({ orderId });
      if (existingDisputes && existingDisputes.length > 0) {
        return res.status(400).json({ error: "A dispute already exists for this order" });
      }
      
      // Calculate deadline (20 working days from now)
      const deadline = new Date();
      let workingDaysAdded = 0;
      while (workingDaysAdded < 20) {
        deadline.setDate(deadline.getDate() + 1);
        const dayOfWeek = deadline.getDay();
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDaysAdded++;
        }
      }
      
      // Auto-assign mediator (find a staff member with mediator role)
      let mediatorId = null;
      const staffUsers = await storage.getStaffUsers();
      const mediators = staffUsers.filter((staff: any) => 
        staff.role === 'Mediator' || 
        staff.role === 'Full Admin' || 
        staff.role === 'Super Admin'
      );
      
      if (mediators.length > 0) {
        // Randomly assign one of the available mediators
        mediatorId = mediators[Math.floor(Math.random() * mediators.length)].id;
      }
      
      // Create dispute
      const dispute = await storage.createTdDispute({
        orderId,
        buyerId: order.userId,
        sellerId: order.vendorId,
        reason,
        deadline,
        mediatorId,
      });
      
      res.json(dispute);
    } catch (error) {
      console.error("Error creating dispute:", error);
      res.status(500).json({ error: "Failed to create dispute" });
    }
  });
  
  // Get user's disputes (as buyer or seller)
  app.get("/api/disputes/user", isAuthenticated, async (req, res) => {
    try {
      const disputes = await storage.getUserDisputes(req.user.id);
      res.json(disputes);
    } catch (error) {
      console.error("Error getting user disputes:", error);
      res.status(500).json({ error: "Failed to get disputes" });
    }
  });
  
  // Get specific dispute
  app.get("/api/disputes/:id", isAuthenticated, async (req, res) => {
    try {
      const dispute = await storage.getTdDispute(req.params.id);
      
      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found" });
      }
      
      // Verify user has access to this dispute
      if (
        dispute.buyerId !== req.user.id && 
        dispute.sellerId !== req.user.id && 
        dispute.mediatorId !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      res.json(dispute);
    } catch (error) {
      console.error("Error getting dispute:", error);
      res.status(500).json({ error: "Failed to get dispute" });
    }
  });
  
  // Update dispute status (mediator/admin only)
  app.patch("/api/disputes/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { status, resolution } = req.body;
      
      const dispute = await storage.getTdDispute(req.params.id);
      if (!dispute) {
        return res.status(404).json({ error: "Dispute not found" });
      }
      
      // Only mediator or admin can resolve
      if (dispute.mediatorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Only assigned mediator or admin can resolve disputes" });
      }
      
      const updated = await storage.updateTdDisputeStatus(req.params.id, status, resolution);
      res.json(updated);
    } catch (error) {
      console.error("Error updating dispute status:", error);
      res.status(500).json({ error: "Failed to update dispute status" });
    }
  });
  
  // Get all disputes (admin only)
  app.get("/api/admin/disputes", isAdminAuthenticated, async (req, res) => {
    try {
      const disputes = await storage.getAllTdDisputes();
      res.json(disputes);
    } catch (error) {
      console.error("Error getting all disputes:", error);
      res.status(500).json({ error: "Failed to get disputes" });
    }
  });

  // ========================================
  // ADMIN TIMEDOLLAR MANAGEMENT ROUTES
  // ========================================

  // Get all TD wallets with user info (admin only)
  app.get("/api/admin/td/wallets", isAdminAuthenticated, async (req, res) => {
    try {
      const wallets = await storage.getAllTdWallets();
      res.json(wallets);
    } catch (error) {
      console.error("Error getting TD wallets:", error);
      res.status(500).json({ error: "Failed to get TD wallets" });
    }
  });

  // Get all TD transactions with user info (admin only)
  app.get("/api/admin/td/transactions", isAdminAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getAllTdTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error getting TD transactions:", error);
      res.status(500).json({ error: "Failed to get TD transactions" });
    }
  });

  // Get all TD conversions with user info (admin only)
  app.get("/api/admin/td/conversions", isAdminAuthenticated, async (req, res) => {
    try {
      const conversions = await storage.getAllTdConversions();
      res.json(conversions);
    } catch (error) {
      console.error("Error getting TD conversions:", error);
      res.status(500).json({ error: "Failed to get TD conversions" });
    }
  });

  // Adjust user TD balance (admin only)
  app.post("/api/admin/td/adjust-balance", isAdminAuthenticated, async (req, res) => {
    try {
      const { userId, amount, notes } = req.body;

      if (!userId || amount === undefined || !notes) {
        return res.status(400).json({ error: "User ID, amount, and notes are required" });
      }

      if (amount === 0) {
        return res.status(400).json({ error: "Amount must be non-zero" });
      }

      // Execute atomic admin adjustment using database transaction
      // This ensures both transaction record and wallet update happen together or not at all
      const result = await storage.adminAdjustTdBalance(userId, amount, notes);

      res.json({ success: true, newBalance: result.newBalance });
    } catch (error) {
      console.error("Error adjusting TD balance:", error);
      res.status(500).json({ error: error.message || "Failed to adjust TD balance" });
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
  // SAVED ITEMS / WISHLIST ROUTES
  // ========================================
  
  // Get user's saved items
  app.get("/api/saved-items", isAuthenticated, async (req, res) => {
    try {
      const savedItems = await storage.getUserSavedItems(req.user.id);
      res.json(savedItems);
    } catch (error) {
      console.error("Error getting saved items:", error);
      res.status(500).json({ error: "Failed to get saved items" });
    }
  });
  
  // Check if an item is saved
  app.get("/api/saved-items/check/:listingId", isAuthenticated, async (req, res) => {
    try {
      const isSaved = await storage.isItemSaved(req.user.id, req.params.listingId);
      res.json({ isSaved });
    } catch (error) {
      console.error("Error checking saved item:", error);
      res.status(500).json({ error: "Failed to check saved item" });
    }
  });
  
  // Save an item
  app.post("/api/saved-items", isAuthenticated, async (req, res) => {
    try {
      const { listingId } = req.body;
      if (!listingId) {
        return res.status(400).json({ error: "Listing ID is required" });
      }
      const savedItem = await storage.saveItem(req.user.id, listingId);
      res.json(savedItem);
    } catch (error) {
      console.error("Error saving item:", error);
      res.status(500).json({ error: "Failed to save item" });
    }
  });
  
  // Unsave an item
  app.delete("/api/saved-items/:listingId", isAuthenticated, async (req, res) => {
    try {
      await storage.unsaveItem(req.user.id, req.params.listingId);
      res.json({ message: "Item removed from saved items" });
    } catch (error) {
      console.error("Error unsaving item:", error);
      res.status(500).json({ error: "Failed to unsave item" });
    }
  });
  
  // Sync saved items from localStorage (for guests who logged in)
  app.post("/api/saved-items/sync", isAuthenticated, async (req, res) => {
    try {
      const { listingIds } = req.body;
      if (!listingIds || !Array.isArray(listingIds)) {
        return res.status(400).json({ error: "listingIds array is required" });
      }
      const syncedItems = await storage.syncSavedItems(req.user.id, listingIds);
      res.json(syncedItems);
    } catch (error) {
      console.error("Error syncing saved items:", error);
      res.status(500).json({ error: "Failed to sync saved items" });
    }
  });
  
  // ========================================
  // REVIEWS ROUTES
  // ========================================
  
  // Get reviews for a listing (public)
  app.get("/api/reviews/listing/:listingId", async (req, res) => {
    try {
      const reviews = await storage.getListingReviews(req.params.listingId);
      res.json(reviews);
    } catch (error) {
      console.error("Error getting listing reviews:", error);
      res.status(500).json({ error: "Failed to get reviews" });
    }
  });
  
  // Check if user has reviewed a listing
  app.get("/api/reviews/check/:listingId", isAuthenticated, async (req, res) => {
    try {
      const hasReviewed = await storage.hasUserReviewed(req.user.id, req.params.listingId);
      res.json({ hasReviewed });
    } catch (error) {
      console.error("Error checking review:", error);
      res.status(500).json({ error: "Failed to check review status" });
    }
  });
  
  // Submit a review (authenticated users only)
  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const { listingId, rating, comment } = req.body;
      
      if (!listingId) {
        return res.status(400).json({ error: "Listing ID is required" });
      }
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }
      
      // Get the listing to find the vendor
      const listing = await storage.getListing(listingId);
      if (!listing) {
        return res.status(404).json({ error: "Listing not found" });
      }
      
      const review = await storage.createReview({
        userId: req.user.id,
        listingId,
        vendorId: listing.userId,
        rating: parseInt(rating),
        comment: comment || null,
      });
      
      res.json(review);
    } catch (error: any) {
      console.error("Error creating review:", error);
      if (error.message === "You have already reviewed this product") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to submit review" });
    }
  });
  
  // Get vendor's reviews (for vendor dashboard)
  app.get("/api/vendor/reviews", isAuthenticated, async (req, res) => {
    try {
      const reviews = await storage.getVendorReviews(req.user.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error getting vendor reviews:", error);
      res.status(500).json({ error: "Failed to get reviews" });
    }
  });
  
  // Delete a review (vendor only - for their own products)
  app.delete("/api/vendor/reviews/:reviewId", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteReview(req.params.reviewId, req.user.id);
      res.json({ message: "Review deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting review:", error);
      if (error.message === "Review not found or you don't have permission to delete it") {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to delete review" });
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
  
  // Get vendor's orders (orders for products owned by the vendor)
  app.get("/api/vendor/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getVendorOrders(req.user.id);
      res.json(orders);
    } catch (error) {
      console.error("Error getting vendor orders:", error);
      res.status(500).json({ error: "Failed to get vendor orders" });
    }
  });
  
  // Get vendor's transactions (sales and earnings)
  app.get("/api/vendor/transactions", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getVendorTransactions(req.user.id);
      res.json(transactions);
    } catch (error) {
      console.error("Error getting vendor transactions:", error);
      res.status(500).json({ error: "Failed to get vendor transactions" });
    }
  });
  
  // Update order status (for vendors to accept/reject/update orders)
  app.patch("/api/orders/:orderId/status", isAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      // Get order details before updating
      const orderDetails = await storage.getOrderDetails(req.params.orderId);
      
      // Update order status
      const order = await storage.updateOrderStatus(req.params.orderId, status);
      
      // TD EARNING LOGIC: When order is delivered, seller earns TD
      if (status === 'delivered' && orderDetails?.tdAmount && parseFloat(orderDetails.tdAmount) > 0) {
        const tdAmount = parseFloat(orderDetails.tdAmount);
        const vendorId = orderDetails.vendorId;
        
        // Get order items to check for TD-eligible listings
        const orderItems = orderDetails.items || [];
        
        for (const item of orderItems) {
          // Get listing details to check tdValue
          const listing = await storage.getListing(item.productId);
          
          if (listing && listing.tdEligible && listing.tdValue) {
            // Calculate TD earnings: quantity * tdValue per unit
            const tdEarnings = item.quantity * listing.tdValue;
            
            // Create TD earn transaction for vendor
            await storage.createTdTransaction({
              userId: vendorId,
              type: 'earn',
              amount: tdEarnings,
              listingId: listing.id,
              orderId: order.id,
              note: `Earned ${tdEarnings} TD for delivering order #${orderDetails.transactionId}`,
            });
            
            console.log(`Vendor ${vendorId} earned ${tdEarnings} TD from delivered order ${order.id}`);
          }
        }
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // ========================================
  // STRIPE PAYMENT ROUTES
  // ========================================

  // Create payment intent for checkout
  app.post("/api/stripe/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const { orderId, amount, vendorId } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      if (!vendorId) {
        return res.status(400).json({ error: "Vendor ID is required" });
      }

      // Calculate commission (5% for platform, 95% for vendor)
      const totalAmount = parseFloat(amount);
      const platformCommission = totalAmount * 0.05;
      const vendorEarnings = totalAmount * 0.95;

      // Create Stripe payment intent (amount in cents for HKD)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: "hkd",
        metadata: {
          orderId: orderId || '',
          vendorId,
          customerId: req.user.id,
          platformCommission: platformCommission.toFixed(2),
          vendorEarnings: vendorEarnings.toFixed(2),
        },
      });

      // Create transaction record with pending status
      // Note: paymentMethod will be updated when order is created
      await storage.createTransaction({
        orderId: orderId || null,
        vendorId,
        customerId: req.user.id,
        stripePaymentIntentId: paymentIntent.id,
        stripeChargeId: null,
        paymentMethod: 'cash', // Default, will be updated in createOrder
        totalAmount: totalAmount.toFixed(2),
        cashAmount: totalAmount.toFixed(2), // Initial cash amount, may be updated for "both" payments
        tdAmount: '0',
        platformCommission: platformCommission.toFixed(2),
        vendorEarnings: vendorEarnings.toFixed(2),
        status: 'pending',
        currency: 'hkd',
        description: `Payment for order ${orderId || 'N/A'}`,
        metadata: null,
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent: " + error.message });
    }
  });

  // Stripe webhook to handle payment success
  app.post("/api/stripe-webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;

    let event;

    try {
      // For testing, we'll skip signature verification
      // In production, you should use stripe.webhooks.constructEvent with your webhook secret
      event = req.body;
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      try {
        // Update transaction status to completed
        await storage.updateTransactionByPaymentIntent(
          paymentIntent.id,
          {
            status: 'completed',
            stripeChargeId: paymentIntent.charges?.data[0]?.id || null,
          }
        );

        // If there's an order ID, update the order
        if (paymentIntent.metadata.orderId) {
          await storage.updateOrderPaymentStatus(
            paymentIntent.metadata.orderId,
            'confirmed',
            paymentIntent.id
          );
        }

        console.log('Payment succeeded:', paymentIntent.id);
      } catch (error) {
        console.error('Error updating transaction:', error);
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      
      try {
        await storage.updateTransactionByPaymentIntent(
          paymentIntent.id,
          {
            status: 'failed',
          }
        );
        console.log('Payment failed:', paymentIntent.id);
      } catch (error) {
        console.error('Error updating failed transaction:', error);
      }
    }

    res.json({ received: true });
  });

  // Get all transactions (PRODUCT/ORDER only - admin only)
  app.get("/api/admin/transactions", isAdminAuthenticated, async (req, res) => {
    // Disable caching to ensure fresh data
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    try {
      // Get all transactions (product/order only)
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error getting transactions:", error);
      res.status(500).json({ error: "Failed to get transactions" });
    }
  });

  // Get all service request fees (admin only)
  app.get("/api/admin/service-request-fees", isAdminAuthenticated, async (req, res) => {
    // Disable caching to ensure fresh data
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    try {
      // Get all service request fees with user and request details
      const fees = await db
        .select({
          id: serviceRequestFees.id,
          serviceRequestId: serviceRequestFees.serviceRequestId,
          serviceOfferId: serviceRequestFees.serviceOfferId,
          fee: serviceRequestFees.fee,
          status: serviceRequestFees.status,
          createdAt: serviceRequestFees.createdAt,
          userId: serviceRequestFees.userId,
          userName: usersTable.username,
          userEmail: usersTable.email,
          requestTitle: serviceRequests.title,
          requestDescription: serviceRequests.description,
        })
        .from(serviceRequestFees)
        .leftJoin(usersTable, eq(serviceRequestFees.userId, usersTable.id))
        .leftJoin(serviceRequests, eq(serviceRequestFees.serviceRequestId, serviceRequests.id))
        .orderBy(desc(serviceRequestFees.createdAt));

      res.json(fees);
    } catch (error) {
      console.error("Error getting service request fees:", error);
      res.status(500).json({ error: "Failed to get service request fees" });
    }
  });

  // Get transaction details (admin only)
  app.get("/api/admin/transactions/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const transaction = await storage.getTransactionById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Error getting transaction:", error);
      res.status(500).json({ error: "Failed to get transaction" });
    }
  });

  // Get vendor's transactions
  app.get("/api/vendor/transactions", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getVendorTransactions(req.user.id);
      res.json(transactions);
    } catch (error) {
      console.error("Error getting vendor transactions:", error);
      res.status(500).json({ error: "Failed to get transactions" });
    }
  });

  // ========================================
  // MESSAGING ROUTES
  // ========================================

  // Create or get existing conversation
  app.post("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const { vendorId, productId, productTitle } = req.body;
      const customerId = req.user.id;

      // Check if conversation already exists
      let conversation = await storage.findConversation(customerId, vendorId, productId);

      if (!conversation) {
        // Create new conversation
        conversation = await storage.createConversation({
          customerId,
          vendorId,
          productId,
          productTitle,
        });
      }

      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Get user's conversations (customer or vendor)
  app.get("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      let conversations;

      // Check if user wants specific role conversations or both
      const roleFilter = req.query.role as string | undefined;

      if (roleFilter === 'vendor') {
        // Get only vendor conversations
        conversations = await storage.getVendorConversations(user.id);
      } else if (roleFilter === 'customer') {
        // Get only customer conversations
        conversations = await storage.getUserConversations(user.id);
      } else {
        // Get all conversations where user is either customer or vendor
        // This is important for vendors who also act as customers
        const customerConvos = await storage.getUserConversations(user.id);
        const vendorConvos = await storage.getVendorConversations(user.id);
        
        // Combine and sort by last message timestamp
        conversations = [...customerConvos, ...vendorConvos].sort((a, b) => {
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return dateB - dateA;
        });
      }

      res.json(conversations);
    } catch (error) {
      console.error("Error getting conversations:", error);
      res.status(500).json({ error: "Failed to get conversations" });
    }
  });

  // Get conversation details
  app.get("/api/conversations/:id", isAuthenticated, async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Verify user is part of this conversation
      if (conversation.customerId !== req.user.id && conversation.vendorId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      res.json(conversation);
    } catch (error) {
      console.error("Error getting conversation:", error);
      res.status(500).json({ error: "Failed to get conversation" });
    }
  });

  // Get messages in a conversation
  app.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Verify user is part of this conversation
      if (conversation.customerId !== req.user.id && conversation.vendorId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const messages = await storage.getConversationMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error getting messages:", error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  // Send a message
  app.post("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const { message } = req.body;
      const conversationId = req.params.id;
      
      if (!message || message.trim().length === 0) {
        return res.status(400).json({ error: "Message is required" });
      }

      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Verify user is part of this conversation
      if (conversation.customerId !== req.user.id && conversation.vendorId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Determine sender role
      const senderRole = conversation.vendorId === req.user.id ? 'vendor' : 'customer';

      const newMessage = await storage.sendMessage({
        conversationId,
        senderId: req.user.id,
        senderRole,
        message: message.trim(),
      });

      // Broadcast new message via WebSocket
      broadcastEvent({
        type: 'new_message',
        data: {
          conversationId,
          message: newMessage,
          recipientId: senderRole === 'vendor' ? conversation.customerId : conversation.vendorId,
        },
      });

      res.json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Mark messages as read
  app.put("/api/conversations/:id/read", isAuthenticated, async (req, res) => {
    try {
      const conversationId = req.params.id;
      const conversation = await storage.getConversation(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Verify user is part of this conversation
      if (conversation.customerId !== req.user.id && conversation.vendorId !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Determine user role
      const userRole = conversation.vendorId === req.user.id ? 'vendor' : 'customer';

      await storage.markMessagesAsRead(conversationId, req.user.id, userRole);

      // Broadcast read status via WebSocket
      broadcastEvent({
        type: 'messages_read',
        data: {
          conversationId,
          userId: req.user.id,
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  // Get unread message count
  app.get("/api/messages/unread-count", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      // Determine user role (vendor or customer)
      const userRole = user.role === 'vendor' || user.vendorStatus === 'verified' ? 'vendor' : 'customer';
      
      const unreadCount = await storage.getUnreadCount(user.id, userRole);
      res.json({ count: unreadCount });
    } catch (error) {
      console.error("Error getting unread count:", error);
      res.status(500).json({ error: "Failed to get unread count" });
    }
  });

  // Get service request unread counts (for users/vendors)
  app.get("/api/service-requests/unread-counts", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const isAdmin = user.role === 'admin' || user.role === 'staff';
      
      const unreadData = await storage.getServiceRequestUnreadCounts(user.id, isAdmin);
      res.json(unreadData);
    } catch (error) {
      console.error("Error getting service request unread counts:", error);
      res.status(500).json({ error: "Failed to get unread counts" });
    }
  });

  // Get admin service request unread counts
  app.get("/api/admin/service-requests/unread-counts", isAdminAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user?.id || req.session?.adminUserId;
      const unreadData = await storage.getServiceRequestUnreadCounts(adminId, true);
      res.json(unreadData);
    } catch (error) {
      console.error("Error getting admin service request unread counts:", error);
      res.status(500).json({ error: "Failed to get unread counts" });
    }
  });

  // Combined unread counts for header notification badge (all chats)
  app.get("/api/notifications/unread-counts", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const isAdmin = user.role === 'admin' || user.role === 'staff';
      const userRole = user.vendorStatus === 'verified' ? 'vendor' : 'customer';
      
      // Get B2C conversation unread count
      const conversationUnread = await storage.getUnreadCount(user.id, userRole);
      
      // Get service request unread count
      const serviceRequestData = await storage.getServiceRequestUnreadCounts(user.id, isAdmin);
      
      res.json({
        totalUnread: conversationUnread + serviceRequestData.totalUnread,
        conversationUnread,
        serviceRequestUnread: serviceRequestData.totalUnread,
        serviceRequests: serviceRequestData.requests,
      });
    } catch (error) {
      console.error("Error getting notification unread counts:", error);
      res.status(500).json({ error: "Failed to get unread counts" });
    }
  });

  // ==================== Support Ticket Attachment Upload ====================

  // Configure multer for support ticket attachments
  const uploadDir = path.join(process.cwd(), 'public', 'support-attachments');
  
  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const supportAttachmentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'attachment-' + uniqueSuffix + ext);
    }
  });

  const upload = multer({
    storage: supportAttachmentStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images, PDF, and Word documents are allowed.'));
      }
    }
  });

  // Upload support attachment endpoint
  app.post("/api/upload-support-attachment", isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Return the public URL for the uploaded file
      const fileUrl = `/support-attachments/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      console.error("Error uploading support attachment:", error);
      res.status(500).json({ error: "Failed to upload attachment" });
    }
  });

  // ==================== Support Ticket Routes ====================

  // Get assignable staff (staff members only) for ticket assignment
  app.get("/api/admin/assignable-staff", isAdminAuthenticated, async (req, res) => {
    try {
      // Get only staff members for ticket assignment
      const staffUsers = await storage.getAssignableStaff();
      res.json(staffUsers);
    } catch (error) {
      console.error("Error getting assignable staff:", error);
      res.status(500).json({ error: "Failed to get assignable staff" });
    }
  });

  // Create a new support ticket
  app.post("/api/support-tickets", isAuthenticated, async (req, res) => {
    try {
      const { subject, message, issueType, attachmentUrl, priority } = req.body;
      
      if (!subject || !message) {
        return res.status(400).json({ error: "Subject and message are required" });
      }

      const ticket = await storage.createSupportTicket({
        userId: req.user.id,
        subject,
        message,
        issueType: issueType || "general",
        attachmentUrl: attachmentUrl || undefined,
        priority,
      });

      // TODO: Send email notification to admin
      console.log(`New support ticket created: ${ticket.id} by user ${req.user.username}`);

      res.json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ error: "Failed to create support ticket" });
    }
  });

  // Get all support tickets (admin only)
  app.get("/api/support-tickets", isAdminAuthenticated, async (req, res) => {
    try {
      const tickets = await storage.getAllSupportTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error getting support tickets:", error);
      res.status(500).json({ error: "Failed to get support tickets" });
    }
  });

  // Get user's own support tickets
  app.get("/api/support-tickets/my-tickets", isAuthenticated, async (req, res) => {
    try {
      const tickets = await storage.getUserSupportTickets(req.user.id);
      res.json(tickets);
    } catch (error) {
      console.error("Error getting user support tickets:", error);
      res.status(500).json({ error: "Failed to get your support tickets" });
    }
  });

  // Get a specific support ticket
  app.get("/api/support-tickets/:ticketId", isAuthenticated, async (req, res) => {
    try {
      const ticket = await storage.getSupportTicket(req.params.ticketId);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      // Check if user is admin or the ticket owner
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super-admin';
      const isOwner = ticket.userId === req.user.id;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: "Unauthorized to view this ticket" });
      }

      res.json(ticket);
    } catch (error) {
      console.error("Error getting support ticket:", error);
      res.status(500).json({ error: "Failed to get support ticket" });
    }
  });

  // Update ticket status (admin only)
  app.put("/api/support-tickets/:ticketId/status", isAdminAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!status || !['open', 'pending', 'closed'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const ticket = await storage.updateTicketStatus(req.params.ticketId, status);
      res.json(ticket);
    } catch (error) {
      console.error("Error updating ticket status:", error);
      res.status(500).json({ error: "Failed to update ticket status" });
    }
  });

  // Assign ticket to staff (admin only)
  app.put("/api/support-tickets/:ticketId/assign", isAdminAuthenticated, async (req, res) => {
    try {
      const { assignedTo } = req.body;
      
      if (!assignedTo) {
        return res.status(400).json({ error: "assignedTo is required" });
      }

      const ticket = await storage.assignTicket(req.params.ticketId, assignedTo);
      res.json(ticket);
    } catch (error) {
      console.error("Error assigning ticket:", error);
      res.status(500).json({ error: "Failed to assign ticket" });
    }
  });

  // Update ticket priority (admin only)
  app.put("/api/support-tickets/:ticketId/priority", isAdminAuthenticated, async (req, res) => {
    try {
      const { priority } = req.body;
      
      if (!priority || !['low', 'normal', 'high', 'urgent'].includes(priority)) {
        return res.status(400).json({ error: "Invalid priority" });
      }

      const ticket = await storage.updateTicketPriority(req.params.ticketId, priority);
      res.json(ticket);
    } catch (error) {
      console.error("Error updating ticket priority:", error);
      res.status(500).json({ error: "Failed to update ticket priority" });
    }
  });

  // Get staff's assigned tickets (staff members only)
  app.get("/api/support-tickets/vendor/assigned", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      
      // Check if user is a staff member
      if (user.role !== 'staff') {
        return res.status(403).json({ error: "Only staff members can access this" });
      }

      const tickets = await storage.getVendorAssignedTickets(user.id);
      res.json(tickets);
    } catch (error) {
      console.error("Error getting staff assigned tickets:", error);
      res.status(500).json({ error: "Failed to get assigned tickets" });
    }
  });

  // ==================== Support Ticket Message Routes ====================

  // Create a new ticket message
  app.post("/api/support-tickets/:ticketId/messages", isAuthenticatedOrAdmin, async (req: any, res) => {
    try {
      const { ticketId } = req.params;
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get the ticket to verify permissions
      const ticket = await storage.getSupportTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      // Get user ID and role
      let userId: string;
      let userRole: string;
      const isAdminSession = req.session?.adminAuth === true;
      const isAdminUser = req.user?.role === 'admin' || req.user?.role === 'super-admin';
      const isAdmin = isAdminSession || isAdminUser;
      
      if (req.user) {
        // Regular user (vendor/customer) or admin via Passport
        userId = req.user.id;
        userRole = req.user.role || 'consumer';
      } else if (isAdminSession) {
        // Admin user via session - look for existing admin/super-admin user
        const adminUsers = await db.select().from(usersTable)
          .where(or(
            eq(usersTable.role, 'admin'),
            eq(usersTable.role, 'super-admin')
          ))
          .limit(1);
        
        if (adminUsers.length === 0) {
          return res.status(500).json({ error: "No admin user found in the system. Please create an admin account first." });
        }
        
        userId = adminUsers[0].id;
        userRole = 'admin';
      } else {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Check permissions and calculate receiverId
      const isTicketOwner = ticket.userId === userId;
      const isAssignedStaff = ticket.assignedTo === userId;
      const isStaffUser = req.user?.role === 'staff';

      // Admin has full access to reply to any ticket
      // Staff can reply if assigned to the ticket
      // Users can reply to their own tickets
      if (!isAdmin && !isTicketOwner && !isAssignedStaff) {
        return res.status(403).json({ error: "Unauthorized to message in this ticket" });
      }

      // Calculate receiver: 
      // - If sender is admin → receiver is ticket owner (user)
      // - If sender is assigned staff → receiver is ticket owner (user)
      // - If sender is user → receiver is assigned staff, or first admin if unassigned
      let receiverId: string;
      if (isAdmin) {
        // Admin always sends to ticket owner
        receiverId = ticket.userId;
      } else if (isAssignedStaff) {
        // Assigned staff sends to ticket owner
        receiverId = ticket.userId;
      } else if (isTicketOwner) {
        // User sends to assigned staff if available
        if (ticket.assignedTo) {
          receiverId = ticket.assignedTo;
        } else {
          // For unassigned tickets, route to first available admin/super-admin
          const adminUsers = await db.select().from(usersTable)
            .where(or(
              eq(usersTable.role, 'admin'),
              eq(usersTable.role, 'super-admin')
            ))
            .limit(1);
          
          if (adminUsers.length === 0) {
            return res.status(500).json({ error: "No admin available to receive message. Please try again later." });
          }
          receiverId = adminUsers[0].id;
        }
      } else {
        return res.status(403).json({ error: "Unauthorized to message in this ticket" });
      }

      const ticketMessage = await storage.createTicketMessage({
        ticketId,
        senderId: userId,
        receiverId, // Direct receiver (user or staff, never admin)
        message,
      });

      // Update ticket's updatedAt timestamp
      await storage.updateTicketStatus(ticketId, ticket.status);

      res.json(ticketMessage);
    } catch (error) {
      console.error("Error creating ticket message:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Get all messages for a ticket
  app.get("/api/support-tickets/:ticketId/messages", isAuthenticatedOrAdmin, async (req: any, res) => {
    try {
      const { ticketId } = req.params;

      // Get the ticket to verify permissions
      const ticket = await storage.getSupportTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }

      // Get user ID and role
      let userId: string;
      const isAdminSession = req.session?.adminAuth === true;
      const isAdminUser = req.user?.role === 'admin' || req.user?.role === 'super-admin';
      const isAdmin = isAdminSession || isAdminUser;
      
      if (req.user) {
        // Regular user (vendor/customer) or admin via Passport
        userId = req.user.id;
      } else if (isAdminSession) {
        // Admin user via session - use system admin
        const adminUsers = await db.select().from(usersTable)
          .where(eq(usersTable.username, 'system_admin'))
          .limit(1);
        
        if (adminUsers.length === 0) {
          return res.status(500).json({ error: "System admin not found. Please contact support." });
        }
        userId = adminUsers[0].id;
      } else {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Check if user has permission to view this ticket's messages
      // Admins (both session-based and user-based) can always view
      if (!isAdmin) {
        const isTicketOwner = ticket.userId === userId;
        const isAssignedVendor = ticket.assignedTo === userId;

        if (!isTicketOwner && !isAssignedVendor) {
          return res.status(403).json({ error: "Unauthorized to view this ticket" });
        }
      }

      const messages = await storage.getTicketMessages(ticketId);
      res.json(messages);
    } catch (error) {
      console.error("Error getting ticket messages:", error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  // Service Requests API routes
  app.post("/api/service-requests", isAuthenticated, async (req: any, res) => {
    try {
      const { title, description, estimatedHours, preferredDate } = req.body;
      const userId = req.user?.id;

      if (!userId || !title || !description) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const requesterType = req.user?.role === 'vendor' ? 'vendor' : 'user';

      const serviceRequest = await storage.createServiceRequest({
        requesterId: userId,
        requesterType,
        title,
        description,
        estimatedHours,
        preferredDate,
      });

      res.status(201).json(serviceRequest);
    } catch (error) {
      console.error("Error creating service request:", error);
      res.status(500).json({ error: "Failed to create service request" });
    }
  });

  app.get("/api/service-requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const requests = await storage.getRequesterServiceRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ error: "Failed to fetch service requests" });
    }
  });

  // Separate user and vendor service request endpoints
  app.post("/api/user-service-requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { title, description, estimatedHours, preferredDate } = req.body;
      if (!title || !description) return res.status(400).json({ error: "Missing required fields" });
      const request = await storage.createServiceRequest({
        requesterId: userId,
        requesterType: 'user',
        title, description, estimatedHours, preferredDate,
      });
      res.status(201).json(request);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Failed to create request" });
    }
  });

  app.get("/api/user-service-requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Get only this user's service requests
      const dbRequests = await db
        .select()
        .from(serviceRequests)
        .where(eq(serviceRequests.requesterId, userId));
      
      res.json(dbRequests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  app.post("/api/vendor-service-requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const { title, description, estimatedHours, preferredDate } = req.body;
      if (!title || !description) return res.status(400).json({ error: "Missing required fields" });
      const request = await storage.createServiceRequest({
        requesterId: userId,
        requesterType: 'vendor',
        title, description, estimatedHours, preferredDate,
      });
      res.status(201).json(request);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Failed to create request" });
    }
  });

  app.get("/api/vendor-service-requests", isAuthenticated, async (req: any, res) => {
    try {
      const vendorId = req.user?.id;
      if (!vendorId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const requests = await storage.getVendorServiceRequests(vendorId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  app.get("/api/admin/service-requests", isAdminAuthenticated, async (req: any, res) => {
    try {
      const requests = await storage.getAllServiceRequests();
      
      // Add unread counts for each request
      const requestsWithUnread = requests.map((request: any) => {
        // Return both unreadByRequester and unreadByAdmin
        return {
          ...request,
          unreadByRequester: request.unreadByRequester || 0,
          unreadByAdmin: request.unreadByAdmin || 0
        };
      });
      
      res.json(requestsWithUnread);
    } catch (error) {
      console.error("Error fetching admin service requests:", error);
      res.status(500).json({ error: "Failed to fetch service requests" });
    }
  });

  app.patch("/api/admin/service-requests/:id", isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      const adminId = req.session?.adminUserId || req.user?.id;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const updated = await storage.updateServiceRequestStatus(
        id,
        status,
        adminId,
        rejectionReason
      );

      res.json(updated);
    } catch (error) {
      console.error("Error updating service request:", error);
      res.status(500).json({ error: "Failed to update service request" });
    }
  });

  app.post("/api/admin/service-requests/:id/messages", isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Get admin user ID - either from session or from authenticated user
      let senderId = req.user?.id;
      
      // If no user auth, get system admin
      if (!senderId) {
        const [adminUser] = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.username, 'system_admin'))
          .limit(1);
        
        if (!adminUser) {
          return res.status(500).json({ error: "Admin user not found" });
        }
        senderId = adminUser.id;
      }

      const msg = await storage.createServiceRequestMessage({
        serviceRequestId: id,
        senderId,
        message,
      });

      // Increment unread count for the requester (user/vendor) since admin is sending
      await storage.incrementServiceRequestUnreadForRequester(id);

      // Override sender name to "Admin" for admin messages
      const responseMsg = {
        ...msg,
        senderName: 'Admin'
      };

      broadcastEvent({ type: 'service-request-message', data: responseMsg });
      res.status(201).json(responseMsg);
    } catch (error) {
      console.error("Error creating service request message:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Mark service request messages as read (Admin)
  app.post("/api/admin/service-requests/:id/messages/mark-read", isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Get admin ID - handle both Passport and session-based auth
      let adminId: string | undefined;
      if (req.user) {
        adminId = req.user.id;
      } else if (req.session?.adminAuth === true) {
        // Session-based admin - use system admin
        const adminUsers = await db.select().from(usersTable)
          .where(eq(usersTable.username, 'system_admin'))
          .limit(1);
        adminId = adminUsers.length > 0 ? adminUsers[0].id : undefined;
      }
      
      console.log(`[MARK-READ] Request received for service request ${id}, adminId=${adminId}`);
      
      if (!adminId) {
        console.log(`[MARK-READ] Failed - no adminId`);
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Mark messages as read and reset unread counter using storage function
      console.log(`[MARK-READ] Calling storage.markServiceRequestMessagesRead...`);
      await storage.markServiceRequestMessagesRead(id, adminId, true);
      console.log(`[MARK-READ] Completed successfully for ${id}`);
      
      res.json({ success: true });
    } catch (error) {
      console.error("[MARK-READ] Error:", error);
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  app.get("/api/admin/service-requests/:id/messages", isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      let messages = await storage.getServiceRequestMessages(id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching service request messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // User-facing service request message routes
  app.post("/api/service-requests/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;
      const userId = req.user?.id;

      if (!userId || !message) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify the request belongs to this user or they're an approved helper
      const request = await storage.getServiceRequest(id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      if (request.requesterId !== userId) {
        // Check if user is the assigned admin (staff)
        const isAdminSession = req.session?.adminAuth === true;
        if (!isAdminSession && request.assignedAdminId !== userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      const msg = await storage.createServiceRequestMessage({
        serviceRequestId: id,
        senderId: userId,
        message,
      });

      // Increment unread count for admin since user/vendor is sending
      await storage.incrementServiceRequestUnreadForAdmin(id);

      broadcastEvent({ type: 'service-request-message', data: msg });
      res.status(201).json(msg);
    } catch (error) {
      console.error("Error creating service request message:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Mark service request messages as read (User/Vendor)
  app.post("/api/service-requests/:id/messages/mark-read", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Verify the request belongs to this user
      const request = await storage.getServiceRequest(id);
      if (!request || request.requesterId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      await storage.markServiceRequestMessagesRead(id, userId, false);
      
      // Reset unreadByRequester to 0 when user reads messages
      await db.update(serviceRequests)
        .set({ unreadByRequester: 0 })
        .where(eq(serviceRequests.id, id));
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  app.get("/api/service-requests/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Verify user has access to this request
      const request = await storage.getServiceRequest(id);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }

      if (request.requesterId !== userId && request.assignedAdminId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const messages = await storage.getServiceRequestMessages(id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching service request messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Service Offers API routes
  app.post("/api/admin/service-offers", isAdminAuthenticated, async (req: any, res) => {
    try {
      const { serviceRequestId, serviceName, price, hours } = req.body;

      if (!serviceRequestId || !serviceName || !price || !hours) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let adminId = req.user?.id;
      if (!adminId) {
        const [adminUser] = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.username, 'system_admin'))
          .limit(1);
        adminId = adminUser?.id;
      }

      const offer = await storage.createServiceOffer({
        serviceRequestId,
        serviceName,
        price: price.toString(),
        hours: hours.toString(),
        createdBy: adminId,
      });

      // Send offer as a message
      const msg = await storage.createServiceRequestMessage({
        serviceRequestId,
        senderId: adminId,
        message: `OFFER: ${serviceName} - HK$${price} for ${hours} hours`,
      });

      broadcastEvent({ type: 'service-offer', data: offer });
      res.status(201).json(offer);
    } catch (error) {
      console.error("Error creating service offer:", error);
      res.status(500).json({ error: "Failed to create offer" });
    }
  });

  app.get("/api/service-offers/:serviceRequestId", isAuthenticated, async (req: any, res) => {
    try {
      const { serviceRequestId } = req.params;
      const offers = await storage.getServiceOffers(serviceRequestId);
      res.json(offers);
    } catch (error) {
      console.error("Error fetching service offers:", error);
      res.status(500).json({ error: "Failed to fetch offers" });
    }
  });

  app.post("/api/service-offers/:id/accept-and-pay", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const offer = await storage.getServiceOffer(id);
      if (!offer) {
        return res.status(404).json({ error: "Offer not found" });
      }

      // Verify this is for the user's service request
      const request = await storage.getServiceRequest(offer.serviceRequestId);
      if (request?.requesterId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(offer.price as string) * 100), // Convert to cents
        currency: 'hkd',
        metadata: {
          serviceOfferId: id,
          serviceRequestId: offer.serviceRequestId,
          userId,
        },
      });

      // Update offer with payment intent ID
      const updated = await storage.updateServiceOffer(id, {
        paymentIntentId: paymentIntent.id,
      });

      res.json({ clientSecret: paymentIntent.client_secret, offer: updated });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to process payment" });
    }
  });

  app.post("/api/service-offers/:id/confirm-payment", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;

      const offer = await storage.getServiceOffer(id);
      if (!offer) {
        return res.status(404).json({ error: "Offer not found" });
      }

      // Update offer status to paid
      const updated = await storage.updateServiceOffer(id, { status: 'paid' });

      // Get the service request
      const request = await storage.getServiceRequest(offer.serviceRequestId);
      if (!request) {
        return res.status(404).json({ error: "Service request not found" });
      }

      // Create SERVICE REQUEST FEE record (separate from regular transactions)
      const feeAmount = parseFloat(offer.price as string);
      
      await db.insert(serviceRequestFees).values({
        serviceRequestId: offer.serviceRequestId,
        serviceOfferId: id,
        userId: req.user?.id,
        fee: feeAmount,
        status: 'completed',
        stripePaymentIntentId: offer.paymentIntentId,
        stripeChargeId: null,
        currency: 'hkd',
      });

      // Notify admin that payment was received
      await storage.createServiceRequestMessage({
        serviceRequestId: offer.serviceRequestId,
        senderId: req.user?.id,
        message: `Payment received for offer: ${offer.serviceName} - HK$${offer.price}`,
      });
      
      console.log(`Offer ${id} marked as paid. Service request fee HK$${feeAmount} recorded (100% to admin).`);

      // Broadcast to force admin dashboard refresh
      broadcastEvent({ 
        type: 'service-offer-paid', 
        data: updated,
        invalidateQueries: ['/api/admin/transactions', '/api/admin/service-request-fees']
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ error: "Failed to confirm payment" });
    }
  });

  app.post("/api/service-offers/:id/cancel", isAdminAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;

      const offer = await storage.getServiceOffer(id);
      if (!offer) {
        return res.status(404).json({ error: "Offer not found" });
      }

      // If payment was made, process refund
      if (offer.paymentIntentId && offer.status === 'paid') {
        await stripe.refunds.create({
          payment_intent: offer.paymentIntentId,
        });
      }

      const updated = await storage.updateServiceOffer(id, { status: 'cancelled' });

      // Notify user of cancellation
      const request = await storage.getServiceRequest(offer.serviceRequestId);
      const adminId = req.user?.id || (await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.username, 'system_admin'))
        .limit(1)
        .then(r => r[0]?.id));

      await storage.createServiceRequestMessage({
        serviceRequestId: offer.serviceRequestId,
        senderId: adminId,
        message: `Service cancelled: ${offer.serviceName}. Payment refunded.`,
      });

      broadcastEvent({ type: 'service-offer-cancelled', data: updated });
      res.json(updated);
    } catch (error) {
      console.error("Error cancelling service:", error);
      res.status(500).json({ error: "Failed to cancel service" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    wsClients.add(ws);
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      wsClients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(ws);
    });
  });
  
  return httpServer;
}
