# EMC HUB - Ethnic Minority Community Business Directory

## Overview
EMC HUB is a web platform designed to connect Hong Kong's ethnic minority community by facilitating the digital discovery and support of ethnic minority-owned businesses, products, and services. It acts as a comprehensive marketplace, featuring business listings, a product marketplace, a service directory, a TimeDollars exchange system, robust search functionality, location-based discovery, and community engagement tools, fostering economic growth and community cohesion.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
Built with React and TypeScript, using a component-based architecture with `shadcn/ui` (on Radix UI primitives) for consistent design. Wouter handles routing, while TanStack React Query manages server state, and React hooks manage local UI state.

### Backend
A modular Express.js server with TypeScript, separating routes, storage interfaces, and database connections. It includes middleware for logging and error handling. The storage layer uses an interface pattern for flexible data persistence.

### Database
Drizzle ORM with PostgreSQL (hosted on Neon) for data persistence. The schema is defined in a shared module.

### Styling and UI
Tailwind CSS provides styling with a custom design system and CSS variables for theming. `shadcn/ui` offers customizable components.

### Development Tooling
Vite is used for building and development, providing fast HMR. TypeScript ensures type safety, and Replit-specific plugins enhance the development experience.

### Authentication
A basic user schema with username/password fields suggests a traditional session-based authentication approach.

### Asset Management
Vite manages static assets with path aliases, incorporating custom fonts and external CDN resources for performance.

### Key Features
- **Custom Category System**: Vendor-defined product categories, admin-approved and displayed as badges.
- **Admin Search**: Real-time listing search across multiple fields on the admin page.
- **Enhanced Dashboards**: Improved UI/UX for user and vendor dashboards.
- **Listing Management**: Authenticated users can create and manage listings with status-based filtering.
- **Public Products Marketplace**: A dedicated `/products` page for browsing and purchasing, with search, stock indicators, and product detail pages.
- **Advanced Pricing System**: Flexible payment options including Cash Only, TimeDollar Only, Both, and Combo Split.
- **Vendor-Specific Dashboard Sections**: Dedicated sections for verified vendors to manage products, services, events, inventory, coupons, and pricing.
- **Comprehensive Coupon System**: Two-tier system (vendor/admin-issued) with discount and cash coupons, approval flows, usage limits, and analytics. Integrates with the order system and includes management pages for vendors and admins.
- **Admin Vendors Tab**: Page at `/admin/vendors` to view, manage, and change roles for verified vendors.
- **Vendor Document Viewing**: Admin can securely view and download vendor verification documents (images, PDFs) from Google Cloud Storage.
- **Admin Dashboard & Analytics**: Comprehensive dashboard (`/admin`) with real-time platform metrics, user growth, sales analytics, TimeBank statistics, and coupon redemption rates, using Recharts for visualization.
- **User Management System**: Admin page (`/admin/users`) for user search, filtering, status management (suspend/reactivate), editing non-PII fields, password resets, and PII access control based on user roles ('consumer', 'vendor', 'admin', 'super-admin').
- **Stripe Payment Integration & Transaction Tracking**: Complete payment processing with automatic 5% platform commission for all purchases (Cash, TimeDollar, Both). Transactions are recorded in a `transactions` table with detailed breakdowns, and an admin page (`/admin/transactions`) allows viewing and filtering transactions. TimeDollar conversion is fixed at 60 HK$ per 1 TD.
- **Vendor Order Management**: Vendors have a dedicated dashboard (`/dashboard/vendor-orders`) to view, filter, and manage orders for their products, including accepting or rejecting pending orders.
- **Vendor Transaction Tracking**: Vendors have a dedicated transactions page (`/dashboard/vendor-transactions`) showing their sales history, net earnings (95% after 5% platform commission), and payment method breakdowns. Displays commission deductions, filters by payment method (cash/TimeDollar/both) and status, with detailed transaction records for all sales.

## External Dependencies

### Database Services
- Neon Database (PostgreSQL hosting)
- Drizzle ORM

### UI and Styling
- Radix UI
- Tailwind CSS
- Lucide React (Icon library)
- Google Fonts

### Frontend Libraries
- React
- TanStack React Query
- Wouter
- React Hook Form
- Zod
- Date-fns
- Recharts

### Development and Build Tools
- Vite
- Replit Plugins
- ESBuild

### Backend Dependencies
- Express.js
- Connect-PG-Simple
- WebSocket (ws)
- Memoizee