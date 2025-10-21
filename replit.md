# EMC HUB - Ethnic Minority Community Business Directory

## Overview
EMC HUB is a web platform designed to connect Hong Kong's ethnic minority community by facilitating the digital discovery and support of ethnic minority-owned businesses, products, and services. The platform features business listings, a product marketplace, a service directory, a TimeDollars exchange system, robust search functionality, location-based discovery, and community engagement tools. Its primary purpose is to act as a comprehensive marketplace, fostering economic growth and community cohesion within Hong Kong's ethnic minority groups.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built with React and TypeScript, using a component-based architecture. UI components are developed with `shadcn/ui` on top of Radix UI primitives for a consistent and accessible design system. Wouter handles client-side routing, and state management utilizes TanStack React Query for server state and React's built-in hooks for local UI state.

### Backend Architecture
The server uses a modular Express.js architecture with TypeScript, featuring separate files for routes, storage interfaces, and database connections. It includes middleware for logging and error handling. The storage layer uses an interface pattern, currently in-memory but designed for easy transition to database persistence.

### Database Design
The application uses Drizzle ORM with PostgreSQL (hosted on Neon for serverless capabilities and WebSocket support) for data persistence. The schema is defined in a shared module, accessible to both client and server.

### Styling and UI Framework
Styling is managed with Tailwind CSS, incorporating a custom design system with CSS variables for theming and dark mode. The `shadcn/ui` library provides pre-built, customizable components.

### Development Tooling
Vite serves as the build tool and development server, offering fast HMR. TypeScript ensures type safety throughout the project, with path mapping for clean imports. Replit-specific plugins enhance the development experience.

### Authentication Strategy
The current implementation uses a basic user schema with username/password fields, suggesting a traditional session-based authentication approach.

### Asset Management
Vite manages static assets with path aliases. The application incorporates custom fonts (Inter, DM Sans, Fira Code, etc.) and utilizes external CDN resources for performance.

### Key Features and Implementations
- **Custom Category System**: Vendors can define free-text product categories, which are admin-approved and displayed as badges.
- **Admin Search**: Comprehensive real-time search for listings on the admin page across multiple fields.
- **Enhanced Dashboards**: Improved UI/UX for user and vendor dashboards, including fixed navbars, modernized profile cards, and reorganized navigation.
- **Listing Management**: Authenticated users can create and manage listings with tab-based filtering for approved, pending, and rejected statuses.
- **Public Products Marketplace**: A dedicated `/products` page for browsing and purchasing approved products, featuring search, stock indicators, and product detail pages.
- **Advanced Pricing System**: Flexible payment options for products, services, and events including Cash Only, TimeDollar Only, Both (Customer Choice), and Combo Split.
- **Vendor-Specific Dashboard Sections**: Dedicated sections for verified vendors to manage products, services, events, inventory, coupons, and pricing settings.
- **Comprehensive Coupon System**: Two-tier coupon system with vendor and admin capabilities:
  - **Coupon Types**:
    - Discount Coupons: Percentage or fixed HK$ off (vendor or admin-issued)
    - Cash Coupons: Fixed HK$ value (admin-only, via TimeDollar redemption)
  - **Issuers & Approval Flow**:
    - Vendor-issued coupons require admin approval (pending → approved/rejected)
    - Admin-issued coupons are auto-approved
    - **Product-Coupon Auto-Approval**: When admin approves a product, any pending coupons linked to that product are automatically approved
    - **Coupon Lock Mechanism**: Once approved, coupons become locked and vendors cannot edit them (admins retain full control)
  - **Scope & Applicability**:
    - Platform-wide coupons: Apply to all eligible orders
    - Product-specific coupons: Apply only to specific products
  - **Liability & Cost Tracking**:
    - Vendor coupons: Vendor pays the discount cost
    - Admin coupons: Platform pays the discount cost
  - **Features**:
    - Usage limits and validity date ranges
    - Real-time validation at checkout (stock, expiry, usage limits)
    - Single discount field at checkout (supports both discount and cash coupons)
    - Coupon analytics and redemption tracking for vendors and admins
    - Integration with order system to record usage history
    - Admin can view coupon details in product approval modal for informed decision-making
  - **Management Pages**:
    - Vendor dashboard: Create, edit, view status of vendor coupons (locked after approval)
    - Admin dashboard: Create admin coupons, approve/reject vendor coupons, view all coupons with filters
