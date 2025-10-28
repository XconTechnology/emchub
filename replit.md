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
- **Order-Based Chat**: "Chat with Vendor" button on each order in My Purchases page allows customers to message vendors about specific orders, automatically creating conversations with product context.
- **C2Admin Support and Reporting System**: Complete support ticket system with real-time messaging for user inquiries and vendor-assisted support:
    - **User Features**:
        - "Contact Support" button in user dashboard and footer
        - Submit support tickets with subject, message, and priority (low, normal, high, urgent)
        - View own support ticket history with status updates
        - Track ticket status: open, pending, closed
    - **Admin Features**:
        - Admin Support Tickets dashboard to view all user support tickets
        - Search and filter by status and priority
        - Assign tickets to verified vendors with required initial message
        - Message dialog when assigning: admin writes message to explain issue to vendor
        - View detailed ticket information in popup with user details
        - Quick Message button next to View button for assigned tickets (direct messaging without opening full details)
        - Dedicated quick message dialog with conversation history and real-time updates
        - Update ticket status (open → pending → closed)
        - Change ticket priority
        - Console logging for new tickets (ready for email notification integration)
    - **Vendor Features**:
        - "Assigned Tickets" page in vendor dashboard to view tickets assigned by admins
        - Real-time ticket chat interface for communicating with admins and users
        - Full conversation thread with message history
        - Auto-refreshing messages (polls every 3 seconds)
        - Send and receive messages in ticket thread
        - View original issue details and ticket metadata
    - **Messaging System**:
        - Two-way communication between admin and vendor within ticket threads
        - Message history with sender information and timestamps
        - Visual distinction for admin messages (badge)
        - Real-time message display with auto-scroll
        - Keyboard shortcuts (Enter to send, Shift+Enter for new line)
        - Disabled messaging for closed tickets
    - **Database Schema**:
        - `support_tickets` table: id, userId, subject, message, status, priority, assignedTo, createdAt, updatedAt
        - `support_ticket_messages` table: id, ticketId, senderId, message, createdAt
    - **Technical Implementation**:
        - Storage methods: createSupportTicket, getAllSupportTickets, getUserSupportTickets, updateTicketStatus, assignTicket, updateTicketPriority, getVendorAssignedTickets, createTicketMessage, getTicketMessages
        - API endpoints: 
            - POST /api/support-tickets, GET /api/support-tickets, GET /api/support-tickets/my-tickets
            - PUT endpoints for status/assign/priority
            - GET /api/support-tickets/vendor/assigned (vendor assigned tickets)
            - POST /api/support-tickets/:ticketId/messages (create message)
            - GET /api/support-tickets/:ticketId/messages (get all messages for ticket)
        - Frontend components: 
            - ContactSupportForm (modal)
            - user-support-tickets page
            - admin-support-tickets page with detailed view dialog and assign message dialog
            - vendor-support-tickets page (list of assigned tickets)
            - vendor-support-ticket-chat page (full chat interface)
        - Real-time updates via TanStack Query with cache invalidation and polling
        - Permission-based access: admins, ticket owners, and assigned vendors can message
        - Admin-only access for ticket management via isAdminAuthenticated middleware

- **Staff Account System with Role-Based Access Control (RBAC)**:
    - **Architecture**: Complete RBAC system for managing staff users with granular permissions
    - **Staff Roles**:
        - **Support**: Access to Support Tickets only
        - **Sales**: Access to Refunds/Transactions only
        - **Mediator**: Access to TimeDollar Disputes only
        - **Listings**: Access to Listing Approvals and Categories only
        - **Full Admin**: Access to all admin features except Super Admin settings (Support, Sales, Disputes, Listings, Users, Vendors, Coupons, Analytics)
    - **Super Admin**: Can create and manage all staff users, view audit logs, full system access
    - **Database Schema**:
        - `users.staffRole` field: Stores staff-specific role (support, sales, mediator, listings, full_admin)
        - `staff_audit_logs` table: Comprehensive audit trail with staffId, staffUsername, staffRole, action, entityType, entityId, description, metadata, ipAddress, userAgent, createdAt
    - **RBAC Middleware** (server/rbac.ts):
        - `isStaffAuthenticated`: Validates staff authentication
        - `requireStaffAccess(resource)`: Resource-based permission checking
        - `isSuperAdmin`: Restricts staff management to super-admin users only
        - `getAccessibleMenuItems(staffRole)`: Returns role-specific menu items
    - **API Endpoints** (Super Admin Only):
        - POST /api/staff/create - Create new staff user
        - GET /api/staff - List all staff users
        - PUT /api/staff/:id/role - Update staff role
        - DELETE /api/staff/:id - Delete staff user
        - GET /api/staff/audit-logs - View all staff audit logs
        - GET /api/staff/:id/audit-logs - View staff-specific audit logs
    - **Authentication**:
        - Staff login: /staff-login page for staff authentication
        - Staff must use regular user accounts with role='staff' and assigned staffRole
        - Super Admin access requires user account with role='super-admin' (NOT session-based admin)
    - **Audit Logging**: All staff actions are automatically logged with:
        - Who performed the action (staff ID, username, role)
        - What action was performed (create, update, delete, approve, reject, assign, message)
        - What entity was affected (ticket, listing, refund, dispute, user, coupon)
        - When it happened (timestamp)
        - From where (IP address, user agent)
        - Additional context (metadata in JSON format)
    - **Security**:
        - Role-based resource access enforced at API level
        - Super Admin actions restricted to actual super-admin user accounts
        - All staff management operations logged in audit trail
        - Session-based admin (admin/admin123) is for regular admin tasks only
    - **Setup Instructions**:
        1. Create a super-admin user account in database:
           ```sql
           INSERT INTO users (username, email, password, role, status)
           VALUES ('superadmin', 'superadmin@example.com', 'hashed_password', 'super-admin', 'active');
           ```
        2. Login as super-admin user (not session-based admin)
        3. Access staff management at /admin-staff (TODO: create UI)
        4. Create staff accounts with appropriate roles
        5. Staff members login at /staff-login
        6. Staff see only their role-specific dashboard menus

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