# EMC HUB - Ethnic Minority Community Business Directory

## Overview
EMC HUB is a web platform designed to connect Hong Kong's ethnic minority community by facilitating the digital discovery and support of ethnic minority-owned businesses, products, and services. It acts as a comprehensive marketplace, featuring business listings, a product marketplace, a service directory, a TimeDollars exchange system, robust search functionality, location-based discovery, and community engagement tools. The platform's primary purpose is to foster economic growth and community cohesion within Hong Kong's ethnic minority groups.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Core Architecture
The platform utilizes a React and TypeScript frontend built on a component-based architecture with `shadcn/ui` for UI components and Tailwind CSS for styling. Backend services are powered by Express.js with TypeScript, employing a modular design. Data persistence is managed with Drizzle ORM and PostgreSQL (Neon). Vite is used for development and building.

### Key Features
- **Custom Category System**: Vendor-defined, admin-approved product categories.
- **Enhanced Dashboards**: Improved UI/UX for user and vendor dashboards, including fixed navbars and reorganized navigation.
- **Listing Management**: Authenticated users can create and manage product and service listings.
- **Public Products Marketplace**: A dedicated section for browsing and purchasing products with search and product detail pages.
- **Advanced Pricing System**: Supports Cash Only, TimeDollar Only, Both, and Combo Split payment options.
- **Comprehensive Coupon System**: Two-tier system with vendor and admin-issued coupons, including discount and cash coupons, with approval workflows, usage limits, and analytics.
- **Admin Dashboards**:
    - **Admin Vendors Tab**: Manage verified vendors and user roles.
    - **Admin Dashboard & Analytics**: Real-time platform metrics, user growth, sales analytics, TimeBank statistics, and coupon redemption rates, utilizing Recharts for visualization.
    - **User Management System**: Admin tools for user search, filtering, status management, non-PII editing, and password resets with role-based PII access control.
    - **Transactions Page**: View all payment transactions, commission breakdowns, and filter by status.
- **Stripe Payment Integration**: Secure credit card payment processing with automatic 5% admin commission splitting, supporting various payment methods (Cash Only, TimeDollar Only, Combo).
- **Vendor Order Management**: Vendors can view, filter, and manage orders for their products, including accepting or rejecting pending orders.
- **B2C Messaging System**: Real-time WebSocket-integrated messaging for vendor-customer communication, linking conversations to specific products and supporting multi-role users with unread message counts.
- **C2Admin Support and Reporting System**:
    - **Support Tickets**: Users can contact support from dashboard or footer, creating tickets with subject and message. Admins can view, filter (by status/assigned staff), assign to staff, and update status (open→pending→closed).
    - **Content Reporting**: Users can report products and vendor profiles with reasons (fraud, spam, inappropriate, other). Reports auto-create linked support tickets for admin review.
    - **Admin Management**: Dedicated admin pages for managing support tickets and reports with filtering, status updates, and action tracking.

## External Dependencies

### Database Services
- Neon Database (PostgreSQL)
- Drizzle ORM

### UI and Styling
- Radix UI
- Tailwind CSS
- Lucide React
- Google Fonts

### Frontend Libraries
- React
- TanStack React Query
- Wouter
- React Hook Form
- Zod
- Date-fns
- Recharts
- `@stripe/stripe-js`
- `@stripe/react-stripe-js`

### Development and Build Tools
- Vite
- Replit Plugins
- ESBuild

### Backend Dependencies
- Express.js
- Connect-PG-Simple
- WebSocket (ws)
- Memoizee