- **Admin Vendors Tab**: Dedicated admin page (`/admin/vendors`) to view and manage all verified vendors with:
  - List of all users with vendor role
  - Vendor information display (username, email, phone, join date)
  - Role management dropdown to change user roles
  - Dedicated API endpoint `/api/admin/vendors` to fetch vendor users
- **Vendor Document Viewing**: Admin can view and download vendor verification documents with:
  - Large modal preview (95vw × 90vh) for documents
  - Support for images (PNG, JPG) and PDFs
  - Secure download from private Google Cloud Storage
  - Base64 data URL conversion for authenticated access
  - Admin authentication supports both session-based and OIDC users
- **Admin Dashboard & Analytics**: Comprehensive admin dashboard at `/admin` with:
  - **Dashboard Overview** (`/admin`): Real-time platform metrics including:
    - Business metrics: Total/active users (daily/weekly/monthly), total sales, 5% platform commission, TimeBank total
    - Listing statistics: Total, published, draft, and deleted listings
    - Recent activity: Latest signups, orders, and coupon redemptions
  - **Platform Analytics** (`/admin/analytics`): In-depth analytics with charts and tables:
    - User growth: 30-day line chart showing new user signups
    - Top users by activity: Table of most active users based on activity logs
    - Top users by spend: Table of highest-spending customers
    - Sales analytics: Total volume, average order value
    - Top categories: Bar chart of best-performing product categories by orders
    - Top products: Table of best-selling products by revenue
    - TimeBank statistics: TD earned, TD spent, net balance, top contributors
    - Coupon redemption rate: Percentage of orders using coupons
  - Uses Recharts library for data visualization (line charts, bar charts)
  - All analytics use server-side aggregation via `getAnalytics()` method in storage layer
  - API endpoints: `/api/admin/stats` for dashboard metrics, `/api/admin/analytics` for detailed analytics
- **User Management System**: Comprehensive admin user management at `/admin/users` with:
  - **User Search & Filtering**: Real-time search by name/email/phone and filters by role and account status
  - **User Status Management**: Suspend and reactivate user accounts (status: 'active' | 'suspended')
  - **User Editing**: Admin can edit non-PII user fields (username, role, timeDollars, etc.)
  - **Password Reset**: Admin can reset any user's password
  - **PII Access Control**: Email, phone, firstName, and lastName fields are:
    - Visible and editable only by super-admins
    - Masked/hidden for regular admins
    - Enforced at both API response level and UI display level
  - **User Roles**: 'consumer', 'vendor', 'admin', 'super-admin'
  - **Technical Implementation**:
    - Storage methods: `getUsersWithFilters()` with SQL LIKE search across multiple fields
    - API endpoints: GET `/api/admin/users` with query params, PUT `/api/admin/users/:id`, POST `/api/admin/users/:id/suspend|reactivate|reset-password`
    - Custom TanStack Query queryFn that serializes filters into URL query parameters
    - PII masking logic based on `req.user.role` in backend
    - All admin endpoints protected by `isAdminAuthenticated` middleware

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe ORM for PostgreSQL.

### UI and Styling
- **Radix UI**: Headless component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **Google Fonts**: External font resources.

### Frontend Libraries
- **React**: Core frontend framework.
- **TanStack React Query**: Server state management.
- **Wouter**: Lightweight client-side routing.
- **React Hook Form**: Form handling.
- **Zod**: Schema validation.
- **Date-fns**: Date manipulation.
- **Recharts**: Data visualization library for charts (line charts, bar charts, etc.).

### Development and Build Tools
- **Vite**: Build tool and development server.
- **Replit Plugins**: Replit platform enhancements.
- **ESBuild**: Fast JavaScript bundler.

### Backend Dependencies
- **Express.js**: Node.js web framework.
- **Connect-PG-Simple**: PostgreSQL session store.
- **WebSocket (ws)**: Real-time communication.
- **Memoizee**: Function memoization.