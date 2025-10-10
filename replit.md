# EMC HUB - Ethnic Minority Community Business Directory

## Overview

EMC HUB is a web platform designed to connect Hong Kong's ethnic minority community through digital discovery. The application serves as a comprehensive marketplace that allows users to find, explore, and support ethnic minority-owned businesses, products, and services across Hong Kong. The platform features business listings, product marketplace, service directory, TimeDollars exchange system, search functionality, location-based discovery, and community engagement tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates

### Custom Category System (October 2025)
- **Free-Text Product Categories**: Implemented custom category system allowing vendors to enter free-text categories for products. Categories are entered as comma-separated values in a text input field instead of selecting from a predefined dropdown.
- **Admin Approval for Products**: All new products are automatically submitted with "pending" status and require admin approval before being published. This ensures quality control and oversight of product listings.
- **Category Display**: Custom categories are displayed as badges across all views - directory page, vendor dashboard, and admin approval interface. Categories are properly split by commas and empty values are filtered out.
- **Backward Compatibility**: The customCategory field was added alongside the existing categoryId field to maintain compatibility with listings that use the traditional category system.

### Search Functionality (October 2025)
- **Admin Listings Search**: Added comprehensive search functionality to the admin listings page, allowing administrators to search listings by title, description, address, city, phone, and email. The search is real-time, case-insensitive, and works across all tabs (All, Published, Draft).

### Navigation Improvements (October 2025)
- **User Dashboard Access**: Added "My Dashboard" link to the sidebar navigation for authenticated users, providing easy access to the user dashboard from any page in the application. The link appears in the Account section alongside the Profile link.

### Dashboard Visual Improvements (October 2025)
- **Sidebar Enhancements**: 
  - Removed profile picture and email from sidebar user info section for cleaner appearance
  - Added rounded-xl links with smooth hover effects (white background with green text on active state)
  - Improved spacing between navigation items with modern shadows
  - Username displayed prominently with verification badge for verified vendors
- **Fixed Navbar**: Dashboard navbar now stays fixed at top when scrolling (sticky position with shadow)
- **Profile Card Modernization**: 
  - Enhanced with shadow-lg and clean borders
  - Larger profile picture (w-24 h-24) with elegant shadow effects
  - Improved layout alignment and modern typography
- **Vendor Status Styling**: 
  - Light green gradient background (from-green-50 to-emerald-50)
  - Rounded-2xl edges with modern shadow effects
  - Enhanced icon and badge presentation
- **Dropdown Menu Refinement**:
  - Increased width for better content display (w-64)
  - Shadow-xl with borderless design for modern look
  - Better spacing and hover effects (gray background on hover, red for logout)
  - Consistent styling across homepage and dashboard menus
- **Settings Navigation Fix**: Profile icon settings link corrected to navigate to /dashboard/settings instead of /settings
- **Navigation Restructure**: 
  - Reorganized sidebar navigation order: My Dashboard → Profile → Browse → Reviews → TimeDollars → Services → WhatsApp → Settings
  - Removed profile icon dropdown menu from dashboard navbar for cleaner interface
  - Added Browse button to navbar for quick access to listings
  - Navbar now contains: Page Title, Browse button, and Logout button

## System Architecture

### Frontend Architecture
The client is built using modern React with TypeScript, utilizing a component-based architecture. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, providing a consistent and accessible design system. The frontend uses Wouter for client-side routing, keeping the bundle size minimal compared to React Router. State management is handled through TanStack React Query for server state and React's built-in state management for local UI state.

### Backend Architecture
The server follows a traditional Express.js architecture with TypeScript. The application uses a modular approach with separate files for routes, storage interfaces, and database connections. The server implements middleware for request logging and error handling. The storage layer is abstracted through an interface pattern, currently implemented with an in-memory storage class but designed to easily switch to database persistence.

### Database Design
The application uses Drizzle ORM with PostgreSQL as the database solution. The schema is defined in a shared module, making it accessible to both client and server code. Currently, the schema includes a users table with basic authentication fields. The database configuration uses Neon's serverless PostgreSQL with WebSocket support for real-time capabilities.

### Styling and UI Framework
The frontend uses Tailwind CSS for styling with a comprehensive design system. The theme includes custom CSS variables for colors, typography, and spacing, enabling easy theming and dark mode support. The component library is based on shadcn/ui, which provides pre-built, customizable components following modern design patterns.

### Development Tooling
The project uses Vite as the build tool and development server, providing fast hot module replacement and optimized builds. TypeScript is used throughout for type safety, with path mapping configured for clean imports. The development environment includes Replit-specific plugins for enhanced development experience.

### Authentication Strategy
The current implementation includes basic user schema with username/password authentication fields. The storage interface includes methods for user creation and retrieval, suggesting a traditional session-based authentication approach.

### Asset Management
Static assets are managed through Vite's asset handling system with path aliases configured for easy importing. The application includes custom fonts (Inter, DM Sans, Fira Code, etc.) and uses external CDN resources for performance.

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support for real-time features
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL dialect support

### UI and Styling
- **Radix UI**: Headless component primitives for accessible UI components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: External font resources (Inter, DM Sans, Architects Daughter, Fira Code, Geist Mono)

### Frontend Libraries
- **React**: Core frontend framework with TypeScript support
- **TanStack React Query**: Server state management and data fetching
- **Wouter**: Lightweight client-side routing
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation library
- **Date-fns**: Date manipulation and formatting

### Development and Build Tools
- **Vite**: Build tool and development server
- **Replit Plugins**: Development environment enhancements for Replit platform
- **ESBuild**: Fast JavaScript bundler for production builds

### Backend Dependencies
- **Express.js**: Web application framework for Node.js
- **Connect-PG-Simple**: PostgreSQL session store for Express sessions
- **WebSocket (ws)**: WebSocket implementation for real-time communication
- **Memoizee**: Function memoization for performance optimization

The architecture is designed for scalability and maintainability, with clear separation of concerns between frontend and backend, and abstractions that allow for easy integration of additional services as the platform grows.