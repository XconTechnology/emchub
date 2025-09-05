import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBusinessListingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Email/password authentication routes
  app.post('/api/auth/signin', async (req, res) => {
    const { email, password } = req.body;
    
    try {
      // For now, we'll simulate email/password authentication
      // In a real app, you'd verify against your database
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Simulate authentication check
      if (password.length < 6) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // For demo purposes, create a mock user session
      const mockUser = {
        id: `email_${email.replace('@', '_').replace('.', '_')}`,
        email,
        firstName: email.split('@')[0],
        lastName: 'User',
        profileImageUrl: null,
      };

      // In a real app, you'd create a proper session here
      res.json({ message: "Authentication successful", user: mockUser });
    } catch (error) {
      console.error("Sign in error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    
    try {
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // For demo purposes, create a mock user
      const newUser = {
        id: `email_${email.replace('@', '_').replace('.', '_')}`,
        email,
        firstName,
        lastName,
        profileImageUrl: null,
      };

      // In a real app, you'd save to database and create session
      res.json({ message: "Account created successfully", user: newUser });
    } catch (error) {
      console.error("Sign up error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Business listing routes
  app.post('/api/listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const listings = await storage.getUserListings(userId);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      res.status(500).json({ message: "Failed to fetch user listings" });
    }
  });

  // Protected route example
  app.get("/api/protected", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    res.json({ message: "This is a protected route", userId });
  });

  // Auth callback routes for popup handling
  app.get("/auth/success", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Success</title>
        <style>
          body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
          .spinner { border: 2px solid #f3f3f3; border-top: 2px solid #3498db; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="spinner"></div>
        <p>Authentication successful! Closing window...</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'AUTH_SUCCESS' }, window.location.origin);
            window.close();
          } else {
            window.location.href = '/';
          }
        </script>
      </body>
      </html>
    `);
  });

  app.get("/auth/error", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Error</title>
        <style>
          body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; color: #dc2626; }
        </style>
      </head>
      <body>
        <h2>Authentication Failed</h2>
        <p>Please try again or contact support if the problem persists.</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'AUTH_ERROR', error: 'Authentication failed' }, window.location.origin);
            window.close();
          } else {
            setTimeout(() => window.location.href = '/', 3000);
          }
        </script>
      </body>
      </html>
    `);
  });

  const httpServer = createServer(app);
  return httpServer;
}
