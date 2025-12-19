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
- **Enhanced Dashboards**: Improved UI/UX for user and vendor dashboards.
- **Listing Management**: Authenticated users can create and manage product and service listings.
- **Public Products Marketplace**: Dedicated section for browsing and purchasing products.
- **Authentication-Protected Actions**: All user actions (Add to Cart, Buy Now, Message Vendor) require authentication.
- **Events Module**: Complete event management system for vendors, requiring admin approval. Supports various event types and payment options.
- **Advanced Pricing System**: Supports Cash Only, TimeDollar Only, Both, and Combo Split payment options.
- **Comprehensive Coupon System**: Two-tier system with vendor and admin-issued coupons, including discount and cash coupons, with approval workflows and analytics.
- **Admin Dashboards**: Tools for managing vendors, users, transactions, and viewing platform analytics with Recharts for visualization.
- **Stripe Payment Integration**: Secure credit card payment processing with automatic 5% admin commission splitting.
- **Vendor Order Management**: Vendors can view, filter, and manage their product orders.
- **B2C Messaging System**: Real-time WebSocket-integrated messaging for vendor-customer communication, linked to specific products.
- **Order-Based Chat**: Allows customers to message vendors about specific orders directly from the "My Purchases" page.
- **C2Admin Support and Reporting System**: Complete support ticket system with integrated messaging for staff-user communication, including user-facing forms, admin dashboards for ticket management, and staff dashboards for handling assigned tickets. Features a dedicated `support_tickets` and `support_ticket_messages` database schema for user-staff communication, with role-based access for admins (view-only), staff (bi-directional messaging for assigned tickets), and users (bi-directional messaging for their tickets).
- **Staff Account System with Role-Based Access Control (RBAC)**: Comprehensive RBAC for managing staff users with granular permissions. Includes roles like Individual, Business, Support, Sales, Mediator, Full Admin, and Super Admin. All staff actions are logged in an audit trail. Access is enforced at the API level.
- **TimeDollar (TD) System**: Fully integrated digital currency system with immutable ledger. Key rules:
  - **Core Constants**: 1 TD = 1 verified hour of service = 100 TimeCents (TC) = HK$60
  - **TD NEVER EXPIRES**: TimeDollars have no expiry date and remain in wallet indefinitely
  - **TD IS NOT TRANSFERABLE**: TD cannot be transferred/traded between users. All TD changes must go through platform-verified flows only
  - **Coupons CAN Expire**: Cash coupons generated from TD conversions may have `validUntil` dates
  - **Earning TD**: Sellers earn TD when orders are marked as "delivered" (TD = listing.tdValue × quantity)
  - **Spending TD**: Users can spend TD on TD-eligible listings (tdEligible=true) with automatic wallet balance updates
  - **TD to Cash Conversion**: Users can convert TD to cash coupons via `/api/td/convert-to-coupon`
  - **Immutable Ledger**: Every TD change creates an immutable ledger entry in `td_transactions` with type (earn/spend/conversion/admin_credit/admin_debit/reversal), counterpartyUserId, adminId, couponId for full audit trail
  - **Admin Adjustments**: Admin TD adjustments require mandatory notes for audit trail, create ledger entries with adminId
  - **Database Tables**: `td_wallet` (balances), `td_transactions` (immutable ledger), `td_conversions` (TD→coupon records), `td_disputes` (dispute resolution)
  - **Validation**: Users cannot spend more TD than available; coupon expiry checked before redemption

## External Dependencies

### Database Services
- Neon Database (PostgreSQL)
- Drizzle ORM

### UI and Styling
- Radix UI
- Tailwind CSS
- Lucide React
- Google Fonts
- shadcn/ui

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