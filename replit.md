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
- **Coupon System**: Full-featured discount coupon system with:
  - Vendor-created coupons with separate cash and TimeDollar discount support
  - Flexible discount types (percentage or fixed amount) for both payment methods
  - Usage limits and validity date ranges
  - Real-time coupon validation at checkout
  - Automatic discount application to cash and/or TimeDollar amounts
  - Coupon usage tracking and analytics for vendors
  - Admin dashboard for monitoring all platform coupons and usage statistics
  - Integration with order system to save coupon data and record usage history

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

### Development and Build Tools
- **Vite**: Build tool and development server.
- **Replit Plugins**: Replit platform enhancements.
- **ESBuild**: Fast JavaScript bundler.

### Backend Dependencies
- **Express.js**: Node.js web framework.
- **Connect-PG-Simple**: PostgreSQL session store.
- **WebSocket (ws)**: Real-time communication.
- **Memoizee**: Function memoization.