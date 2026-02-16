--
-- PostgreSQL database dump
--

\restrict ZQ8m0nRswo1iZiGxaj21hbfWfIhONVsKw6tGXWX6Xi9MJ8NvIV9xOfKtUAKKRrb

-- Dumped from database version 16.11 (df20cf9)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    user_name character varying NOT NULL,
    action_type character varying NOT NULL,
    entity_type character varying NOT NULL,
    entity_id character varying,
    entity_title character varying,
    description text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    listing_id character varying NOT NULL,
    user_id character varying NOT NULL,
    booking_date timestamp without time zone NOT NULL,
    duration_minutes integer,
    number_of_people integer DEFAULT 1,
    total_price numeric(10,2),
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    payment_intent_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: business_listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_listings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    business_name character varying NOT NULL,
    category character varying NOT NULL,
    description character varying(1000),
    address character varying NOT NULL,
    city character varying NOT NULL,
    postal_code character varying,
    phone character varying,
    email character varying,
    website character varying,
    operating_hours jsonb,
    cuisine_type character varying,
    price_range character varying,
    tags character varying[],
    image_url character varying,
    is_halal character varying DEFAULT 'yes'::character varying,
    is_verified character varying DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    product_id character varying NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    description text,
    icon character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: contact_queries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_queries (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    subject character varying NOT NULL,
    message text NOT NULL,
    status character varying DEFAULT 'new'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    customer_id character varying NOT NULL,
    vendor_id character varying NOT NULL,
    product_id character varying,
    product_title character varying,
    last_message_at timestamp without time zone DEFAULT now(),
    last_message text,
    unread_by_customer integer DEFAULT 0,
    unread_by_vendor integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: coupon_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupon_usage (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    coupon_id character varying NOT NULL,
    user_id character varying NOT NULL,
    order_id character varying,
    cash_discount numeric(10,2) DEFAULT '0'::numeric,
    td_discount numeric(10,2) DEFAULT '0'::numeric,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    vendor_id character varying,
    code character varying NOT NULL,
    title character varying NOT NULL,
    description text,
    discount_type character varying,
    usage_limit integer,
    used_count integer DEFAULT 0,
    valid_from timestamp without time zone DEFAULT now(),
    valid_until timestamp without time zone,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    product_id character varying,
    coupon_type character varying NOT NULL,
    issuer character varying NOT NULL,
    scope character varying DEFAULT 'platform'::character varying NOT NULL,
    discount_value numeric(10,2),
    cash_value numeric(10,2),
    approved_by character varying,
    rejection_reason text
);


--
-- Name: event_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_registrations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    event_id character varying NOT NULL,
    vendor_id character varying NOT NULL,
    user_id character varying,
    full_name character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying,
    notes text,
    status character varying DEFAULT 'confirmed'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    td_rewarded boolean DEFAULT false,
    td_reward_amount numeric(10,2),
    td_rewarded_at timestamp without time zone
);


--
-- Name: listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.listings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    type character varying NOT NULL,
    title character varying NOT NULL,
    description text,
    category_id character varying,
    address character varying,
    city character varying,
    postal_code character varying,
    latitude numeric(10,8),
    longitude numeric(11,8),
    is_online_only boolean DEFAULT false,
    phone character varying,
    email character varying,
    website character varying,
    images character varying[],
    operating_hours jsonb,
    tags character varying[],
    sku character varying,
    price numeric(10,2),
    inventory integer,
    duration_minutes integer,
    event_date timestamp without time zone,
    event_end_date timestamp without time zone,
    capacity integer,
    attendee_count integer DEFAULT 0,
    event_price numeric(10,2),
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    payment_methods character varying[],
    moderation_status character varying DEFAULT 'pending'::character varying NOT NULL,
    moderation_notes text,
    moderated_by character varying,
    moderated_at timestamp without time zone,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    deleted_at timestamp without time zone,
    custom_category text,
    payment_type character varying DEFAULT 'cash_only'::character varying,
    cash_percentage integer,
    timedollar_percentage integer,
    td_price numeric(10,2),
    td_eligible boolean DEFAULT false,
    td_value integer,
    event_td_price integer,
    event_hours numeric(5,2),
    previous_values jsonb
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    conversation_id character varying NOT NULL,
    sender_id character varying NOT NULL,
    sender_role character varying NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    order_id character varying NOT NULL,
    product_id character varying NOT NULL,
    product_title character varying NOT NULL,
    product_price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    payment_method character varying,
    shipping_name character varying NOT NULL,
    shipping_phone character varying NOT NULL,
    shipping_address text NOT NULL,
    shipping_city character varying,
    shipping_postal_code character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    shipping_email character varying NOT NULL,
    cash_amount numeric(10,2) DEFAULT '0'::numeric,
    td_amount numeric(10,2) DEFAULT '0'::numeric,
    transaction_id character varying,
    coupon_id character varying,
    coupon_code character varying,
    coupon_cash_discount numeric(10,2) DEFAULT '0'::numeric,
    coupon_td_discount numeric(10,2) DEFAULT '0'::numeric,
    vendor_id character varying NOT NULL
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    listing_id character varying NOT NULL,
    vendor_id character varying NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    images text[]
);


--
-- Name: saved_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    listing_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: service_offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_offers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    service_request_id character varying NOT NULL,
    service_name character varying NOT NULL,
    price numeric(10,2) NOT NULL,
    hours numeric(5,2) NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    payment_intent_id character varying,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: service_request_fees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_request_fees (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    service_request_id character varying NOT NULL,
    service_offer_id character varying NOT NULL,
    user_id character varying NOT NULL,
    fee numeric(10,2) NOT NULL,
    status character varying DEFAULT 'completed'::character varying NOT NULL,
    stripe_payment_intent_id character varying,
    stripe_charge_id character varying,
    currency character varying DEFAULT 'hkd'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: service_request_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_request_messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    service_request_id character varying NOT NULL,
    sender_id character varying NOT NULL,
    message text NOT NULL,
    attachment_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    is_read boolean DEFAULT false
);


--
-- Name: service_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_requests (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    requester_id character varying NOT NULL,
    requester_type character varying NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    estimated_hours numeric(5,2),
    preferred_date character varying,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    assigned_admin_id character varying,
    completed_at timestamp without time zone,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    unread_by_requester integer DEFAULT 0,
    unread_by_admin integer DEFAULT 0
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- Name: staff_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_audit_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    staff_id character varying NOT NULL,
    staff_username character varying NOT NULL,
    staff_role character varying NOT NULL,
    action character varying NOT NULL,
    entity_type character varying NOT NULL,
    entity_id character varying,
    entity_title character varying,
    description text NOT NULL,
    metadata text,
    ip_address character varying,
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: staff_help_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_help_requests (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    user_name character varying NOT NULL,
    listing_type character varying NOT NULL,
    message text,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    assigned_to character varying,
    response_notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: support_ticket_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_ticket_messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    ticket_id character varying NOT NULL,
    sender_id character varying NOT NULL,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    receiver_id character varying NOT NULL,
    is_read boolean DEFAULT false
);


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    subject character varying NOT NULL,
    message text NOT NULL,
    status character varying DEFAULT 'open'::character varying NOT NULL,
    priority character varying DEFAULT 'normal'::character varying,
    assigned_to character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    issue_type character varying DEFAULT 'general'::character varying,
    attachment_url character varying
);


--
-- Name: td_conversions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.td_conversions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    td_spent numeric(10,2) NOT NULL,
    coupon_code character varying NOT NULL,
    coupon_id character varying,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: td_disputes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.td_disputes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    order_id character varying NOT NULL,
    buyer_id character varying NOT NULL,
    seller_id character varying NOT NULL,
    mediator_id character varying,
    status character varying DEFAULT 'open'::character varying NOT NULL,
    reason text NOT NULL,
    deadline timestamp without time zone,
    resolution_note text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: td_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.td_transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    type character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    listing_id character varying,
    order_id character varying,
    note text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: td_wallet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.td_wallet (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    td_balance numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    td_earned numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    td_spent numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    order_id character varying,
    vendor_id character varying NOT NULL,
    customer_id character varying NOT NULL,
    stripe_payment_intent_id character varying,
    stripe_charge_id character varying,
    total_amount numeric(10,2) NOT NULL,
    platform_commission numeric(10,2) NOT NULL,
    vendor_earnings numeric(10,2) NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    currency character varying DEFAULT 'hkd'::character varying NOT NULL,
    description text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    payment_method character varying DEFAULT 'cash'::character varying NOT NULL,
    cash_amount numeric(10,2) DEFAULT '0'::numeric,
    td_amount numeric(10,2) DEFAULT '0'::numeric
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    username character varying NOT NULL,
    password character varying NOT NULL,
    role character varying DEFAULT 'consumer'::character varying NOT NULL,
    phone character varying,
    bio text,
    vendor_status character varying DEFAULT 'none'::character varying NOT NULL,
    reset_password_token character varying,
    reset_password_expires timestamp without time zone,
    timedollar_balance real DEFAULT 0,
    td_cash_split_percentage integer DEFAULT 50,
    status character varying DEFAULT 'active'::character varying NOT NULL,
    staff_role character varying
);


--
-- Name: vendor_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_requests (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    business_name character varying NOT NULL,
    identification_doc character varying NOT NULL,
    business_registration_doc character varying,
    address_proof_doc character varying NOT NULL,
    description text,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    rejection_reason text,
    reviewed_by character varying,
    reviewed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    business_type character varying NOT NULL,
    contact_number character varying NOT NULL
);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_logs (id, user_id, user_name, action_type, entity_type, entity_id, entity_title, description, metadata, created_at) FROM stdin;
01a5aedb-fa9a-42b8-9d24-f1d87aacb214	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	usman	create	coupon	ed9f3cad-2431-4edb-b1b0-9f195ed156f2	for laptop	Created coupon: HBL - for laptop	{"coupon": {"id": "ed9f3cad-2431-4edb-b1b0-9f195ed156f2", "code": "HBL", "title": "for laptop", "status": "active", "isActive": true, "vendorId": "5f6b34c2-ad16-473b-a56d-1e4e3eaaf225", "createdAt": "2025-10-13T05:55:40.371Z", "updatedAt": "2025-10-13T05:55:40.371Z", "usedCount": 0, "validFrom": "2025-10-21T00:00:00.000Z", "usageLimit": null, "validUntil": "2025-11-01T00:00:00.000Z", "description": "", "discountType": "cash", "tdDiscountType": null, "tdDiscountValue": null, "cashDiscountType": "percentage", "cashDiscountValue": "10.00"}}	2025-10-13 05:55:40.447808
dc95e637-b310-4875-92ac-83a76b97ea6b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	usman	create	coupon	176b9427-75e1-40a1-8a4b-fe78e848db79	mobile	Created coupon: 0000 - mobile	{"coupon": {"id": "176b9427-75e1-40a1-8a4b-fe78e848db79", "code": "0000", "title": "mobile", "status": "active", "isActive": true, "vendorId": "5f6b34c2-ad16-473b-a56d-1e4e3eaaf225", "createdAt": "2025-10-13T05:57:43.688Z", "updatedAt": "2025-10-13T05:57:43.688Z", "usedCount": 0, "validFrom": "2025-10-13T00:00:00.000Z", "usageLimit": null, "validUntil": "2025-10-25T00:00:00.000Z", "description": "", "discountType": "both", "tdDiscountType": "percentage", "tdDiscountValue": "10.00", "cashDiscountType": "percentage", "cashDiscountValue": "10.00"}}	2025-10-13 05:57:43.755559
dee0095f-d473-4255-bb33-6d5e6bd5f40a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	usman	delete	coupon	ed9f3cad-2431-4edb-b1b0-9f195ed156f2	\N	Deleted coupon	\N	2025-10-13 06:39:24.51554
26d67c32-bf03-4a3e-b9b9-cede81516bd3	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	usman	delete	coupon	176b9427-75e1-40a1-8a4b-fe78e848db79	\N	Deleted coupon	\N	2025-10-13 06:39:27.670439
bf2b5548-754c-4c63-8667-2d37e3ef8b46	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	usman	create	coupon	75f2d4a0-5cb1-4704-b758-1c9f1d7a9cb6	mobile phone	Created coupon: US101 - mobile phone	{"coupon": {"id": "75f2d4a0-5cb1-4704-b758-1c9f1d7a9cb6", "code": "US101", "title": "mobile phone", "status": "active", "isActive": true, "vendorId": "5f6b34c2-ad16-473b-a56d-1e4e3eaaf225", "createdAt": "2025-10-13T06:40:16.878Z", "updatedAt": "2025-10-13T06:40:16.878Z", "usedCount": 0, "validFrom": "2025-10-13T00:00:00.000Z", "usageLimit": null, "validUntil": "2025-10-30T00:00:00.000Z", "description": "jdskcndskcbsalsnclsac", "discountType": "both", "tdDiscountType": "percentage", "tdDiscountValue": "9.98", "cashDiscountType": "percentage", "cashDiscountValue": "10.00"}}	2025-10-13 06:40:16.946048
c209f7f0-375e-4918-a84d-aac0c548bfa8	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	usman	create	coupon	c3d6d567-ec70-4f60-97d6-f8f13c022c73	Laptops	Created coupon: #EMCHUB - Laptops	{"coupon": {"id": "c3d6d567-ec70-4f60-97d6-f8f13c022c73", "code": "#EMCHUB", "title": "Laptops", "status": "active", "isActive": true, "vendorId": "5f6b34c2-ad16-473b-a56d-1e4e3eaaf225", "createdAt": "2025-10-13T09:52:10.922Z", "updatedAt": "2025-10-13T09:52:10.922Z", "usedCount": 0, "validFrom": "2025-10-13T00:00:00.000Z", "usageLimit": null, "validUntil": "2025-10-15T00:00:00.000Z", "description": "frtgtgtt", "discountType": "both", "tdDiscountType": "percentage", "tdDiscountValue": "10.00", "cashDiscountType": "percentage", "cashDiscountValue": "10.00"}}	2025-10-13 09:52:11.036736
1f0e790b-1038-422e-899b-4d07b23caa3e	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	suspend	user	973ca52e-e6bd-404b-bb79-11f764715389	admin1	Suspended user: admin1	{"userId": "973ca52e-e6bd-404b-bb79-11f764715389", "adminId": "3f7ec0b2-bddd-4276-ae29-383b66b94421"}	2025-10-21 10:59:06.145472
9eca6ce4-5439-418d-b7fe-2e78f1de0ffb	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	reactivate	user	973ca52e-e6bd-404b-bb79-11f764715389	admin1	Reactivated user: admin1	{"userId": "973ca52e-e6bd-404b-bb79-11f764715389", "adminId": "3f7ec0b2-bddd-4276-ae29-383b66b94421"}	2025-10-21 10:59:11.168284
6f8ed7ec-0c09-4ec2-9b3e-677fa0ce09fc	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	suspend	user	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	Suspended user: system	{"userId": "3f7ec0b2-bddd-4276-ae29-383b66b94421", "adminId": "3f7ec0b2-bddd-4276-ae29-383b66b94421"}	2025-10-22 05:47:21.745482
337e1ade-346e-4b41-921f-422b5511a7e2	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	reactivate	user	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	Reactivated user: system	{"userId": "3f7ec0b2-bddd-4276-ae29-383b66b94421", "adminId": "3f7ec0b2-bddd-4276-ae29-383b66b94421"}	2025-10-22 05:47:29.23193
c7f5f513-d1b8-47f6-890e-f21ceb6cf2f3	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	usman	reset_password	user	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	Reset password for user: system	{"userId": "3f7ec0b2-bddd-4276-ae29-383b66b94421"}	2025-10-22 11:01:28.4227
ce9bb7bc-ff77-4925-badc-3ffa03737122	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	usman	reset_password	user	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	Reset password for user: system	{"userId": "3f7ec0b2-bddd-4276-ae29-383b66b94421"}	2025-10-22 11:07:26.472098
96154d73-76ec-4cd2-8369-1bfbf5c2c5d3	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	usman	update	user	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	Updated user: system	{"updates": {"role": "consumer", "status": "active", "username": "system", "vendorStatus": "none", "timeDollarBalance": 100, "tdCashSplitPercentage": 50}}	2025-10-22 11:09:47.63234
ce5630f3-babe-4e05-a623-6d3050557d26	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	usman	reset_password	user	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	Reset password for user: system	{"userId": "3f7ec0b2-bddd-4276-ae29-383b66b94421"}	2025-10-22 11:42:59.373061
0f960f6d-299c-49b6-9f5e-636268764ce6	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	usman	reset_password	user	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	Reset password for user: system	{"userId": "3f7ec0b2-bddd-4276-ae29-383b66b94421"}	2025-10-23 05:09:48.415698
49db59c4-1258-4ea8-b731-1f0f184a8ee3	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	payment	timedollar_transaction	\N	Order Payment	Paid 0.75 TD for order	{"amount": -0.75, "tdAmount": 0.75, "cashAmount": 0, "totalAmount": 45, "paymentMethod": "timedollar"}	2025-10-24 06:29:35.297901
43a17d1c-9cd0-4bc0-b156-97a6aaa408fc	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	reset_password	user	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	Reset password for user: system	{"userId": "3f7ec0b2-bddd-4276-ae29-383b66b94421"}	2025-10-27 09:54:50.075846
8f40b313-b657-4487-80f0-99fb6f29afef	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	update	user	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	system_admin	Updated user: system_admin	{"updates": {"role": "admin", "status": "active", "username": "system_admin", "vendorStatus": "none", "timeDollarBalance": 20, "tdCashSplitPercentage": 50}}	2025-10-27 10:26:18.007453
5926e3a5-9c55-4b16-a3dd-956528a322c4	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	reset_password	user	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	system_admin	Reset password for user: system_admin	{"userId": "cbdb538b-520c-4f9e-9ce3-52b8dec4ade4"}	2025-10-27 10:27:33.393286
a33f163d-a007-4936-a35a-5d7d992dee38	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	system_admin	payment	timedollar_transaction	\N	Order Payment	Paid 0.75 TD for order	{"amount": -0.75, "tdAmount": 0.75, "cashAmount": 0, "totalAmount": 45, "paymentMethod": "timedollar"}	2025-10-27 10:30:21.646047
a9a23257-e51f-417b-9632-6a642c33da23	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	system_admin	reset_password	user	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	Reset password for user: system	{"userId": "3f7ec0b2-bddd-4276-ae29-383b66b94421"}	2025-10-29 09:54:25.876489
65959d12-288b-4735-9fdf-028a43cc6fcb	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	usman	create	coupon	6c0d54f1-61ab-47f6-9e0a-0437db5855d0	Handfree 	Created coupon: HBL - Handfree 	{"coupon": {"id": "6c0d54f1-61ab-47f6-9e0a-0437db5855d0", "code": "HBL", "scope": "platform", "title": "Handfree ", "issuer": "vendor", "status": "pending", "vendorId": "5f6b34c2-ad16-473b-a56d-1e4e3eaaf225", "cashValue": null, "createdAt": "2025-11-26T11:15:32.401Z", "productId": null, "updatedAt": "2025-11-26T11:15:32.401Z", "usedCount": 0, "validFrom": null, "approvedBy": null, "couponType": "discount", "usageLimit": null, "validUntil": null, "description": "Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree ", "discountType": "percentage", "discountValue": "5.00", "rejectionReason": null}}	2025-11-26 11:15:32.479013
8cbb90a7-53b4-4f65-92a1-086d57cf1946	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	system_admin	create	coupon	1f3b7d78-eca0-461f-9cee-ad01d126c26c	fffffffffff	Created platform coupon: FFFFF	{"coupon": {"id": "1f3b7d78-eca0-461f-9cee-ad01d126c26c", "code": "FFFFF", "scope": "product", "title": "fffffffffff", "issuer": "admin", "status": "approved", "vendorId": "cbdb538b-520c-4f9e-9ce3-52b8dec4ade4", "cashValue": null, "createdAt": "2025-11-28T10:27:09.900Z", "productId": "87fd157a-acec-488b-bf0b-196c00b8ba20", "updatedAt": "2025-11-28T10:27:09.900Z", "usedCount": 0, "validFrom": "2025-11-28T00:00:00.000Z", "approvedBy": null, "couponType": "discount", "usageLimit": 543535436, "validUntil": "2025-11-30T00:00:00.000Z", "description": "fffffffffffffffffffffff", "discountType": "percentage", "discountValue": "5.00", "rejectionReason": null}}	2025-11-28 10:27:09.976331
45522aec-c903-4984-a3f8-3321f30d9aa3	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	system_admin	delete	coupon	1f3b7d78-eca0-461f-9cee-ad01d126c26c	\N	Deleted platform coupon	\N	2025-11-28 11:07:26.826027
002bc963-78a5-40e8-9928-2d798057d8e0	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	system_admin	create	coupon	405c97d1-2786-44ad-843b-e2e4cc73d1e4	fffffffffff	Created platform coupon: FFFFF	{"coupon": {"id": "405c97d1-2786-44ad-843b-e2e4cc73d1e4", "code": "FFFFF", "scope": "product", "title": "fffffffffff", "issuer": "admin", "status": "approved", "vendorId": "cbdb538b-520c-4f9e-9ce3-52b8dec4ade4", "cashValue": null, "createdAt": "2025-11-28T11:07:42.783Z", "productId": "87fd157a-acec-488b-bf0b-196c00b8ba20", "updatedAt": "2025-11-28T11:07:42.783Z", "usedCount": 0, "validFrom": "2025-11-28T00:00:00.000Z", "approvedBy": null, "couponType": "discount", "usageLimit": 543535436, "validUntil": "2025-11-30T00:00:00.000Z", "description": "fffffffffffffffffffffff", "discountType": "percentage", "discountValue": "5.00", "rejectionReason": null}}	2025-11-28 11:07:42.852984
23813d6c-b145-4d8e-856c-5808e328b9a0	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	system_admin	reset_password	user	31a6fecf-9ef1-47f8-9d2f-a8fb4300b002	usm	Reset password for user: usm	{"userId": "31a6fecf-9ef1-47f8-9d2f-a8fb4300b002"}	2025-11-28 11:09:37.824998
3fe14572-59a6-4bf7-a0b9-10190d1645ae	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	system_admin	reset_password	user	31a6fecf-9ef1-47f8-9d2f-a8fb4300b002	usm	Reset password for user: usm	{"userId": "31a6fecf-9ef1-47f8-9d2f-a8fb4300b002"}	2025-11-28 11:09:53.238826
8d9dd19d-b733-440e-99db-ae85acfb16b5	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	system_admin	reset_password	user	ede87102-30fb-41a3-8c9b-a395cac01241	john_support	Reset password for user: john_support	{"userId": "ede87102-30fb-41a3-8c9b-a395cac01241"}	2025-12-01 07:03:25.917564
07bcdf42-4576-41ad-b8e8-dca97b7fc0f4	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	system_admin	reset_password	user	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	Reset password for user: system	{"userId": "3f7ec0b2-bddd-4276-ae29-383b66b94421"}	2025-12-01 08:08:21.887287
68c0755b-3340-4733-a01e-1f93d2e8fcef	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	usman	update	user	9fd72a42-5e9f-4cf1-afb2-500f6b14597d	Usman	Updated user: Usman	{"updates": {"role": "consumer", "status": "active", "username": "Usman", "vendorStatus": "none", "timeDollarBalance": 10, "tdCashSplitPercentage": 50}}	2026-01-08 07:53:19.510249
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, listing_id, user_id, booking_date, duration_minutes, number_of_people, total_price, status, payment_intent_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: business_listings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_listings (id, user_id, business_name, category, description, address, city, postal_code, phone, email, website, operating_hours, cuisine_type, price_range, tags, image_url, is_halal, is_verified, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_items (id, user_id, product_id, quantity, created_at, updated_at) FROM stdin;
e4ba19b4-0ab8-4cb0-90a5-888f0f2524ca	973ca52e-e6bd-404b-bb79-11f764715389	30805d40-ea30-47fa-9ec8-1bd693cd4392	1	2025-10-13 05:24:23.226947	2025-10-13 05:24:23.226947
82f7073d-0dd9-4924-86f4-df9c987f2c67	cc3bf743-010e-489c-aa7b-04f8aa65a905	30805d40-ea30-47fa-9ec8-1bd693cd4392	1	2025-10-14 10:56:30.440992	2025-10-14 10:56:30.440992
637f2c81-4637-4d31-9385-94b553882821	59409a03-884c-40f4-9dc0-e5898b9cc0b4	30805d40-ea30-47fa-9ec8-1bd693cd4392	2	2025-10-15 12:49:18.668417	2025-10-15 12:49:26.313
9fccc38c-f2f8-47ce-bc04-cf5f02802b56	31a6fecf-9ef1-47f8-9d2f-a8fb4300b002	30805d40-ea30-47fa-9ec8-1bd693cd4392	1	2025-10-16 07:32:57.464701	2025-10-16 07:32:57.464701
951d92e5-ef60-462d-bd40-098034024ca7	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	4426421a-1dac-4823-bb3d-e2e1be5881ea	3	2026-01-19 13:12:23.736971	2026-01-19 13:12:23.736971
30bd6378-e417-4c07-a9ac-00e699c2d857	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	87fd157a-acec-488b-bf0b-196c00b8ba20	4	2026-01-09 10:45:30.581069	2026-01-19 13:12:32.803
a6a541cc-b81c-4cbf-9cea-fb23da543a1a	3f7ec0b2-bddd-4276-ae29-383b66b94421	4426421a-1dac-4823-bb3d-e2e1be5881ea	1	2026-01-21 07:45:08.397546	2026-01-21 07:45:08.397546
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, description, icon, created_at) FROM stdin;
9c41d544-9f4e-4468-87a6-e078af942908	School	Educational institutions and schools	graduation-cap	2025-10-03 12:05:12.033538
dcfce550-f202-4aec-819c-93e18e44f05a	Online	Online businesses and services	globe	2025-10-03 12:05:12.033538
16d6cef4-f2d4-4b6f-ba63-ad358b3b99f9	Provision Store	Grocery and provision stores	shopping-cart	2025-10-03 12:05:12.033538
17fc0986-d8a3-4ff6-ac34-5a193ab1c444	Masjid	Mosques and Islamic centers	heart	2025-10-03 12:05:12.033538
2766aa77-265d-4aab-925a-14023f8fc703	Services Store	Service providers and repair shops	wrench	2025-10-03 12:05:12.033538
d873d5e4-92e2-4e6d-baf5-fc01f6ec3310	Virtual Kitchen	Cloud kitchens and delivery-only restaurants	chef-hat	2025-10-03 12:05:12.033538
d900ad21-526b-41fe-9802-854a5f93d1ac	Arts Henna	Henna art and artistic services	palette	2025-10-03 12:05:12.033538
cbbb7112-935f-4554-81c1-011485c2a4e5	Restaurant	Dine-in restaurants and cafes	utensils	2025-10-03 12:05:12.033538
\.


--
-- Data for Name: contact_queries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_queries (id, name, email, subject, message, status, created_at) FROM stdin;
2837d1fd-1839-43ce-909e-727f039ce19f	TEST user	test@gmail.com	TEST user	TEST userTEST userTEST userTEST userTEST userTEST userTEST userTEST userTEST userTEST userTEST userTEST userTEST user	replied	2026-01-21 09:52:42.977385
0ac22c9c-6789-438a-abcb-def1f2c3d7aa	Test User	test@example.com	Test Query	This is a test message from the contact form to verify the Queries feature is working correctly.	replied	2026-01-21 09:50:35.859549
e6bea8c1-665e-44f0-a537-048edb5e5678	Usman	usmanshahid34466@gmail.com	I have an issue	fasfdasdf	read	2026-01-21 10:15:21.979208
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversations (id, customer_id, vendor_id, product_id, product_title, last_message_at, last_message, unread_by_customer, unread_by_vendor, created_at, updated_at) FROM stdin;
e6011945-301a-47c2-9030-525788eb86b7	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	ef24b4c4-502d-42cc-b802-1c90fae0b575	WATER BOTTLE	2025-10-27 10:33:18.865	how can i help you?	0	0	2025-10-27 10:29:27.138765	2025-10-27 10:33:20.517
41f3d05e-fa2b-462d-b964-17ed75118f43	3f7ec0b2-bddd-4276-ae29-383b66b94421	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	87fd157a-acec-488b-bf0b-196c00b8ba20	laptop	2025-11-25 07:50:57.511	yes	0	0	2025-10-24 10:41:20.664126	2025-11-25 07:51:13.459
66f55a99-15cb-495c-9820-8d5ce29b1d30	3f7ec0b2-bddd-4276-ae29-383b66b94421	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	ef24b4c4-502d-42cc-b802-1c90fae0b575	WATER BOTTLE	2025-10-24 10:17:35.763	hi	0	0	2025-10-24 07:55:34.017347	2025-10-24 10:40:44.157
\.


--
-- Data for Name: coupon_usage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coupon_usage (id, coupon_id, user_id, order_id, cash_discount, td_discount, created_at) FROM stdin;
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.coupons (id, vendor_id, code, title, description, discount_type, usage_limit, used_count, valid_from, valid_until, status, created_at, updated_at, product_id, coupon_type, issuer, scope, discount_value, cash_value, approved_by, rejection_reason) FROM stdin;
75f2d4a0-5cb1-4704-b758-1c9f1d7a9cb6	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	US101	mobile phone	jdskcndskcbsalsnclsac	both	\N	0	2025-10-13 00:00:00	2025-10-30 00:00:00	active	2025-10-13 06:40:16.878459	2025-10-13 06:40:16.878459	\N	discount	vendor	vendor	\N	\N	\N	\N
c3d6d567-ec70-4f60-97d6-f8f13c022c73	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	#EMCHUB	Laptops	frtgtgtt	both	\N	1	2025-10-13 00:00:00	2025-10-15 00:00:00	active	2025-10-13 09:52:10.92241	2025-10-13 09:52:10.92241	\N	discount	vendor	vendor	\N	\N	\N	\N
cf244b53-0058-49a5-9b6f-8db12f71396b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	XCON	water bottle	water bottle for WATER BOTTLE	percentage	\N	0	2025-10-17 07:53:29.909875	2025-10-25 00:00:00	approved	2025-10-17 07:53:29.909875	2025-10-17 08:05:56.475	ef24b4c4-502d-42cc-b802-1c90fae0b575	discount	vendor	product	10.00	\N	3f7ec0b2-bddd-4276-ae29-383b66b94421	\N
6c0d54f1-61ab-47f6-9e0a-0437db5855d0	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	HBL	Handfree 	Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree Handfree 	percentage	\N	0	\N	\N	approved	2025-11-26 11:15:32.401816	2025-11-26 11:16:22.105	\N	discount	vendor	platform	5.00	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	\N
405c97d1-2786-44ad-843b-e2e4cc73d1e4	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	FFFFF	fffffffffff	fffffffffffffffffffffff	percentage	543535436	0	2025-11-28 00:00:00	2025-11-30 00:00:00	approved	2025-11-28 11:07:42.783997	2025-11-28 11:07:42.783997	87fd157a-acec-488b-bf0b-196c00b8ba20	discount	admin	product	5.00	\N	\N	\N
\.


--
-- Data for Name: event_registrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_registrations (id, event_id, vendor_id, user_id, full_name, email, phone, notes, status, created_at, updated_at, td_rewarded, td_reward_amount, td_rewarded_at) FROM stdin;
e524408a-05ae-470d-b716-25d1c1aeb47f	f8432326-71f8-4934-8c32-b73365fb7cbe	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	ede87102-30fb-41a3-8c9b-a395cac01241	Usman Shahid	admin@usman.com	+923446685588		confirmed	2025-10-30 08:06:52.407396	2025-10-30 08:06:52.407396	f	\N	\N
077bc280-fa97-4e98-aa09-1761b945f370	f8432326-71f8-4934-8c32-b73365fb7cbe	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	Usman Shahid	info@usman.com	+923446685588		confirmed	2025-10-30 09:27:46.447627	2025-10-30 09:27:46.447627	f	\N	\N
2907d730-6b4e-4c83-88c1-c8b60fcc5271	cc53376b-0fa8-487a-9657-6c52331a30e1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	Usman	usmanshahid34466@gmail.com	+852 9876 5432		confirmed	2025-11-26 10:27:29.533262	2025-11-26 10:27:29.533262	f	\N	\N
2b3a69c9-f55d-4a8c-8729-99b6f459ab62	14a1e8f2-44eb-421d-b87a-13c425911ff0	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	Usman	usmanshahid34466@gmail.com	+852 9876 5432	lewhfoewjojrev	confirmed	2025-12-26 13:53:15.862015	2025-12-26 13:53:15.862015	f	\N	\N
0d426d85-ada1-4a55-99e6-efddc4df4ad7	f8432326-71f8-4934-8c32-b73365fb7cbe	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	Test	test@gmail.com	3447728877		confirmed	2025-12-29 06:14:18.703298	2025-12-29 06:14:18.703298	f	\N	\N
33ffa85f-5101-4b98-bb1f-e91fdb252869	cc53376b-0fa8-487a-9657-6c52331a30e1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	\N	Usman Shahid	admin@dc.com	+923446685588		confirmed	2025-12-29 06:29:35.626725	2025-12-29 06:29:35.626725	f	\N	\N
32c563e8-f4b0-47af-b574-0ad2494a3411	cc53376b-0fa8-487a-9657-6c52331a30e1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	\N	Usman Shahid	admin@topicsmerge.com	+923446685588		confirmed	2025-12-29 06:55:06.936529	2025-12-29 06:55:06.936529	f	\N	\N
a4b21e8c-634d-4d9b-8e0c-18d00f752e46	cc53376b-0fa8-487a-9657-6c52331a30e1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	\N	Usman S	usman23rgc@gmail.com	3987493274932	kjdgfiewfire v	confirmed	2025-12-29 07:17:46.57416	2025-12-29 07:17:46.57416	f	\N	\N
a462f2b5-c8cf-4235-9686-9af4848cf30f	cc53376b-0fa8-487a-9657-6c52331a30e1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	system@gmail.com	8320297434	system	confirmed	2025-12-29 07:22:05.561036	2025-12-29 07:22:05.561036	f	\N	\N
257f87b6-a6a1-4519-a9c5-f3b1917e3ef5	3d65c8d6-4a29-468e-bb0e-97525cc55f26	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	Muhammad Usman	admin@usman.com	+923446685588		confirmed	2025-12-29 07:29:56.766188	2025-12-29 07:29:56.766188	f	\N	\N
88d96e86-d5fe-433b-8554-1bdd2848d9f2	6e3a16d8-ee8d-4d41-a012-b0ae18e97333	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	test emc	admin@testemc.com	+923446685588		checked_in	2025-12-29 07:40:36.251767	2025-12-29 07:42:16.464	f	\N	\N
974fcf31-c636-4f32-913f-bfec4aeac791	3fdfe925-b41d-492d-92b3-240a19c195a1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	Usman Shahid testing	admin@usmantesting.com	36323636	iuwhf9ewhdewyfewhf	checked_in	2025-12-29 07:46:24.10354	2025-12-29 07:47:34.088	f	\N	\N
290ed671-d405-41a4-94fa-68022f93a51e	cc53376b-0fa8-487a-9657-6c52331a30e1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	\N	Usman Shahid	mrusmanshahidd@gmail.com	03123456789		confirmed	2026-01-08 07:08:34.388507	2026-01-08 07:08:34.388507	f	\N	\N
1774f3a2-8769-4233-b911-b1d4fe40b274	cc53376b-0fa8-487a-9657-6c52331a30e1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	9fd72a42-5e9f-4cf1-afb2-500f6b14597d	Usman Shahid	admin@usman.com	+923446685588		checked_in	2026-01-08 07:48:40.292051	2026-01-08 07:50:01.785	f	\N	\N
\.


--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.listings (id, user_id, type, title, description, category_id, address, city, postal_code, latitude, longitude, is_online_only, phone, email, website, images, operating_hours, tags, sku, price, inventory, duration_minutes, event_date, event_end_date, capacity, attendee_count, event_price, is_active, is_verified, created_at, updated_at, payment_methods, moderation_status, moderation_notes, moderated_by, moderated_at, status, deleted_at, custom_category, payment_type, cash_percentage, timedollar_percentage, td_price, td_eligible, td_value, event_td_price, event_hours, previous_values) FROM stdin;
74cff382-48eb-42d8-a371-c8585947c7e8	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Project EMblaze	At EM-Blaze, we are determined to promote racial inclusion, integration & raise cultural awareness in Hong Kong (HK) by remodeling multicultural activities. EM-Blaze is a unique platform for ethnic minorities (EMs) or underrepresented groups in Hong Kong to make their ideas & voices heard and empower them by equipping them with multiple resources.	9c41d544-9f4e-4468-87a6-e078af942908	Hong Kong SAR, China			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:44.606043	2025-10-09 09:48:44.606043	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b3e1362c-ed82-4aad-bbb1-6c656b09e492	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Curry and Kebab Indian Restaurant		9c41d544-9f4e-4468-87a6-e078af942908	24 Wo Yi Hop Rd, Shek Lei			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:44.673851	2025-10-09 09:48:44.673851	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
62f30001-2ba1-4858-a47c-f4faef03a530	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	3 Hani Entreprises Limited	Limited healthy Halal food choices in Hong Kong has been the key driving force behind 3 Hani Enterprises Limited.  Company founders are Muslims who understand the increasing demand yet to be satisfied. 3 Hani envisages to bring to local Muslims and tourists a HALAL PARADISE, promote HALAL IS FOR EVERYONE - an alternative food safety standard and establish omni-channel distribution in Hong Kong, Macau and China.	9c41d544-9f4e-4468-87a6-e078af942908	Unit 2603, 26th Floor, Block 1, Tak Fung Industrial Centre, 168 Texaco Road, Tsuen Wan, Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:44.740376	2025-10-09 09:48:44.740376	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
03cb0a50-379a-4dd2-8e76-9846f2e15b5d	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	AZIZA		9c41d544-9f4e-4468-87a6-e078af942908	Shop 1B, G/F, Upton Tower, 345 Des Voeux Rd W, Sai Ying Pun			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:44.80671	2025-10-09 09:48:44.80671	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
50809fe1-5484-4d8a-8b48-3f28de06d7a1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Kowloon Mosque	Kowloon Masjid and Islamic Centre or Kowloon Mosque is one of five main mosques in Hong Kong. Located in Kowloon, in the Tsim Sha Tsui area at the intersection of Nathan Road and Haiphong Road, beside Kowloon Park, this mosque is currently the largest in Hong Kong. The mosque holds five prayers daily and is capable of accommodating up to 3,500 people.	9c41d544-9f4e-4468-87a6-e078af942908	105 Nathan Rd, Tsim Sha Tsui, Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:44.875152	2025-10-09 09:48:44.875152	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
02aa6688-6cf8-4249-89f0-73efbd9e537c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tai Wai KNM Islamic Education Centre		9c41d544-9f4e-4468-87a6-e078af942908	G/F, No. 235 Tin Sum Village, Near Tin Sum Street Car Park, Tai Wai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:44.941745	2025-10-09 09:48:44.941745	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
bead6dc2-6680-4309-9ffb-1617896d938a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Choi Hung KNM Islamic Education Centre		9c41d544-9f4e-4468-87a6-e078af942908	G/F, Block 1, Kai Tak Mansion, 53 Kwun Tong Road			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:45.008448	2025-10-09 09:48:45.008448	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b2ccc5eb-1a82-4c47-a1bc-97cd8993cdba	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tuen Mun KNM Islamic Education Center		9c41d544-9f4e-4468-87a6-e078af942908	G/F, No. 33 San Hui Path, San Hui Tsuen, Tuen Mun			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:45.076093	2025-10-09 09:48:45.076093	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
fe9f3e5e-8f3d-4df8-9acc-bcc81aeab796	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Masjid Ammar and Osman Ramju Sadick Islamic Centre	The old Muslim Cemetery in Hong Kong was located at 7, Seymore Street, (near the Jewish Synagogue) where only 5 or 6 burials took place before it was resumed. A new cemetery was then provided in Happy Valley where the earliest grave dates back to 1828. A small Mosque was constructed adjoining the cemetery mainly to hold Janazah Prayers. With the increase in Muslim population on Hong Kong Island, Muslims living close by began to use the Mosque for daily prayers as well. A new and larger Mosque was constructed after World War II which remained in use until December 1978 when it was resumed by Government to construct approach roads for the Aberdeen Tunnel.	9c41d544-9f4e-4468-87a6-e078af942908	40 Oi Kwan Rd, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:45.142503	2025-10-09 09:48:45.142503	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
32e72284-03bd-44de-8ac7-71e5cbfdb5d5	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Islamic Primary School	SUBJECTS & MEDIUM OF INSTRUCTION	9c41d544-9f4e-4468-87a6-e078af942908	友愛邨, 2號 Oi Tak Ln, Tuen Mun			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:45.208782	2025-10-09 09:48:45.208782	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
83ac5405-ca37-4e6e-97f6-72be37f49931	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	MPC Collections	South Asian style dress	9c41d544-9f4e-4468-87a6-e078af942908	FLAT-D, 3/F,   133 Temple street,  Jordan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:45.275436	2025-10-09 09:48:45.275436	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
122c0613-6d3a-43e2-9652-e5e6e0f6134f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tung Chung Madrassa		9c41d544-9f4e-4468-87a6-e078af942908	G/F, 6 Ma Wan Village, Tung Chung, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:45.342081	2025-10-09 09:48:45.342081	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
023687b2-a10e-425c-a1f7-17be759eb9fa	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Minhajul Quran Madrassa, Kwai Chung		9c41d544-9f4e-4468-87a6-e078af942908	Hoover Court 2nd Mez., 1/ F, 33 Tai Pak Tin St., Kwai Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:45.408282	2025-10-09 09:48:45.408282	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d9a2707f-06bb-418b-a0f7-d690d28b68c9	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	EdSquare	**EdSquare Coding&STEM **offering online coding classes during Early Summer  Holiday for Kids (age 7-14)	9c41d544-9f4e-4468-87a6-e078af942908	UG Waterside Plaza Shopping Centre, 38 Wing Shun St, Tsuen Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:45.474928	2025-10-09 09:48:45.474928	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
4a97e6fb-7f5f-4fc4-a8a9-6108879bde4b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ease Education Limited	Ease Education is a charitable institution or trust of a public character, is exempt from tax under Section 88 of the Inland revenue ordinance.\nOur mission is to promote excellence in academics, personal responsibility, and character development and  thereby seek to maximize the true potential of all of our students as they grow to become responsible citizens.	9c41d544-9f4e-4468-87a6-e078af942908	UG 28-37 Waterside Plaza 38 Wing Shun Street Tsuen Wan,  New Territories Hong Kong SAR			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:45.541411	2025-10-09 09:48:45.541411	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b36164aa-76d0-4b33-b464-5938495c54b0	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Micro Bit	Computer Repair Shop	9c41d544-9f4e-4468-87a6-e078af942908	Mirador Mansion, 54-56B Nathan Rd, Tsim Sha Tsui, Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:45.607892	2025-10-09 09:48:45.607892	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
e05183ca-7bfb-4c2c-b3f8-46500f0f72d3	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Indonesian Domestic Workers	Courses for Domestic Workers	9c41d544-9f4e-4468-87a6-e078af942908	Hong Kong SAR, China			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:45.674372	2025-10-09 09:48:45.674372	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
99ccdaec-8781-42fd-b326-d69eed9eb0bc	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Globenet Exchange	Foreign currency exchange	9c41d544-9f4e-4468-87a6-e078af942908	Shop 56, G/F, Chungking Mansions, 36-44 Nathan Road, Tsim Sha Tsui, Kowloon, Hong Kong SAR			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:45.741249	2025-10-09 09:48:45.741249	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
065cb659-f6cb-49d1-9afc-00541ca1cec3	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Alif Complementary Educational Services	On-demand educational courses uniquely suited to the audiences needs such as note-taking, financial literacy, mnemonics and other study skills.	9c41d544-9f4e-4468-87a6-e078af942908	Hong Kong SAR, China			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:45.80804	2025-10-09 09:48:45.80804	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
c4cfe671-cd49-40d8-ac06-bcf21a2bf4f0	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Sham Shui Po KNM Islamic Education Center		9c41d544-9f4e-4468-87a6-e078af942908	1/F, 2/F, 320-322 Tung Chau Street, Sham Shui Po			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:45.874383	2025-10-09 09:48:45.874383	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
bb4c67d7-a433-40ac-aba1-0c4af86b0cac	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Kwun Tong KNM Islamic Education Center		9c41d544-9f4e-4468-87a6-e078af942908	M/F, 52 Tung Ming Street, Kwun Tong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:45.940935	2025-10-09 09:48:45.940935	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
dffc0afb-64bb-4ecb-aa61-f33a5baa6e73	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tseung Kwan O KNM Islamic Education Centre		9c41d544-9f4e-4468-87a6-e078af942908	6/F, Choi Ming Shopping Plaza, Choi Ming Street, Tseung Kwan O			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:46.006742	2025-10-09 09:48:46.006742	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
23e14713-3ed6-4062-a81a-e1cccf8fb838	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Kwai Chung KNM Islamic Education Center		9c41d544-9f4e-4468-87a6-e078af942908	M/F., Ming Yin Building, 4 Ping Lai Path, Kwai Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:46.075335	2025-10-09 09:48:46.075335	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d96bfbd9-def0-41e0-bb3d-6c3ddf9177f1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Kam Tin KNM Islamic Education Centre		9c41d544-9f4e-4468-87a6-e078af942908	No 160E, Kat Hing Wai, Kam Tin, Yuen Long			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:46.141799	2025-10-09 09:48:46.141799	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0b8de33c-0e2c-4e0d-b868-845c1c219ef1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer's Kebab & Pizzeria		9c41d544-9f4e-4468-87a6-e078af942908	G/F, 5 Lan Kwai Fong, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:46.207908	2025-10-09 09:48:46.207908	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
3634ad3c-0938-4add-9e77-aa5fb24d95cc	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	mehndilicious_	📍🇵🇰|🇭🇰\n~💯Organic cones	9c41d544-9f4e-4468-87a6-e078af942908	Quarry Bay, Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:46.275177	2025-10-09 09:48:46.275177	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
513ca333-147b-4270-b2b6-9f215d9c6c2d	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassa Tul Madinah		9c41d544-9f4e-4468-87a6-e078af942908	2/F, Unit E, 19 Shing Fong Street, King Po Mansion ,Kwai Fong, Kwai Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:46.341776	2025-10-09 09:48:46.341776	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
3716e615-d9c1-4de7-b618-33f24a300f1b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassa Faizan-e-Madinah		9c41d544-9f4e-4468-87a6-e078af942908	M/F, 75 Ho Pui St., Tsuen Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:46.409252	2025-10-09 09:48:46.409252	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
c78dfe7e-0492-492b-9e64-3e5d8db13c76	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassa Kanz-ul-Eman		9c41d544-9f4e-4468-87a6-e078af942908	DD130 Lot No. 559, Kowpan Fu Tai, Tuen Mun			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:46.476028	2025-10-09 09:48:46.476028	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
71b41721-82da-4b75-900f-0980e7ec0664	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassa Fazian-e-Aulia Allah (Ping Shan)		9c41d544-9f4e-4468-87a6-e078af942908	Shop C&D, G/F Lok Kui Lau, No. 2 Ping Ha Rd, Yuen Long, (Ping Shan)			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:46.542543	2025-10-09 09:48:46.542543	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
46d9a61b-6e78-49bb-a031-54bed02b276d	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassa Fazian-e-Aulia Allah (Tung Chung)		9c41d544-9f4e-4468-87a6-e078af942908	G/F, 73 Ma Wan Chung, Tung Chung, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:46.608793	2025-10-09 09:48:46.608793	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8bfb360f-1c29-45a3-b8f7-c99d53c241fa	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassa Faizan-e-Sahabah		9c41d544-9f4e-4468-87a6-e078af942908	G/F, Yiu Shing House, Tin Yiu, Tin Shui Wai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:46.674702	2025-10-09 09:48:46.674702	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
bb39469c-3fe7-4f48-9697-ff0ff9215b7e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassa Faizan-e-Attar		9c41d544-9f4e-4468-87a6-e078af942908	1/F, 28 Tung Sing Road, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:46.741756	2025-10-09 09:48:46.741756	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
e5bcf38f-567a-4472-8fe3-3046f6f0641f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassa Faizan-e-Ahlesunnat		9c41d544-9f4e-4468-87a6-e078af942908	Flat B2, 11/F, Mirador Mansion, 54-64B Nathan Road, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:46.807874	2025-10-09 09:48:46.807874	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
5000a5c4-23af-4e85-a65a-a387b1a90afd	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Mardrassa Khari Shareef		9c41d544-9f4e-4468-87a6-e078af942908	Shop 2, G/F, Ting Fu House, 105-119 Ting Fu Street, Ngau Tau Kok			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:46.873406	2025-10-09 09:48:46.873406	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
78d67c2c-e292-4325-98a0-b244ea5ffc95	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Masjid-e-Ibrahim		9c41d544-9f4e-4468-87a6-e078af942908	Hoi Wang Road, Yau Ma Tei			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:46.939703	2025-10-09 09:48:46.939703	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
941e3251-2826-4992-b4f6-22f3af8726bb	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	To Kwa Wan Madrasa		9c41d544-9f4e-4468-87a6-e078af942908	1/F, 11 Lun Cheung St., To Kwa Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:47.005788	2025-10-09 09:48:47.005788	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d7ba5618-f1ac-41da-ac23-787792bbdd8a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Minhajul Quran Madrassa, San Po Kong		9c41d544-9f4e-4468-87a6-e078af942908	1/F 31-49 Yin Hing Street, San Po Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:47.071508	2025-10-09 09:48:47.071508	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
35fa3aeb-f2c3-4257-9478-57457bff3d72	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Minhajul Quran Madrassa, Tai Wai		9c41d544-9f4e-4468-87a6-e078af942908	No. 18-M, G/F, 4th Lane, Tai Wai Village, Sha Tin			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:47.13609	2025-10-09 09:48:47.13609	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
2d65eda8-5c69-4fc2-8727-abae063fc06c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Minhajul Quran Madrassa, Tsing Yi		9c41d544-9f4e-4468-87a6-e078af942908	G/F, 19 Chung Mei Lo Uk Village, Tsing Yi			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:47.204166	2025-10-09 09:48:47.204166	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
46cda6d2-7981-4238-93bd-3ede7f6addf5	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Markaz Tawheed was Sunnah		9c41d544-9f4e-4468-87a6-e078af942908	M/F, Kwai Lok Building, 75 Wing Fong Road, Kwai Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:47.26912	2025-10-09 09:48:47.26912	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
f96611a4-6d12-4f1e-ab2a-29b7f9678afb	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Islamic Centre for Community Service (Tin Shui Wai)		9c41d544-9f4e-4468-87a6-e078af942908	G/F., Wing 2, Yan Ying House, Tin Yan Estate, Tin Shui Wai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:47.334767	2025-10-09 09:48:47.334767	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
2631ee14-8a3c-4b2a-8dc8-4257df0be151	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Yuen Long Madrassa		9c41d544-9f4e-4468-87a6-e078af942908	1/F.,No.44 Tai Tong Road, Yuen Long			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:47.400402	2025-10-09 09:48:47.400402	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0e7d79f8-57bb-4176-b12b-4e44040f013c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Idara Al-Mustafa Hong Kong Madrassa		9c41d544-9f4e-4468-87a6-e078af942908	3/F, CF-03, Cheung Fat Factory Building, Cheung Sha Wan (MTR Exit C1)			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:47.466948	2025-10-09 09:48:47.466948	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
a60b6dde-f0c7-443b-bfd4-61f205dcc7af	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Islamic Centre Muhammadia Ghosia		9c41d544-9f4e-4468-87a6-e078af942908	Flat A/B, 2/F, Chuk Bun Building, No 1 Tat Fai Path, Yuen Long			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:47.53674	2025-10-09 09:48:47.53674	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
fd4150e5-77e7-49a0-9c0f-982c0d4f1d78	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Haji Omar Ramju Care Home (UMAH) Madrassa		9c41d544-9f4e-4468-87a6-e078af942908	G/F, Oi Yee Hse, High Block , Yau Oi Estate, Tuen Mun			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:47.602855	2025-10-09 09:48:47.602855	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
1765fd5b-532a-4383-b80b-fe4547f162f7	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Al-Suffah Madrasah H.K.		9c41d544-9f4e-4468-87a6-e078af942908	G/F, 30 Fung Shue Wo Village, Tsing Yi			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:47.668711	2025-10-09 09:48:47.668711	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
26ca393e-444e-4a9c-94a1-68df7560fa17	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassa Tul Emaan		9c41d544-9f4e-4468-87a6-e078af942908	M/F, On Cheong Building, 44 Mei Kwong Street, To Kwa Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:47.734571	2025-10-09 09:48:47.734571	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
cc7f0276-acc6-4844-a21a-bcb07105930e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassa Taleem-ul-Quran		9c41d544-9f4e-4468-87a6-e078af942908	11 Ha Ling Pei, Tung Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:47.800545	2025-10-09 09:48:47.800545	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
5826afee-b699-4cab-9b66-e4cff312020e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassa Noor-Ul-Quran (Kam Tin)		9c41d544-9f4e-4468-87a6-e078af942908	Pat Heung, Kam Tin, Yuen Long			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:47.887834	2025-10-09 09:48:47.887834	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
dfb2118d-d31f-4139-8395-f8315d712f86	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrasah-tul-Hira		9c41d544-9f4e-4468-87a6-e078af942908	Flat B, 1/Fl, Cheong Fok House, 97-101 Apliu Street, Sham Shui Po			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:47.954786	2025-10-09 09:48:47.954786	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
112f4c05-1d8a-4290-883b-69892ff26b00	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassa Idara Noor-ul-Islam HK		9c41d544-9f4e-4468-87a6-e078af942908	1/F, 177 Fuk Wa Street, Sham Shui Po			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:48.025842	2025-10-09 09:48:48.025842	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
926b37ab-87e2-4be5-9a0f-cff867b50c45	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassa AMSUA Educational Foundation Ltd.		9c41d544-9f4e-4468-87a6-e078af942908	Unit B, DD106, Lot 152RP, Yuen Kong San Tsuen, Pat Heung, Yuen Long			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:48.092209	2025-10-09 09:48:48.092209	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
19a87b67-dedc-4cf8-bd19-1719c8e72e4b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Jordan Islamic Cultural Centre		9c41d544-9f4e-4468-87a6-e078af942908	Unit C, 3/F, Tai Chi Court,  132-134 Austin Road, Jordan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:48.159345	2025-10-09 09:48:48.159345	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ab8e4c60-cc96-4890-901e-3fe30a8f0128	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Shau Kei Wan Islamic Cultural Centre		9c41d544-9f4e-4468-87a6-e078af942908	2/F, Sun Sing Building, 290 Shau Kei Wan Road			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:48.226245	2025-10-09 09:48:48.226245	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
4c843eec-afa1-44d6-9d0d-288be72a18e5	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	The Chinese Muslim Cultural & Fraternal Association		9c41d544-9f4e-4468-87a6-e078af942908	7 Chan Tong Lane, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:48.293371	2025-10-09 09:48:48.293371	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8fd7e033-e5a3-4d37-a636-99bbd0a00614	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tseun Wan Madrassa		9c41d544-9f4e-4468-87a6-e078af942908	2/F, 107, Hoi Pa Road, Tsuen Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:48.359253	2025-10-09 09:48:48.359253	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
1d91f9b4-4994-4ed1-81e5-c289c2c98e49	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Islamic Academy Hong Kong Limited Islamic Centre		9c41d544-9f4e-4468-87a6-e078af942908	Flat B, 1/F, Hung Yip Building, 253-263 Castle Peak Road, Yuen Long			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:48.427767	2025-10-09 09:48:48.427767	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b20596aa-b6d6-41b0-9c49-3cac3b8e8686	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassa Taleemul Furqan Islamic Union		9c41d544-9f4e-4468-87a6-e078af942908	Flat D 4, 3/F, Oceanic Mansion, 1026 King's Road, Quarry Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:48.495828	2025-10-09 09:48:48.495828	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
f41a831b-ddb9-4c5e-ae2a-aba84f21e23f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tseung Kwan O Madrassa		9c41d544-9f4e-4468-87a6-e078af942908	Flat 105, 1/F, Choi Fu House, Choi Ming Court, Tseung Kwan O			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:48.563939	2025-10-09 09:48:48.563939	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
9b1845a4-c5e6-4442-9ee7-020d1cfc6cb5	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Aberdeen Islamic Educational Centre		9c41d544-9f4e-4468-87a6-e078af942908	2/F, On Tai Building, 1 – 3 Wu Nam Street, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:48.631104	2025-10-09 09:48:48.631104	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
5f2c4656-ee91-4289-9418-0f2a75fb6754	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tin Shui Wai Madrasa		9c41d544-9f4e-4468-87a6-e078af942908	Rm 1, No. 249 Sheung Cheng Wai, Ping Shan, Yuen Long			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:48.699409	2025-10-09 09:48:48.699409	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
95684450-90d6-4b18-a45b-05081d75fab3	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Majlis Dzikir Ilham		9c41d544-9f4e-4468-87a6-e078af942908	8/F, Rita House, 125 Leighton Road, Causeway Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:48.76569	2025-10-09 09:48:48.76569	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
4947d56a-d3e6-4c8a-b1c1-f9a7ca8c539b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Majelis Rasulullah SAW		9c41d544-9f4e-4468-87a6-e078af942908	G/F, 23 Ching Chung Wai, Tuen Mun			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:48.832125	2025-10-09 09:48:48.832125	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
7a7aede0-b54f-4230-bf2f-e8359c08066a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassa Tartil-Ul-Quran		9c41d544-9f4e-4468-87a6-e078af942908	Flat C, 5/F, 96 Broadway, Mei Foo Sung Cheuen , Lai Chi Kok			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:48.899495	2025-10-09 09:48:48.899495	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8392d52c-d6d0-4b47-ab05-122737d9c4fc	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madarassa Islamiya		9c41d544-9f4e-4468-87a6-e078af942908	Flat 8, 1/F, Block 3, Kai Tak Mansion, 55 Kwun Tong Road, Kowloon Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:48.965477	2025-10-09 09:48:48.965477	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
a0024dc5-9852-483a-9183-326df4215ce4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Hussaini House Imambargah		9c41d544-9f4e-4468-87a6-e078af942908	3/F, Hussaini House, 69 Wyndham Street, Central, Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:49.031563	2025-10-09 09:48:49.031563	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
1989db2b-da37-413d-86ed-f8315797d992	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	HKIA - Prayer Room 1		9c41d544-9f4e-4468-87a6-e078af942908	Level 7, Check-in Hall, near Aisle A, Terminal 1 (non-restricted area)			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:49.097757	2025-10-09 09:48:49.097757	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
81c974f7-6038-4868-a541-fcef33ecb04e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	HKIA - Prayer Room 2		9c41d544-9f4e-4468-87a6-e078af942908	Level 5, Check-in Hall, near Aisle N, Terminal 2 (non-restricted area)			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:49.164695	2025-10-09 09:48:49.164695	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
6a553e6e-4506-4788-8aea-dc9460c130cf	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	HKIA - Prayer Room 3		9c41d544-9f4e-4468-87a6-e078af942908	Level 6, near Gate 42, Terminal 1 (restricted area)			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:49.232028	2025-10-09 09:48:49.232028	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
bb86478f-61c9-4df4-8423-50b71c42c94e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	HKIA - Prayer Room 4		9c41d544-9f4e-4468-87a6-e078af942908	Level 5, near Gate 501, North Satellite Concourse (restricted area)			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:49.298496	2025-10-09 09:48:49.298496	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ab04fae3-386e-4444-87b6-7b546cf5e74e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	HKIA - Prayer Room 5		9c41d544-9f4e-4468-87a6-e078af942908	Level 6, near Gate 211, Midfield Concourse (restricted area)			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:49.366964	2025-10-09 09:48:49.366964	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
da542185-08b7-4bb9-afa0-f8d84b3da1be	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Disneyland - Prayer Room		9c41d544-9f4e-4468-87a6-e078af942908	Near the restroom of the Explorer's Club restaurant, Mystic Point			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:49.434802	2025-10-09 09:48:49.434802	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
2a024edc-1389-4d4c-8957-1996001fb096	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Consulate of The Republic of Indonesia - Prayer Room		9c41d544-9f4e-4468-87a6-e078af942908	4/F, Indonesian Building, 127-129 Leighton Road, Causeway Bay, Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:49.501285	2025-10-09 09:48:49.501285	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
f52490b7-b6b1-4fa2-aa11-3d30ba5be81a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	HKU Prayer Room 1		9c41d544-9f4e-4468-87a6-e078af942908	Rm FSC1A05, 1/F, Fong Shu Chuen Amenities Centre			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:49.567477	2025-10-09 09:48:49.567477	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
c08d071a-3522-4981-a810-c5669ff58a5a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	HKUST Prayer Room		9c41d544-9f4e-4468-87a6-e078af942908	Rm LG5206, LG5/F, Academic Buildinng			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:49.633488	2025-10-09 09:48:49.633488	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ce058765-c451-433a-8006-f9bb3b03cf24	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	CityU Prayer Room		9c41d544-9f4e-4468-87a6-e078af942908	Room 4205, 4/F, Amenities Building			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:49.699832	2025-10-09 09:48:49.699832	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
feb0f5f0-06dd-4c08-8155-828c2d751485	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	PolyU Prayer Room 1		9c41d544-9f4e-4468-87a6-e078af942908	PQ502a (Block P), The Polytechnic University of Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:49.765882	2025-10-09 09:48:49.765882	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
c31fe402-ab97-42b4-a287-5c270109a700	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	PolyU Prayer Room 2		9c41d544-9f4e-4468-87a6-e078af942908	Z302a (Block Z), The Polytechnic University of Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:49.831837	2025-10-09 09:48:49.831837	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
4b5d3a93-e83f-4068-ac54-e406a5f18b25	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Shaffi's Catering Ltd	Shaffi's Catering Limited is a Hong Kong company, incorporated on 2014-02-19, located on Hong Kong. Its company status is Dissolved. Company type is Private company limited by shares.	9c41d544-9f4e-4468-87a6-e078af942908	Fook Tak Building, 234 Castle Peak Rd - Yuen Long, Yuen Long			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:49.89888	2025-10-09 09:48:49.89888	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
f2ffe223-d430-471e-bdde-8c99f489d091	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Hung's Chinese Restaurant	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	Chungking Mansion, 36-44 Nathan Rd, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:49.965565	2025-10-09 09:48:49.965565	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ae0794d3-5276-4845-9c69-8dc936fca6b0	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tagline Modern Indian & Arabic Restaurant and Bar	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	4th Floor, 10 Prat, 10 Prat Ave, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:50.031873	2025-10-09 09:48:50.031873	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
bb24e7e5-2c77-473a-8bcc-d0e5f6a5cc45	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Arabic Cuisine - Casablanca	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	Tsim Sha Tsui, 6/F Ashley Centre, 23-25 Ashley Road, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:50.098855	2025-10-09 09:48:50.098855	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
46a33050-b9a5-494c-99ba-97e5a7bb86d9	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Islam Food	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	Shun King Building, 33-35 Tak Ku Ling Rd, Kowloon City			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:50.167526	2025-10-09 09:48:50.167526	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
bfb12e5b-9632-4a18-8365-ec0b14180dd3	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Mecca Halal Foods	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	地下4 舖, Fung Cheng Building, 340 Un Chau St, Cheung Sha Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:50.233614	2025-10-09 09:48:50.233614	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
7c0fb7c3-6064-4fe2-b88c-2f62ad393c8e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Our Restaurant	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	Witty Commercial Building, Tung Choi St, Mong Kok			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:50.301479	2025-10-09 09:48:50.301479	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
4c60065a-b65c-4ee0-9b85-4254489f1a70	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ah Lung Pakistan Halal Food	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	Jordan, Woosung St, 93號A地下			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:50.367925	2025-10-09 09:48:50.367925	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
608d280a-66f1-4525-a187-8a87b6428f29	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Mr. Kebab Pizza & Pasta (Halal)	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	Tsim Sha Tsui, Haiphong Rd, 51, 54-55號, Hai Phong Mansion House, 2樓206室			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:50.434535	2025-10-09 09:48:50.434535	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
548604d4-e5eb-40bb-a4a0-4b2703f18a09	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	New Istanbul Kebab	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	3 Hart Ave, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:50.501338	2025-10-09 09:48:50.501338	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
f59cdb2d-0d28-4d4c-b7e1-4065f73ff81a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	ISTANBUL KEBAB	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	20-38 Lock Rd, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:50.569904	2025-10-09 09:48:50.569904	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
c49e0040-8601-49d5-85ca-eb507be4e57b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ziafat Arabic restaurant	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	6/F, Harilela Mansion, 81 Nathan Rd, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:50.636258	2025-10-09 09:48:50.636258	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
bcfe07e7-06a5-4c19-b648-d71e9796143f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Warung Malang Club	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	9 Pennington St, Causeway Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:50.702522	2025-10-09 09:48:50.702522	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0fd18adc-882b-46f9-98d4-4c71c96ba86f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Islamic Centre Canteen	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	Wan Chai, Oi Kwan Rd, 40號伊斯蘭中心5樓			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:50.770138	2025-10-09 09:48:50.770138	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8d6063fb-abba-47f3-8ee4-dfaad6b07a60	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Bismillah Kebab House	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	Chungking Mansion, Shop 75, 1/F, Chungking Mansions,, 36-44 Nathan Rd, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:50.844058	2025-10-09 09:48:50.844058	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
5299054c-927d-45e7-98b5-63468e62da55	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Istanbul Kebab Turkish Diner HALAL	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	Tsim Sha Tsui, Shop 1A, G/F, Tsim Sha Tsui Mansion 36-50 Lock Road, T.S.T., Kln			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:50.911853	2025-10-09 09:48:50.911853	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
f3edf187-3517-4f07-b4e4-0785a93fab07	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	OH Food Arabic Halal Cuisine (OH Food 清真阿拉伯料理)	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	Southern Commercial Building, Room A&B, 11/F, 11-13 Luard Rd, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:50.978015	2025-10-09 09:48:50.978015	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
221f5dae-552b-4da2-acd4-a2daf7c86389	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Lahore kebab Garden	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	6f fc02 dragon center, 37k Yen Chow St, Sham Shui Po			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:51.04433	2025-10-09 09:48:51.04433	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b4d64c8e-eb05-45d1-a3be-5a2821d1356a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Old Town White Coffee (*Halal Food Served)	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	Chek Lap Kok			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:51.110797	2025-10-09 09:48:51.110797	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
c70144c9-be96-4849-b0d2-75e979ce19c4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Istanbul Express Turkish Restaurant	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	G/F, 66 Lockhart Rd, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:51.183645	2025-10-09 09:48:51.183645	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
7c1f6706-7e48-41c0-b0c6-3f960913096e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	PizzaBot	Hong Kong Most Loved!\nLocally Crafted Pizza\nThe full stop where you get a hygienic, Fresh, and Most Delicious Pizza in the shortest delivery time.	9c41d544-9f4e-4468-87a6-e078af942908	303 Ferry Street 00852 Kowloon, Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:51.25049	2025-10-09 09:48:51.25049	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
162d8fa9-2b0d-4cf6-a62c-2da9968588ba	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Waqas Provision Store		9c41d544-9f4e-4468-87a6-e078af942908	Ngau Chi Wan Market , Clear Water Bay Rd, MTR exit B, Stall S201, 1/F, Choi Hung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:51.316968	2025-10-09 09:48:51.316968	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
7781f288-d9ac-42f1-bc5d-cfe4c30f4208	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Dhikr&Du’a	We’re a brand that is especially targeted for Muslims in Hong Kong. We sell Dua Cards (prayer cards) that conveniently help our clients get closer to Allah through their prayers and supplication.	9c41d544-9f4e-4468-87a6-e078af942908	nazuhkhk@gmail.com			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:51.383441	2025-10-09 09:48:51.383441	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
7c275802-2441-4acf-86b1-ffe6b3aa093f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Istanbul Turkish Kebabs and Grills		9c41d544-9f4e-4468-87a6-e078af942908	177號 Wan Chai Rd, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:51.449705	2025-10-09 09:48:51.449705	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d4d21717-d248-4fdb-9c21-c72b824b241b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	ALADIN MESS	HALAL FOOD	9c41d544-9f4e-4468-87a6-e078af942908	2nd Floor, 60 Russell St, Causeway Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:51.515603	2025-10-09 09:48:51.515603	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
408da149-9693-4be6-b299-02d63296bc52	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ali Ba Ba Restaurant	Ali Ba Ba Restaurant is a halal-certified restaurant serving Indian style cuisines.	9c41d544-9f4e-4468-87a6-e078af942908	Shop 8, G/F, Kwai Shing East Shopping Centre, 63 Kwai Shing Circuit			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:51.582091	2025-10-09 09:48:51.582091	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d34f15d1-ce6d-48b5-98bf-6572aad79692	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	HKCN LINK Centre	The centre facilitates and accelerates the process of integrating EMs into the community, enable them to access to public services without being discriminated and, enhance young EMs to unfold their potentials and enrich their psychological well-being.	9c41d544-9f4e-4468-87a6-e078af942908	Shop B-E, G/F, Cheong Nin Building, 1013-1033 Kwai Chung Road, Kwai Chung, N.T.			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:51.64864	2025-10-09 09:48:51.64864	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
2714b7a7-dd5f-4536-82cc-c4a26ee2e355	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Karachi Havabite	Karachi Havabite is a Pakistani halal-certified restaurant serving Pakistani and Indian cuisine.	9c41d544-9f4e-4468-87a6-e078af942908	Ground Floor Block B, Ping Lai Path, 456 Castle Peak Rd			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:51.716173	2025-10-09 09:48:51.716173	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
73c0d492-57d7-4035-8634-8dd1726798ee	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Haq Restaurant	Haq Restaurant is a Pakistani halal-certified restaurant.	9c41d544-9f4e-4468-87a6-e078af942908	4-16 Ping Lai Path, Kwai Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:51.781507	2025-10-09 09:48:51.781507	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
83c7f994-3ecf-4cd4-9fd8-b25f08790f90	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Pak Muslim Restaurant (Curry House)	Pak Muslim Curry House is a Pakistani halal-certified restaurant.	9c41d544-9f4e-4468-87a6-e078af942908	6-16 Ping Fu Path, Kwai Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:51.847983	2025-10-09 09:48:51.847983	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
5d436a74-7e3d-444a-9daa-18497c1352a1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Indian garment trading company	Fabrics and clothes	9c41d544-9f4e-4468-87a6-e078af942908	45 Tai Loong St, Shek Lei			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:51.914433	2025-10-09 09:48:51.914433	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
4c5f3026-86db-4a67-8311-f892801513d3	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	HKSKH Lady MacLehose Centre	HKSKH Lady MacLehose Centre has been providing diversified social services to minorities living in Hong Kong, as well as a one-stop service to South Asian residents since 2001.	9c41d544-9f4e-4468-87a6-e078af942908	22 Wo Yi Hop Rd, Shek Lei			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:51.980386	2025-10-09 09:48:51.980386	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
c69a4a5b-7ee0-40a8-952b-c728f1580636	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Hello India Restaurant		9c41d544-9f4e-4468-87a6-e078af942908	1/FL, Hanyee Building, 19-21 Hankow Rd, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:52.047368	2025-10-09 09:48:52.047368	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8e28ac9b-4754-4042-b321-9f9b058e811e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	TREE 少數族裔青年發展中心 Youth Development Centre for Ethnic Minorities	TREE, a part of H.K.S.K.H Lady MacLehose Centre, is a support service centre catering to ethnic minorities needs and development.	9c41d544-9f4e-4468-87a6-e078af942908	Unit B, 1/F 20 Shek Man Path, Kwai Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:52.113383	2025-10-09 09:48:52.113383	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
fb4fe82f-5b26-4b0d-b9a5-e0f9c8731dab	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Chakwal Pizza	Get fresh and tasty home-made pizza	9c41d544-9f4e-4468-87a6-e078af942908	Workshop 2 block B 8/F texaco road industrial center 14-22 wang lung street tsuen wan N.T, Tsuen Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:52.179837	2025-10-09 09:48:52.179837	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
9a32e830-4792-4245-8fe9-e8b4c7cba4a7	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Idara Minhaj ul Qur'an (Madrasa)		9c41d544-9f4e-4468-87a6-e078af942908	33 Tai Pak Tin St, Kwai Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:52.24837	2025-10-09 09:48:52.24837	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
bbdc855b-120b-4770-83a7-c25e384c02ae	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Madrassah Faizan e Raza (Dawat e Islami)		9c41d544-9f4e-4468-87a6-e078af942908	No. 31, Ground Floor, 銀行大廈 Tai Loong St, Kwai Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:52.314771	2025-10-09 09:48:52.314771	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
126b4240-5550-4235-8e2d-287e3ca9c4d8	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Swad Provision Store (Muskan)	Swad Provision Store (Muskan) is a grocery store offering a variety of grocery items from South Asian countries.	9c41d544-9f4e-4468-87a6-e078af942908	Bank Building, 51 Tai Loong St, Kwai Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:52.382254	2025-10-09 09:48:52.382254	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b6bdc106-d098-4d61-8a0e-dac9a4d16b31	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Cape Collision Masjid	Funeral prayers were the primary reason the Chai Wan Mosque was founded on August 4, 1963. Because of its isolated location and lack of Muslims aside from a caretaker, regular prayers were initially not conducted there. But as time went and more Muslim families settled in Chai Wan, they began to perform their regular prayers in the mosque.	9c41d544-9f4e-4468-87a6-e078af942908	Cape Collison Road, Tai Tam Gap			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:52.448355	2025-10-09 09:48:52.448355	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ff9b27e0-4b77-41ea-b2c5-521eed77a60e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Happy Valley Muslim Cemetery	Muslim Cemeteries Management Office\nTel: (+852) 2575 2967\nFax: (+852) 2574 1040\nEmail:	9c41d544-9f4e-4468-87a6-e078af942908	Hau Tak Ln, Happy Valley			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:52.515932	2025-10-09 09:48:52.515932	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0f8048c5-f983-4157-9323-a6e0dbcf2296	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Cape Collison Muslim Cemetery	MUSLIM CEMETERIES MANAGEMENT OFFICE\nHappy Valley Muslim Cemetery,\nHau Tak Lane, Happy Valley, Hong Kong\nTel: (+852) 2575 2967\nFax: (+852) 2574 1040\nEmail:	9c41d544-9f4e-4468-87a6-e078af942908	Tai Tam Gap			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:52.58182	2025-10-09 09:48:52.58182	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
da545c6f-759c-4102-bd18-c0a1e8d36adf	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Basmati		9c41d544-9f4e-4468-87a6-e078af942908	1/F, San Toi Building, 137 Connaught Rd Central, Sheung Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:52.648403	2025-10-09 09:48:52.648403	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
329a7c27-4a78-41a8-91a6-a870e6358561	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Big Pizza		9c41d544-9f4e-4468-87a6-e078af942908	G/F, Shop, 5, 89 Lockhart Rd, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:52.714313	2025-10-09 09:48:52.714313	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0c4802ed-fd23-4a69-ae81-2e3a320cdaf1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Bijas Vegetarian Restaurant		9c41d544-9f4e-4468-87a6-e078af942908	Run Run Shaw Tower, Centennial Campus, Pok Fu Lam Rd, Mid-Levels			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:52.78083	2025-10-09 09:48:52.78083	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
23ac1a7c-c4d1-43d6-9de2-26636b339f7c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Carat Fine Indian Cuisine		9c41d544-9f4e-4468-87a6-e078af942908	Winner Building, Shop A, G/F 29 D Aguilar street, Lan Kwai Fong, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:52.846508	2025-10-09 09:48:52.846508	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
c60be8d9-3856-4970-a82d-9a69159ad971	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Cheeky Buns		9c41d544-9f4e-4468-87a6-e078af942908	G/F, 45-47 Cochrane St, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:52.916944	2025-10-09 09:48:52.916944	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
efc9e038-bef4-4b36-87dd-59de34e306ae	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Flaming Frango		9c41d544-9f4e-4468-87a6-e078af942908	55 G/F, SOHO Central, 55 Elgin St, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:52.983151	2025-10-09 09:48:52.983151	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
f232431f-3cc8-4b92-bfef-41bda2947bc7	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Jashan Celebrating Indian Cuisines		9c41d544-9f4e-4468-87a6-e078af942908	1/f, 金珀苑23 Hollywood Rd, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:53.050052	2025-10-09 09:48:53.050052	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
23f1b782-99a5-4228-917f-a03792eff062	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Jo Jo Indian Cuisine		9c41d544-9f4e-4468-87a6-e078af942908	2/ Floor, 得利樓37-39 Lockhart Rd, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:53.116858	2025-10-09 09:48:53.116858	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
15c9ca5f-7995-441c-9fe5-420c6d6bf616	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	SAFFRON		9c41d544-9f4e-4468-87a6-e078af942908	Shop E, 嘉利大廈53 Graham St, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:53.183149	2025-10-09 09:48:53.183149	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
1f9ab1d3-7bf5-4048-a34f-274f9823357b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Bombay Dreams		9c41d544-9f4e-4468-87a6-e078af942908	1/F, 雲明行 HK Hong Kong Island, 46 Wyndham St, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:53.250301	2025-10-09 09:48:53.250301	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
2a1df46e-6fe0-4e98-97b9-1c353b0744f2	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Warung Malang Club		9c41d544-9f4e-4468-87a6-e078af942908	9 Pennington St, Causeway Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:53.318533	2025-10-09 09:48:53.318533	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
859fffc6-656d-45ff-96e3-54ac5b1a2069	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Halal Care House		9c41d544-9f4e-4468-87a6-e078af942908	Shop C G/F, Lok Kui Building, 2 Ping Ha Rd, Ping Shan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:53.384917	2025-10-09 09:48:53.384917	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
73edf5dc-3e62-45ab-8349-037df3c7f4db	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Olympos Restaurant and Bar		9c41d544-9f4e-4468-87a6-e078af942908	Shop No. 18, G/F, Wetland Seasons Bay, 1 Wetland Park Rd, Tin Shui Wai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:53.451662	2025-10-09 09:48:53.451662	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
dacf5f8b-f854-42a7-a70d-6b3df3e2d106	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Antipasto Express		9c41d544-9f4e-4468-87a6-e078af942908	3號 Hart Ave, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:53.519228	2025-10-09 09:48:53.519228	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0d1bfdc7-6610-48ca-aa88-253c646e1b2f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Carat Fine Indian Cusine		9c41d544-9f4e-4468-87a6-e078af942908	4F, 盈豐商業大廈6-8A Prat Ave, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:53.587271	2025-10-09 09:48:53.587271	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
358bb396-16c5-4449-9e9e-fceb78bb085d	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Curry Leaf Indian Cuisine		9c41d544-9f4e-4468-87a6-e078af942908	G/F & M/F, 茂林商業大廈16-18 Mau Lam St, Jordan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:53.655139	2025-10-09 09:48:53.655139	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0b01f885-8368-429b-b031-5ccfca4f9ff6	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Anjappar Chettinad Indian Restaurant		9c41d544-9f4e-4468-87a6-e078af942908	萬事昌廣場 UNIT 202, 2/F, NO.3 Prat Ave, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:53.721664	2025-10-09 09:48:53.721664	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
6087527b-32cf-47ae-9039-cbfdc5132590	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Gaylord Indian Restaurant		9c41d544-9f4e-4468-87a6-e078af942908	5/F, Prince Tower, 12A Peking Rd, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:53.788468	2025-10-09 09:48:53.788468	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
2ee8277b-d5d0-48d2-bf82-ac5384af58d4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Kebab Bistro		9c41d544-9f4e-4468-87a6-e078af942908	Tsim Sha Tsui, Mody Rd, 16號, Peninsula Apartments, 2號舖			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:53.854603	2025-10-09 09:48:53.854603	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
5c5332b5-36bf-4047-a0f1-5c681c76e96e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	India Restaurant and Bar		9c41d544-9f4e-4468-87a6-e078af942908	6F, 10 Prat Ave, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:53.923915	2025-10-09 09:48:53.923915	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
12bb6888-43a6-4226-8a9d-eec66cabb981	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	M.E.C. Egyptian Halal Food		9c41d544-9f4e-4468-87a6-e078af942908	Kam Yuen Building, Boundary St, Sham Shui Po			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:53.993216	2025-10-09 09:48:53.993216	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
589de83c-dbdb-4a02-9254-32287e8a5f6e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	My Kitchen (Tibetan Fast Food)		9c41d544-9f4e-4468-87a6-e078af942908	180 Shanghai St, Jordan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:54.059962	2025-10-09 09:48:54.059962	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d58cf06e-3e33-44b6-bf5d-753e01e0f918	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Moti Palace Indian Restaurant		9c41d544-9f4e-4468-87a6-e078af942908	Chungking Mansion, Shop No. 96-97, 1/F, Chungking Mansion,, 36-44 Nathan Rd, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:54.126358	2025-10-09 09:48:54.126358	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
1372353b-8242-4f41-9466-b26513a8d795	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	PIZZA BOT		9c41d544-9f4e-4468-87a6-e078af942908	G/F, 303A Ferry Street			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:54.195128	2025-10-09 09:48:54.195128	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
907722df-2441-4883-8d0d-ec826a4db1c8	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Dignity Kitchen	Only Nasi Lemak items are Halal	9c41d544-9f4e-4468-87a6-e078af942908	2/F, 618 Shanghai St, Mong Kok			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:54.262274	2025-10-09 09:48:54.262274	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
17cfd707-8572-469f-9ea6-eb7f8d9f0ad1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tasty Bites - Kebab and Burgers		9c41d544-9f4e-4468-87a6-e078af942908	Shop E, G/F, Cheerful Commercial Building, 116-118 Ma Tau Wai Rd, Hung Hom			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:54.328523	2025-10-09 09:48:54.328523	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
e3af84bf-6faf-41bc-a419-e600ff651de1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tasty Bites Indian Cuisine		9c41d544-9f4e-4468-87a6-e078af942908	3 Tsing Chau St, Hung Hom			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:54.396141	2025-10-09 09:48:54.396141	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b4fb18d9-e480-4ffa-9d78-89d5709c68ce	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Turkeyano		9c41d544-9f4e-4468-87a6-e078af942908	G/F, Honour House, Shop 7A, 375-381 Nathan Rd, Yau Ma Tei			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:54.462608	2025-10-09 09:48:54.462608	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
30c43f32-6012-4221-b46c-2711416a0fc7	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	27 Kebab House		9c41d544-9f4e-4468-87a6-e078af942908	shop 1 G/F supreme house, 2A Hart Ave			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:54.529658	2025-10-09 09:48:54.529658	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
1b060d09-dd60-4dae-81c0-f5331bd3333c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	27 Kebab House		9c41d544-9f4e-4468-87a6-e078af942908	2 Blue Pool Rd, Happy Valley			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:54.598069	2025-10-09 09:48:54.598069	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b9ee5dab-b5a4-48d9-9e42-cd418fd55ef9	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	27 Kebab House		9c41d544-9f4e-4468-87a6-e078af942908	D-E號舖, 蘇豪, 27 Lugard Road, Hollywood Rd, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:54.664435	2025-10-09 09:48:54.664435	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
5e7db44e-87fb-4534-986e-a516807a6537	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	27 Kebab House		9c41d544-9f4e-4468-87a6-e078af942908	25 Mercer St, Sheung Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:54.732838	2025-10-09 09:48:54.732838	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
24df3c83-6406-4c9d-8c23-4193a8516b16	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	27 Kebab House - Turkish and Indian Restaurant		9c41d544-9f4e-4468-87a6-e078af942908	King Tao Building, G/F, Shop D, 94-100 Lockhart Rd, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:54.798642	2025-10-09 09:48:54.798642	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0d332056-4011-4b8e-ba89-57589763684c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	27 Kebab House	Portion of 1A/F, Fong Shu Chuen Amenities Centre, Main Campus, The University of Hong Kong	9c41d544-9f4e-4468-87a6-e078af942908	90 Bonham Rd, Lung Fu Shan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:54.867994	2025-10-09 09:48:54.867994	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
2092d907-c0b5-4cc7-89e3-5b1dcb87e083	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer's Kebab & Pizzeria		9c41d544-9f4e-4468-87a6-e078af942908	G/F, 24 Hollywood Rd, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:54.934142	2025-10-09 09:48:54.934142	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0daa6d87-7f8f-4cec-a135-4f7cdc23ce7a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer's Kebab & Pizzeria		9c41d544-9f4e-4468-87a6-e078af942908	Shop 4, G/F, Wanchai Central Building, 89 Lockhart Rd, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:55.000785	2025-10-09 09:48:55.000785	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b32a51ec-5544-43d7-9dbd-a85ec1033468	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer's Kebab & Pizzeria		9c41d544-9f4e-4468-87a6-e078af942908	G/F, 52 Lockhart Rd, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:55.069024	2025-10-09 09:48:55.069024	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
2753314f-dd06-4e17-ae62-272ba06ed8c1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer's Kebab & Pizzeria		9c41d544-9f4e-4468-87a6-e078af942908	Shop A, G/F, Winfield Commercial Building, 6-8 Prat Avenue, Tsim Sha Tsui,, Hong, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:55.196075	2025-10-09 09:48:55.196075	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
caeaf793-5d24-4a90-a4df-f79928055f0c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer's Kebab & Pizzeria		9c41d544-9f4e-4468-87a6-e078af942908	Indoor 5380 Cafe, R5013, 5/F, Amenities Bldg, City University of Hong Kong, Tat Chee Ave, Kowloon Tong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:55.264347	2025-10-09 09:48:55.264347	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
1fd9c69a-a130-47f4-8fe4-c8945c5687f4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer's Kebab & Pizzeria		9c41d544-9f4e-4468-87a6-e078af942908	Shop A, G/F, Block 2, Hung Hom Gardens Block 2, 3 Tsing Chau St, Hung Hom			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:55.330796	2025-10-09 09:48:55.330796	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0e94f17b-1987-45e0-a389-879c94ca77bd	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer's Kebab & Pizzeria		9c41d544-9f4e-4468-87a6-e078af942908	G Hong Kong University Of Science And Technology Staff Quarters House G044, Clear Water Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:55.397533	2025-10-09 09:48:55.397533	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
cb9a488e-4f1d-4443-b988-208e00512f0f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer's Kebab & Pizzeria		9c41d544-9f4e-4468-87a6-e078af942908	G05, The Chinese University of Hong Kong (CUHK), Li Wai Chun Building, Chung Chi Rd, Sha Tin			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:55.464525	2025-10-09 09:48:55.464525	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
286b7ac3-8030-4cdb-95f8-8c1ee92c7c8e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer's Kebab & Pizzeria		9c41d544-9f4e-4468-87a6-e078af942908	Shop 9A, Ngong Ping Themed Village Ngong Ping, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:55.532113	2025-10-09 09:48:55.532113	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
12c7c92b-f058-417a-8cfb-8260e4761845	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer's Kebab & Pizzeria		9c41d544-9f4e-4468-87a6-e078af942908	Shop 102A, Discovery Bay Rd, Discovery Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:55.61494	2025-10-09 09:48:55.61494	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d68c41b5-e6fb-413c-9833-8f2d4e2d25a5	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer's Kebab & Pizzeria		9c41d544-9f4e-4468-87a6-e078af942908	Shop 21, G/F, Papillons Square, 21 Tong Chun St, Tseung Kwan O			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:55.681795	2025-10-09 09:48:55.681795	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
73b6982d-5a15-4e00-b244-da6bb24cc7db	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer's Kebab & Pizzeria		9c41d544-9f4e-4468-87a6-e078af942908	Shop G11, Sheraton Hotel, 9 Yi Tung Road. Tung Chung, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:55.748706	2025-10-09 09:48:55.748706	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
e18f83fc-d38e-4fe2-97ce-42018cfe50cd	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Prime Halal Foods	Supplier of Raw Meat, Seafood, Ready to Cook Food, Cooked Food, Dairy Products, Cakes and Beverages	9c41d544-9f4e-4468-87a6-e078af942908	7/F, Sun Fung Centre, Unit 24, Block B, 88 Kwok Shui Rd, Kwai Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:55.815828	2025-10-09 09:48:55.815828	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
f14694b5-0337-400c-941d-3439c75d6ebd	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	W03 Horizon Grill		9c41d544-9f4e-4468-87a6-e078af942908	Ocean Park, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:55.88361	2025-10-09 09:48:55.88361	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
de93e84c-f468-45a3-99f7-be6f78eea092	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Plaza Premium Lounge	A green hideaway awaits you near Gate 35 at Hong Kong International Airport. Unwind and relax from the concrete jungle and busy terminal. Savour your Airport Moment overlooking a comforting tarmac view. From freshly-made cuisine, shower and rest cabin to relaxation zone, we are here to make your travel effortless with Plaza Premium Lounge, the perfect sanctuary to complement with your travel journey.	9c41d544-9f4e-4468-87a6-e078af942908	Airport, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:55.951814	2025-10-09 09:48:55.951814	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
479f0bee-5938-4726-8a84-63225ccbd495	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Four Points By Sheraton Tung Chung (Tung Chung Kitchen)		9c41d544-9f4e-4468-87a6-e078af942908	9 Yi Tung Rd, Tung Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:56.018163	2025-10-09 09:48:56.018163	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d563ca6f-d0ee-4e81-bb78-f6a4ea41e918	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Nina Hotel Tsuen Wan West – Hotel Restaurants		9c41d544-9f4e-4468-87a6-e078af942908	8 Yeung Uk Road, Tsuen Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:56.083719	2025-10-09 09:48:56.083719	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
6e8bce20-a747-4904-a8f3-0811ed17e8cb	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Nepcha		9c41d544-9f4e-4468-87a6-e078af942908	Shop 1, Multicultural Activity Center (MAC), 572 Canton Road, Yau Ma Tei, Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:56.150373	2025-10-09 09:48:56.150373	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
10fb2cb1-9779-4804-a6ce-5f7b40e52fa4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Global Fine Foods Limited		9c41d544-9f4e-4468-87a6-e078af942908	Wah Sang Industrial Building, 14-18 Wong Chuk Yeung St, Fo Tan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:56.216568	2025-10-09 09:48:56.216568	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0c8d9177-3e0a-4435-beb8-3a3bca7af42b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ocean View Butchery Co Ltd		9c41d544-9f4e-4468-87a6-e078af942908	Unit 605, Kinetic Industrial Centre, 7 Wang Kwong Rd, Kowloon Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:56.28344	2025-10-09 09:48:56.28344	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0dc6346d-2192-4526-9b91-bf576b4d06a6	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	South Stream Market	South Stream Market is a Hong Kong based importer of quality foods and groceries since 1992. We offer a wide variety fresh & quality product including premium meat, seafood, veggies & fruit, and much more. USDA Prime grade steak and wild caught King Salmon are the all-time favourite of our customers. • 3000+ premium ingredients • Jet fresh food imported weekly • Free delivery upon $500 orders • Next day delivery for order before 2pm on weekdays 南川市場自1992年以來一直是香港優質食品和雜貨進口商。我們提供各種新鮮和優質產品，包括肉類，海鮮，蔬菜和水果等。USDA Prime grade (極佳級)牛扒及野生帝王三文魚都是長期深受客戶喜愛。 • 超過3000款各地優質食材 • 每週空運進口新鮮食材 • 買滿$500免費送貨 • 平日2點前落單最快翌日送到"	9c41d544-9f4e-4468-87a6-e078af942908	Flat 202-203, 2/F, Lai Sun Yuen Long Industrial Centre, 27 Wang Yip Street East, Yuen Long			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:56.351713	2025-10-09 09:48:56.351713	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
6e3fe1e1-a66c-4e7a-84f1-fb37fd741ea4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Zaman Halal Company	Free deliveries over $450. If you want home deliveries,Extra toll plaza fees will be added if it is required. Mtr station deliveries are also available over $450 with no extra fees Always,we chat and octopus payment is acceptable	9c41d544-9f4e-4468-87a6-e078af942908	212B Yee Kuk St, Sham Shui Po			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:56.418374	2025-10-09 09:48:56.418374	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0c8e410c-f194-4637-86d1-de784b0d8ec1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Mutton stall		9c41d544-9f4e-4468-87a6-e078af942908	35 Mei Kwong St, To Kwa Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:56.484844	2025-10-09 09:48:56.484844	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
37e02e8d-c30f-4814-b37a-a6b1439fef76	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	AL Madina Trading		9c41d544-9f4e-4468-87a6-e078af942908	Sham Shui Po			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:56.552878	2025-10-09 09:48:56.552878	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
a8b1c228-87d3-4094-8e79-e2ec923c6343	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Al-Falah HK Limited		9c41d544-9f4e-4468-87a6-e078af942908	186-200 Sai Lau Kok Rd, Tsuen Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:56.619461	2025-10-09 09:48:56.619461	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
fb976273-37c1-4025-aeae-a03fe60b3d15	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Iman Halal Food Ltd		9c41d544-9f4e-4468-87a6-e078af942908	Suite B2, 18/F, Gaylord Commercial Building, 114-118 Lockhart Road, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:56.685798	2025-10-09 09:48:56.685798	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8da2a045-8d45-4d10-8244-44385b421e1b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Farzana Trading Limited		9c41d544-9f4e-4468-87a6-e078af942908	Hollywood Plaza, Rm 1408. 14/F, 610 Nathan Rd, Mong Kok			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:56.752491	2025-10-09 09:48:56.752491	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d2251b74-c0c5-435a-ac4f-738cb39454fa	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Café Ocean	Tel : \t3923 2888	9c41d544-9f4e-4468-87a6-e078af942908	Ocean Park, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:56.821307	2025-10-09 09:48:56.821307	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
cba19f8c-ab20-4dce-95ff-75f113494f44	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	M. Iqbal Meat Shop	Fresh Beef Fresh Mutton Fresh Chicken	9c41d544-9f4e-4468-87a6-e078af942908	Haiphong Road, Stall 9, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:56.887407	2025-10-09 09:48:56.887407	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0d0b328e-8472-46f4-8515-4dd702a0ca2c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Kashmir Meat Shop	Tel : 2944 7874	9c41d544-9f4e-4468-87a6-e078af942908	Shop 32-33, G/F, Wui Fat Building, 8 Wang Fat Path, Yuen Long			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:56.955359	2025-10-09 09:48:56.955359	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
c7e54abd-a75d-47b4-93e0-3ae2aadc6878	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Kimchi Korean Fusion	Tel : 9831 2176	9c41d544-9f4e-4468-87a6-e078af942908	65 Pacific Building, Kimberley Road, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:57.022503	2025-10-09 09:48:57.022503	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d1e694f7-ee98-4848-9108-0ac4617e47bb	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ali Baba Restaurant	Phone: 2617 9997	9c41d544-9f4e-4468-87a6-e078af942908	Shop 8. G/F, Kwai Shing East Shopping Centre, 63 Kwai Sing Circuit, Kwai Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:57.089428	2025-10-09 09:48:57.089428	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
19e2ffde-3632-4917-a875-fbd60fdc471d	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	K38 Clown Corner (Halal Section)		9c41d544-9f4e-4468-87a6-e078af942908	Thrill Mountain, The Summit, Ocean Park, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:57.155728	2025-10-09 09:48:57.155728	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
02e89d62-4aea-461c-93be-6e2cbc2d6918	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	LSG Lufthansa Service Hong Kong Ltd	As an in-flight services provider, our job is to make sure that with our help airlines can offer passengers an outstanding onboard experience that is unique and absolutely loyal to their brand values. But there is more to what we do. We want to make the in-flight side of our customers’ operations less complicated by partnering with them and building the best possible solution.	9c41d544-9f4e-4468-87a6-e078af942908	No.6 Catering Road West, Airport, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:57.221533	2025-10-09 09:48:57.221533	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
82d26cdf-6939-4ac6-b4bf-0e4ec59ccf3a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Bakery kitchen of Bayview Restaurant*		9c41d544-9f4e-4468-87a6-e078af942908	1/F, Headland Cable Car Terminal Bldg, Ocean Park, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:57.289073	2025-10-09 09:48:57.289073	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
1e51cd0e-70f8-4638-84e9-3437859cd993	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	K15 Dive into a Float (Kiosk at summit area)		9c41d544-9f4e-4468-87a6-e078af942908	Ocean Park, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:57.370563	2025-10-09 09:48:57.370563	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
dbbbf79b-84e5-45b1-8746-50b35ec9bc02	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Restaurant chain known for its buckets of fried chicken, plus combo meals & sides.	9c41d544-9f4e-4468-87a6-e078af942908	112 Johnston Road, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:57.436614	2025-10-09 09:48:57.436614	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
3c342f66-5a96-4d4f-b97a-aa9b6e1789e7	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	88 Kebab House	We mainly offers kebabs, Roast Meat , Pizza and curry with reasonable prices and good taste which brings everyone back.	9c41d544-9f4e-4468-87a6-e078af942908	G/F shop, 43 High St, Sai Ying Pun			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:57.50311	2025-10-09 09:48:57.50311	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ab32de76-e354-4823-ad7b-073e9ff6ac12	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	India Restaurant & Bar		9c41d544-9f4e-4468-87a6-e078af942908	6/F, 10 Prat Avenue, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:57.572059	2025-10-09 09:48:57.572059	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
98491424-6606-4f79-8286-a7f97866876d	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	BACCO		9c41d544-9f4e-4468-87a6-e078af942908	G/F, 21 Man Nin Street, Sai Kung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:57.639609	2025-10-09 09:48:57.639609	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
cfb14b7f-88d5-4c00-8254-2be7f96d5598	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Café Ocean		9c41d544-9f4e-4468-87a6-e078af942908	Ocean Park, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:57.706098	2025-10-09 09:48:57.706098	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
4815aed0-e2ad-4cad-b850-5dc5f2d79bd8	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Cathay Pacific Catering Services (H.K.) Ltd	CPCS is a 100% subsidiary of Cathay Pacific Airways. In addition to preparing authentic, mouth-watering dishes, CPCS provides the logistics services in delivering food and beverages and other commissary items onto aircraft. Cathay Pacific Catering Services (H.K.) Ltd	9c41d544-9f4e-4468-87a6-e078af942908	11 Catering Road East, Airport, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:57.77211	2025-10-09 09:48:57.77211	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
aed5ba95-9db6-4eb3-9352-8c2cee175946	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Harbour Plaza 8 Degrees – Café 8 Degrees		9c41d544-9f4e-4468-87a6-e078af942908	G/F, Harbour Plaza 8 Degrees, 199 Kowloon City Rd, To Kwa Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:57.839621	2025-10-09 09:48:57.839621	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
6696ea00-3917-4ddf-a21d-36c7a1383852	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Nina Hotel Kowloon East – ION		9c41d544-9f4e-4468-87a6-e078af942908	38 Chong Yip Street, Kwun Tong, Kowloon			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:57.917601	2025-10-09 09:48:57.917601	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0294f6f6-cd5a-4d7a-a88a-8aae1e779d9f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Hong Kong SkyCity Marriot Hotel – SkyCity Bistro	This all-day dining and buffet restaurant showcases popular international cuisine in a stylish and modern environment, with splashes of vivid colors to lift the mood. Marvel at the open display kitchen or choose a private booth for exclusive dining	9c41d544-9f4e-4468-87a6-e078af942908	1 Sky City Road East, Airport, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:57.984131	2025-10-09 09:48:57.984131	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
e17b4fe6-d007-499b-aeff-72e3aa96ffea	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Big Pizza		9c41d544-9f4e-4468-87a6-e078af942908	Shop 5, G/F, Wanchai Central Bldg, 89 Lockhart Rd, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:58.050815	2025-10-09 09:48:58.050815	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b99ff7cb-c78c-4fbc-be9c-5273d6a5b074	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Pentahotel Hong Kong, Tuen Mun		9c41d544-9f4e-4468-87a6-e078af942908	6 Tsun Wen Road, Tuen Mun, New Territories			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:58.11703	2025-10-09 09:48:58.11703	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
21f40d6e-76b6-4a90-8246-29bb2e754ddf	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Spice Of India Reataurant	An institution in Hong Kong for the finest Indian fare, Bombay Dreams in Central has won accolades from guests with a discerning taste for traditional Indian cuisine. Created by renowned Indian chefs direct from their home country, Bombay Dreams present authentic Indian cuisine in a style that has established it as truly fine dining – Indian style! Exotic desserts are a feature. A superb buffet, loaded with Indian delights, represents wonderful value for business lunches or simply lunch with friends.	9c41d544-9f4e-4468-87a6-e078af942908	1/F, Winning Centre, 46 Wyndham Street, Central, Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:58.183047	2025-10-09 09:48:58.183047	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
87cbbd82-885a-4591-938e-7c07f58b22d7	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Gaylord Indian Restaurant & Bar	Service options: Reservations required · Rooftop seating · Great cocktails	9c41d544-9f4e-4468-87a6-e078af942908	5/F, Prince Tower, 12A Peking Road, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:58.250013	2025-10-09 09:48:58.250013	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
9dddd51f-eb04-4488-b2ee-afa91721969e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Anjappar Chettinad Indian Restaurant (Dakshin Indian Restaurant Ltd)		9c41d544-9f4e-4468-87a6-e078af942908	Unit-202, Multifield Plaza, No.3-5 Prat Avenue, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:58.316183	2025-10-09 09:48:58.316183	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
f2d34753-e51c-4199-815c-9f98a122cb7e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Carat Finest Indian Cuisine	Tel : 2111 0491	9c41d544-9f4e-4468-87a6-e078af942908	Shop A, G/F, 29 D’Aguilar st, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:58.384557	2025-10-09 09:48:58.384557	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
359e5194-63e3-4b2d-accb-a39c5645e193	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Regal Airport Hotel – Regala Café & Dessert Bar*	For all-day dining that fulfills comfort cravings, the Regala Café & Dessert Bar is the perfect place. Start your morning with a power breakfast, treat business colleagues to a curry buffet lunch, ease into the afternoon with a slice of cake and cup of artisanal coffee, or unwind after a busy day with a cocktail at the bar. As an officially certified Halal kitchen, Regala Cafe also offers a Halal menu. During the week, a rich choice of salad and vegetables are presented on the buffet, alongside Indian flavors brimming with meat and vegetarian options.	9c41d544-9f4e-4468-87a6-e078af942908	2/F, Regal Airport Hotel, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:58.454031	2025-10-09 09:48:58.454031	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0dd36434-23ab-48aa-b2bd-7ba96b0a6cb7	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Jo Jo Indian Cuisine*		9c41d544-9f4e-4468-87a6-e078af942908	2/F, David House, 37-39 Lockhart Rd, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:58.520496	2025-10-09 09:48:58.520496	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8b2190ca-7584-4356-88f6-f110e7f05ff8	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Kiosk 03 (Panda Food To Go)		9c41d544-9f4e-4468-87a6-e078af942908	Ocean Park, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:58.587535	2025-10-09 09:48:58.587535	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
37579959-226c-43f5-9b45-a355efc7ca48	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Regala Skycity Hotel – Petra	Petra is an international cuisine restaurant that any diner will love as it caters to a range of palates. With live cooking stations sprawling across the spacious dining area, guests will feast into a bounteous array of international food, think authentic Southeast Asian fare, exotic Indian curry specialties, delicate Japanese cuisine and more. To maintain high standards of hygiene and ensure a seamless dine-in experience free from interruption, Petra introduces the chic concept of contactless ordering and takes your epicurean journey to new digital heights.	9c41d544-9f4e-4468-87a6-e078af942908	8 Airport Expo Boulevard, Airport			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:58.654079	2025-10-09 09:48:58.654079	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
361d5217-de3c-45eb-8388-03342650affc	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	AROMA		9c41d544-9f4e-4468-87a6-e078af942908	97, Ma Wan Chung Village, Tung Chung,			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:58.720831	2025-10-09 09:48:58.720831	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
08247896-9d23-49f5-ae72-0ee23419f3d2	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Hotel Alexandra – Café A		9c41d544-9f4e-4468-87a6-e078af942908	32 City Garden Rd, North Point			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:58.787154	2025-10-09 09:48:58.787154	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
fa822089-3670-40b2-a639-91772f6faf13	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Bijas Vegetarian Restaurant		9c41d544-9f4e-4468-87a6-e078af942908	Catering Outlet D, G/F, Run Run Shaw Tower, Centennial Campus, HKU			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:58.853819	2025-10-09 09:48:58.853819	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0cc17122-2f8e-4a11-8b14-160c8ed5fed9	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	The Peninsula HK		9c41d544-9f4e-4468-87a6-e078af942908	Salisbury Road, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:58.920317	2025-10-09 09:48:58.920317	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
beb058d1-d4ba-4235-b773-b051261ba067	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Crispi Bun		9c41d544-9f4e-4468-87a6-e078af942908	Shop A, G/F, Yue Kwa Int’l Building, No.1 Kowloon Park Drive, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:58.992835	2025-10-09 09:48:58.992835	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d626a900-88eb-49a8-8a18-d581fac440e8	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Pakeeza Food Restaurant	Tel : 9232 1171\nService options:  All you can eat\n· Vegan options\n· Wi-Fi	9c41d544-9f4e-4468-87a6-e078af942908	RM.51, 2/F, Mirador Mansion, 58 Nathan Road, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:59.060105	2025-10-09 09:48:59.060105	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
292aa576-930e-4d7e-9aae-84243b565bb4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Popeyes Louisiana Kitchen	Popeyes Louisiana Kitchen is a quick service chicken concept that originated from New Orleans, Louisiana in 1972. Popeyes’s chicken is famous for its crunchy tastes with thin skin and juicy tender meat. 大力水手炸雞是1972年起源於美国路易斯安那州新奧爾良的快餐店。Popeyes的雞肉以其鬆脆的口感、薄薄的皮和多汁的嫩肉而聞名	9c41d544-9f4e-4468-87a6-e078af942908	Shop S2, B/F, T.O.P, 700 Nathan Rd, Mong Kok			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:59.12637	2025-10-09 09:48:59.12637	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
fbc3841f-a267-4240-a5bd-b536edd48f32	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Moti Palace Indian Restaurant	Tel :  3706 5772	9c41d544-9f4e-4468-87a6-e078af942908	Chungking Mansion, Shop No. 96-97, 1/F, 36-44 Nathan Rd, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:59.196533	2025-10-09 09:48:59.196533	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ad1369ad-f786-4825-b3c9-e3d1b954e8fa	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Bombay Dreams (Strong Wide Ltd)	Tel : 2811 9888	9c41d544-9f4e-4468-87a6-e078af942908	1/F, Winning Centre, 46 Wyndham St, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:59.263617	2025-10-09 09:48:59.263617	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
4f4020cb-24eb-46af-9125-44301db11268	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Jashan Celebrating Indian Cuisine	Service options: Reservations required · All you can eat · Private dining room	9c41d544-9f4e-4468-87a6-e078af942908	1/F, Amber Lodge, 23 Hollywood Rd, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:59.329847	2025-10-09 09:48:59.329847	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8647498a-d8d1-44f9-a9a5-0ee053e6b148	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Mecca Restaurant	Halal Food Serves vegetarian dishes and  pizza ,Burger , samosa , Fish , whole chicken, hot dogs 🌭 , Rice , Baryani , spaghetti , Roll , chicken leg , chicken shish	9c41d544-9f4e-4468-87a6-e078af942908	Shop L, G/F, Oceanic Bldg, 22-46 Finnie St, Quarry Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:59.396008	2025-10-09 09:48:59.396008	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
291c4826-e55d-4534-9550-a62ddb152882	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Warung Malang	Tel : 2915 7859	9c41d544-9f4e-4468-87a6-e078af942908	2/F, Flat B2, Dragon Rise Bldg, 9-11 Pennington St, Causeway Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:59.462293	2025-10-09 09:48:59.462293	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
4136c0e6-946d-4cb7-949b-c9c2783de93d	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Dakshin Indian Restaurant Limited (Anjappar Chettinad Indian Restaurant)	Phone: 3428 5757	9c41d544-9f4e-4468-87a6-e078af942908	Unit-202, Multifield Plaza, No.3-5 Prat Avenue, Tsim Sha Tsui, Kowloon, Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:59.528883	2025-10-09 09:48:59.528883	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8b230c78-9dba-4590-80bd-e44ddfc87f10	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tribes	Traditional Pakistani food based on traditional Pashtun cuisine, comprising lamb and chicken, with luscious and delicate textures. First authentic Pakistani food in Hong Kong	9c41d544-9f4e-4468-87a6-e078af942908	2/F, Eastern Flower Centre, 22-24 Cameron Rd, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:59.595876	2025-10-09 09:48:59.595876	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0ac34cb8-c60f-4472-945f-bd5eba91bcfb	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Shadi		9c41d544-9f4e-4468-87a6-e078af942908	Shop A, G/F, Mok Cheong St, To Kwan Kwan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:01.131683	2025-10-09 09:49:01.131683	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
598570a0-b0fb-43fb-a5ad-0b38d67d2a21	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Regal HK Hotel	Tel : 28906633	9c41d544-9f4e-4468-87a6-e078af942908	88 Yee Wo St, Causeway Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:01.198028	2025-10-09 09:49:01.198028	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
51fbd072-b6aa-49cf-bee7-6503aebc1baa	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Dignity Kitchen (Project Dignity (HK) Co Ltd)	We are a social enterprise from Singapore, we started in 2010 with the aim to return dignity to the disadvantaged and the disabled. We are now in HONG KONG to replicate the idea and engage the public to do social good through Singaporean local food.	9c41d544-9f4e-4468-87a6-e078af942908	Shop 201& 202, No.618 Shanghai Street, MongKok, Kowloon			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:59.661981	2025-10-09 09:48:59.661981	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
84fc4e3f-a009-46d4-859c-fdd2c26c0aec	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Regal Riverside Hotel – L ‘Eau		9c41d544-9f4e-4468-87a6-e078af942908	3/F, 34-36 Tai Chung Kiu Road, Sha Tin			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:59.728249	2025-10-09 09:48:59.728249	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
786020af-0c73-4d97-a8b1-8bfba319298f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Project Dignity (Hong Kong) Company Limited (Dignity Kitchen)		9c41d544-9f4e-4468-87a6-e078af942908	Shop 201& 202, No.618 Shanghai Street, MongKok, Kowloon			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:59.795676	2025-10-09 09:48:59.795676	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
da7893b3-c42a-4c6a-a9b7-cdfec9efcebd	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	K28 Popcorn Cart		9c41d544-9f4e-4468-87a6-e078af942908	Ocean Park, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:59.862266	2025-10-09 09:48:59.862266	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
f59b9a1d-be83-4bb5-adbc-114bd5c7cd8c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Old Town White Coffee	OldTown Berhad is Malaysia's largest halal-certified coffee restaurant chain. The company also manufactures and sells instant beverage products and mixes.	9c41d544-9f4e-4468-87a6-e078af942908	Food Court near Gate 40-80, Departures, L6, Airport, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:59.927484	2025-10-09 09:48:59.927484	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
16c79577-c078-46d6-a75d-bed744cd9555	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Shaffi’s Indian Restaurant	Tel: 93095926	9c41d544-9f4e-4468-87a6-e078af942908	Shop 5, Fook Tak Bldg, 234 Castle Peak Rd, Yuen Long			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:59.993802	2025-10-09 09:48:59.993802	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
bfdb5cd9-a963-4977-b5fc-5fcd52c2dfa4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Panda Hotel	Tel : 24091111	9c41d544-9f4e-4468-87a6-e078af942908	Simplicity, Panda Place, 3/F, Tsuen Wah St, Tsuen Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:00.060056	2025-10-09 09:49:00.060056	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
1279d5d1-2cdc-4612-bef0-75e35656c75f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 2433 8368	9c41d544-9f4e-4468-87a6-e078af942908	Shop G14, G/F, Marina Square, 12A South Horizon Drive, Ap Lei Chau			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:00.127708	2025-10-09 09:49:00.127708	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
9c67d575-98e5-4e2c-a5da-ba8cf4280c63	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ocean View Butchery Co Limited	Tel : 2366 4863	9c41d544-9f4e-4468-87a6-e078af942908	Unit 605, Kinetic Industrial Centre, 7 Wang Kwong Rd, Kowloon Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:00.194196	2025-10-09 09:49:00.194196	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
a08e0f96-e526-47f8-b0f2-0e12deca2782	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Big Bay Café	Tel : 2252 5888	9c41d544-9f4e-4468-87a6-e078af942908	Kerry Hotel Kerry Hotel, 3/F, 38 Hung Luen Road, Hung Hom Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:00.260357	2025-10-09 09:49:00.260357	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
22fb1bb3-a192-4731-adc1-9ab227ba619b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Old Town White Coffee		9c41d544-9f4e-4468-87a6-e078af942908	Food Court near Gate 40-80, Departures, L6, Airport, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:00.326328	2025-10-09 09:49:00.326328	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
2eb5616b-3c21-4083-aeed-d7fb028a8f6d	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 23503310	9c41d544-9f4e-4468-87a6-e078af942908	Shop 17, G/F, Yat TungShopping Center, Yat Tung Estate, Tung Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:00.392643	2025-10-09 09:49:00.392643	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
1eb6f764-c2d3-4d8d-9487-5a339182b5a2	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Palki Indian Cuisine	Tel: 3485 5655	9c41d544-9f4e-4468-87a6-e078af942908	G/F, 2 Tsing Fung St, Tin Hau			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:00.459004	2025-10-09 09:49:00.459004	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
9b3c37dc-1225-453b-89d8-5229dd478db3	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel: 2499 2984	9c41d544-9f4e-4468-87a6-e078af942908	Shop 302, 3/F, New Town Mall, Nan Fung Center, Tsuen Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:00.527086	2025-10-09 09:49:00.527086	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8a48e2cf-9870-4332-b33f-bf9dcb599bf9	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Curry Leaf Indian Cuisine	Tel : 8100 0911	9c41d544-9f4e-4468-87a6-e078af942908	G/F, M/F, Mau Lam Comm’l Bldg, 16-18 Mau Lam St, Jordan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:00.596354	2025-10-09 09:49:00.596354	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
66d7f721-c735-444d-9bc6-4da312a51dad	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Zaman Halal Company	Tel : 6093 9351	9c41d544-9f4e-4468-87a6-e078af942908	212B Yee Kuk St, Sham Shui Po			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:00.663364	2025-10-09 09:49:00.663364	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
6e5e3ee1-6f7d-4212-ba9e-dc43d9770428	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Strong Wide Limited (Bombay Dreams)	An institution in Hong Kong for the finest Indian fare, Bombay Dreams in Central has won accolades from guests with a discerning taste for traditional Indian cuisine. Created by renowned Indian chefs direct from their home country, Bombay Dreams present authentic Indian cuisine in a style that has established it as truly fine dining – Indian style! Exotic desserts are a feature. A superb buffet, loaded with Indian delights, represents wonderful value for business lunches or simply lunch with friends.	9c41d544-9f4e-4468-87a6-e078af942908	1/F, Winning Centre, 46 Wyndham Street, Central, Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:00.729868	2025-10-09 09:49:00.729868	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
cead54d7-cd71-4ee6-9faa-6546c1a088eb	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	palki indian cuisine	Tel : 3485 5655	9c41d544-9f4e-4468-87a6-e078af942908	G/F, No.2, Tsing Fung Street Tin Hau Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:00.797443	2025-10-09 09:49:00.797443	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
84bcea8d-7f1d-4b8e-ae76-2449e5fe0e76	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Nina Hotel Kowloon East ION	Tel : 3968 8212	9c41d544-9f4e-4468-87a6-e078af942908	38 Chong Yip Street, Kwun Tong, Kowloon			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:00.86432	2025-10-09 09:49:00.86432	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
de5ee02e-efec-4741-9c9e-9cada50d6537	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel: 2543 4500	9c41d544-9f4e-4468-87a6-e078af942908	Shop L108, Tin Shui Shopping Center, Tin Shui Wai, Yuen Long			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:00.93014	2025-10-09 09:49:00.93014	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
7ded0487-8bb7-4885-8e3a-1117996bedc1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Royal Pacific Hotel		9c41d544-9f4e-4468-87a6-e078af942908	Pierside Restaurant, Tower Wing, 33 Canton Rd, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:00.997357	2025-10-09 09:49:00.997357	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
6e21ef64-0fb2-469d-b61f-08a9e2e5a23e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Burger Mate	Tel : 6461 2771	9c41d544-9f4e-4468-87a6-e078af942908	Brilliant Court, Shop A, G/F, 78 Kimberley Rd, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:01.065255	2025-10-09 09:49:01.065255	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
045f99f9-7f12-4e02-bd5c-d3364a520ab1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ocean Park Marriott Hotel	Tel: 35551700	9c41d544-9f4e-4468-87a6-e078af942908	Marina Kitchen, Marina Wing, 180 Wong Chuk Hang Rd, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:01.264066	2025-10-09 09:49:01.264066	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
88bebe83-a4ee-46c9-b749-d3e20c48b81c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	K15 Dive into a Float (Kiosk at summit area)	Tel: 39232888	9c41d544-9f4e-4468-87a6-e078af942908	Ocean Park, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:01.331163	2025-10-09 09:49:01.331163	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
fe607779-a70f-4d64-8f6a-349ba99707ee	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Onion Hub	Tel : 6544 6056	9c41d544-9f4e-4468-87a6-e078af942908	1/F, Trojan Food Club, Parkside Mall, 18 Tong Chun St, Tseung Kwan O			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:01.397157	2025-10-09 09:49:01.397157	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
cc45bd98-1341-47ce-ab0a-4098586dc49d	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Kiosk 03 (Panda Food To Go)	Tel: 3923 2888	9c41d544-9f4e-4468-87a6-e078af942908	Ocean Park, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:01.464587	2025-10-09 09:49:01.464587	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
96c2485b-2cbb-414a-ad3b-c3a98ba479ee	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Turkish Kebab	Service options: Outdoor seating · Vegetarian options	9c41d544-9f4e-4468-87a6-e078af942908	Shop 15, G/F, Kam Po Court, Hoi Pong Square, Sai Kung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:01.534751	2025-10-09 09:49:01.534751	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
4f77d614-7ffa-4a41-90bf-fdf02b178f8b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	New Chettinad	Service options:\nHappy-hour food\n· Vegan options\n· Kids' menu	9c41d544-9f4e-4468-87a6-e078af942908	G/F, Chung King Mansion, Shop 17&48, 36-44 Nathan Rd, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:01.60084	2025-10-09 09:49:01.60084	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
6d155f28-0c83-42da-84f5-b35cf20b6d53	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Fog Restaurant (Antipasto Express)		9c41d544-9f4e-4468-87a6-e078af942908	Tsim Sha Tsui, Mody Rd, 67號Peninsula CentreShop G35, G/F			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:01.667264	2025-10-09 09:49:01.667264	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
6e431e5f-e902-47cb-a19a-59b70871ba6f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 2470 3872	9c41d544-9f4e-4468-87a6-e078af942908	Shop 7, G/F & 1/F, Wing Light Bldg, 68-76 Castle Peak Rd, Yuen Long			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:01.733328	2025-10-09 09:49:01.733328	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
9537d0fd-10c9-41f6-b495-94ae69231c92	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Mira Moon Hotel	Tel : 2315 5822	9c41d544-9f4e-4468-87a6-e078af942908	Supergiant Social Dining, 3/F, 388 Jaffe Rd, Causeway Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:01.799397	2025-10-09 09:49:01.799397	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ddf990bf-8438-4a53-975f-3d8d5fcf2fee	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Dilliwale	Tel: 69001584	9c41d544-9f4e-4468-87a6-e078af942908	9/F, Kyoto Plaza, 491-499 Lockhart Road, Causeway Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:01.865686	2025-10-09 09:49:01.865686	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
3009efa7-44c5-42b8-9956-889c73bf2be9	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Curry & Kabab Hut	Tel: 2725 0777	9c41d544-9f4e-4468-87a6-e078af942908	G/F, Front Portion, 19 Sung Kit St, Hung Hum			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:01.933316	2025-10-09 09:49:01.933316	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
76f2f39d-b746-4bdb-bd70-c26ebe1d0c67	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Hotel Alexandra, Café A	Tel : 3893 2969	9c41d544-9f4e-4468-87a6-e078af942908	32 City Garden Rd, North Point			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:02.000382	2025-10-09 09:49:02.000382	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
00ab24ab-16f5-47e2-a488-4e98e8e4c2e1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Nina Hotel Tsuen Wan West Hotel Restaurants	Tel :  2280 2806	9c41d544-9f4e-4468-87a6-e078af942908	8 Yeung Uk Road, Tsuen Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:02.066782	2025-10-09 09:49:02.066782	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
69fd3755-7c99-436e-8843-da9c397db360	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Maison Du Mezze	Tel : 2330 0131	9c41d544-9f4e-4468-87a6-e078af942908	G/F, Shop G10, T-bay, Sheraton Hotel, 9 Yi Tung Road, Tung Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:02.132706	2025-10-09 09:49:02.132706	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
a97a5251-12a0-4142-88c0-7032b65c0006	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 3148 1122	9c41d544-9f4e-4468-87a6-e078af942908	Shop L2-1, Level 2, APM, Millenium City, 418 Kwun Tong Road, Kwun Tong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:02.200074	2025-10-09 09:49:02.200074	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b51c94c1-d937-407d-84cf-9d248df563c3	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Prime Halal Foods	Tel :  9173 7187	9c41d544-9f4e-4468-87a6-e078af942908	7/F, Sun Fung Centre, Unit 24, Block B, 88 Kwok Shui Rd, Kwai Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:02.271951	2025-10-09 09:49:02.271951	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
6aada589-8847-407b-9021-8536f75b6860	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tandoor Bites Bar + Kitchen	Tel : 2342 5529	9c41d544-9f4e-4468-87a6-e078af942908	G/F, 178 Queen’s Road West, Sai Ying Pun			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:02.338638	2025-10-09 09:49:02.338638	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
9eccd193-8317-464c-b15f-bacbb6c65020	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Chinesology 唐述	Tel : 6809 2299	9c41d544-9f4e-4468-87a6-e078af942908	ifc mall , Central, Finance St, 8號Shop 3101			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:02.406541	2025-10-09 09:49:02.406541	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
56535fc6-b2b9-42a8-8b50-0e62ea47186f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer’s Kebab & Pizzeria	Tel : 2987 0036	9c41d544-9f4e-4468-87a6-e078af942908	Shop 102A, 1/F Block A, Discovery Bay Plaza, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:02.472913	2025-10-09 09:49:02.472913	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
14f6baa2-0274-427f-bd72-459a9f904584	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	BKK	Tel : 2330 0306	9c41d544-9f4e-4468-87a6-e078af942908	PMQ-Staunton,SG09-SG14,G/FBLOCK A,35 Aberdeen Street, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:02.539309	2025-10-09 09:49:02.539309	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
f01f1a00-47be-43d6-84ba-7280840b9501	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Harbour Cruise - bauhinia	Tel : 2802 2886	9c41d544-9f4e-4468-87a6-e078af942908	Harbour Cruise Vessel Birthing at North Point East Passenger Ferry Pier			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:02.606303	2025-10-09 09:49:02.606303	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
6c6a423b-ed94-4813-9079-5e1f4399687d	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Yaqut’s Lanzhou Hand-Pulled Beef Noodles	Tel : 6822 3128	9c41d544-9f4e-4468-87a6-e078af942908	Causeway Bay, Lau Sin St, 天后留仙街3號雅景樓地下B號舖(近地鐵站A1出口			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:02.673176	2025-10-09 09:49:02.673176	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
420558fe-1ad6-4439-a3a1-b56149db4a13	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Yuan	Tel : 2728 7278	9c41d544-9f4e-4468-87a6-e078af942908	1-13 Shop 2, G/F, Chinachem Hollywood Centre, Hollywood Rd, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:02.739587	2025-10-09 09:49:02.739587	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
7e201f59-45c0-4e8f-b9d6-a6114e2df3f5	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Priyo Shaad	Tel :  6737 4607	9c41d544-9f4e-4468-87a6-e078af942908	29 Aberdeen St, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:02.80581	2025-10-09 09:49:02.80581	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
aec7a46f-a8b3-44be-9799-76b0c7581d80	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	The Park Lane HK	Tel: 28393327	9c41d544-9f4e-4468-87a6-e078af942908	Skye, 27/F, 310 Gloucester Rd, Causeway Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:02.872616	2025-10-09 09:49:02.872616	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
bc0be8f8-6037-4989-a957-5700702e3a6c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Harbour Plaza, Café 8 Degrees	Tel : 2126 1919	9c41d544-9f4e-4468-87a6-e078af942908	G/F, Harbour Plaza 8 Degrees, 199 Kowloon City Rd, To Kwa Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:02.94449	2025-10-09 09:49:02.94449	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
e9685777-79ce-4b27-8439-be34a324b253	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Halal Meat Shop	Tel : 6908 3037	9c41d544-9f4e-4468-87a6-e078af942908	M12, 1/F, Ngau Chi Wan Market, Choi Hung MTR Exit B, Ngau Chi Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:03.012259	2025-10-09 09:49:03.012259	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
aa68f6b1-2713-40ef-91d8-9181e70c421b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Groundswell	Tel :  5725 2287	9c41d544-9f4e-4468-87a6-e078af942908	Shop L601, 6/F, AIRSIDE, 2 Concorde Rd, Kai Tak			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:03.079408	2025-10-09 09:49:03.079408	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ddd48ca7-ccf0-49c0-9888-ee2344d44534	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Lady 13 Kitchen	Service options:  Doesn't accept reservations\n· Vegetarian options\n· Wi-Fi	9c41d544-9f4e-4468-87a6-e078af942908	G/F, Valiant Commercial Bldg, 22-24 Prat Ave, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:03.145778	2025-10-09 09:49:03.145778	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
69d5ea03-c644-4779-8dae-1ed53fe21e9f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Mira Hotel TST		9c41d544-9f4e-4468-87a6-e078af942908	Cuisine Cuisine, 3/F, Mira Place, 118-130 Nathan Rd, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:03.212697	2025-10-09 09:49:03.212697	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
e696b30b-d0be-45fa-9174-f791bdcd7fb4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Lamees	Service options: Has outdoor seating	9c41d544-9f4e-4468-87a6-e078af942908	G/F, Sanford Mansion, 145 Pak Tai St, To Kwa Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:03.282529	2025-10-09 09:49:03.282529	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
9df0b290-0d1a-4d35-860c-6e72b17834ee	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Four Points By Sheraton Tung Chung, Tung Chung Kitchen	Tel : 2535 0020	9c41d544-9f4e-4468-87a6-e078af942908	9 Yi Tung Rd, Tung Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:03.349767	2025-10-09 09:49:03.349767	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
c7b428ee-d200-4346-bd8a-12bfab026545	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	K38 Clown Corner (Halal Section)	Tel: 3923 2888	9c41d544-9f4e-4468-87a6-e078af942908	Thrill Mountain, The Summit, Ocean Park, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:03.419664	2025-10-09 09:49:03.419664	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
2b113eb9-b56a-40dc-9664-f540295ea739	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Harbour Grand HK, Harbour Grand Cafe	Tel : 21212688	9c41d544-9f4e-4468-87a6-e078af942908	23 Oil Street, North Point			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:03.48612	2025-10-09 09:49:03.48612	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
bc2e3cbf-dbae-4668-887b-aeba7b3932bf	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel: 2469 0703	9c41d544-9f4e-4468-87a6-e078af942908	Causeway Bay Flat A1 on G/F, 1/F & 2/F, East South Building, 479 & 481 Hennesy Road, 29 Percival Street, Causeway Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:03.551998	2025-10-09 09:49:03.551998	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
7a639459-9534-43dc-94c3-19a1b9dd1622	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Waqas Provision Store	Waqas Provision Store is a retail store in Hong Kong with a variety of groceries items from the subcontinent. Specialized in Pakistani, Indian, Bengali and Nepali groceries. We offer all kinds of food from Parathas, Tandoori Masala to Ready-to-cook foods	9c41d544-9f4e-4468-87a6-e078af942908	Ngau Chi Wan Market , Clear Water Bay Rd, MTR exit B, Stall S201, 1/F, Choi Hung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:03.618183	2025-10-09 09:49:03.618183	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
39ec0b56-871a-4b4a-9e0c-8c70ac060071	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	27 Kebab House		9c41d544-9f4e-4468-87a6-e078af942908	1A/F, Fong Shu Chuen Amenities Centre, Main Campus, HKU			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:03.683389	2025-10-09 09:49:03.683389	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b1eafcc8-6006-4a9f-b47e-d8fdcebfd294	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	AL Madina Trading	Tel : 2387 8825	9c41d544-9f4e-4468-87a6-e078af942908	Sham Shui Po			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:03.750245	2025-10-09 09:49:03.750245	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
39c8b74a-2c81-4efb-9eeb-64ad5f1cdcc3	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 2314 3818	9c41d544-9f4e-4468-87a6-e078af942908	Shop 101 & 106-108, 1/F, Chuang’s London Plaza, 219 Nathan Rd, Jordan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:03.816708	2025-10-09 09:49:03.816708	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
738b777e-7dde-43de-a666-e77d74967445	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	River View Cafe	Tel : 3550 2903	9c41d544-9f4e-4468-87a6-e078af942908	Hong Kong Disneyland Adventureland at Hong Kong Disneyland Park, Lantau Island.			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:03.884832	2025-10-09 09:49:03.884832	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
af2442e4-637e-49c2-9438-4cbee293ed12	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Bombay To Go	Tel : 2805 1515	9c41d544-9f4e-4468-87a6-e078af942908	9 Possession St, Tai Ping Shan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:03.951742	2025-10-09 09:49:03.951742	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
4ad1a3f1-77e0-409f-aea6-9d24912b45bc	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Chakwal Meat Shop	Halal and best in the town at your servic	9c41d544-9f4e-4468-87a6-e078af942908	tall No. 10 Temp market, 30 Haiphong Rd, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:04.018037	2025-10-09 09:49:04.018037	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
c62eed81-fdfe-4906-a767-6f8169a66ad1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Habib’s	Tel : 24934000	9c41d544-9f4e-4468-87a6-e078af942908	Shop 7, G/F, Lee King Mansion, 83 Electric Road, North Point			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:04.084509	2025-10-09 09:49:04.084509	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
a7297823-fef8-4869-a706-6bfbabd4bb7a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 2573 4446	9c41d544-9f4e-4468-87a6-e078af942908	Shop 114, 1/F, Sau Mau Ping Shopping Centre, 101 Sau Ming Rd, Kwun Tong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:04.15055	2025-10-09 09:49:04.15055	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
194ae12e-1aef-4ccb-bef5-5ac9d89c34f8	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Toast Box	Tel : 2156 9100	9c41d544-9f4e-4468-87a6-e078af942908	G/F, Shop C, JD Mall, 233-239 Nathan Rd, Jordan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:04.216823	2025-10-09 09:49:04.216823	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
959e304f-1e30-4294-8da4-c3d2e297a34a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer’s Kebab & Pizzeria	Tel : 2259 3988	9c41d544-9f4e-4468-87a6-e078af942908	Shop 9A, G/F, Ngong Ping Themed Village, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:04.283694	2025-10-09 09:49:04.283694	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
53a94302-ba13-4e6c-b11b-4c2c8dd9748c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer’s Kebab & Pizzeria	Tel: 25293738	9c41d544-9f4e-4468-87a6-e078af942908	No.18, Hong Kong Stadium, 55 Eastern Hospital Rd, So Kon Po			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:04.350622	2025-10-09 09:49:04.350622	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ba0eabcf-c8c9-477e-8b05-f540a6b87337	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Chaska	Tel : 6809 2299	9c41d544-9f4e-4468-87a6-e078af942908	G/F, Midland Court, 58-62 Caine Road, Mid-Levels, Central, Mid-Levels			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:04.4168	2025-10-09 09:49:04.4168	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
bab93bc2-6bac-47b8-bd21-ce8b96b6a6b3	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Curry Culture	Phone: 3489 6719	9c41d544-9f4e-4468-87a6-e078af942908	5 Minden Ave, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:04.488157	2025-10-09 09:49:04.488157	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
09b4d913-fd2f-45a4-8898-bd2f6ca50c9c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Habib’s Indian & Middle Eastern Food	Tel : 2510 9008	9c41d544-9f4e-4468-87a6-e078af942908	G/F, Hung To Centre, Habibs Shop 5F4, 94-96 How Ming St, Kwun Tong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:04.558068	2025-10-09 09:49:04.558068	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
721f7fa4-5948-4487-bf16-2499f676f8c1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Harbour Grand Kowloon (Function Room)	Tel : 26213188	9c41d544-9f4e-4468-87a6-e078af942908	20 Tak Fung Street, Whampoa Garden, Hung Hum			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:04.625461	2025-10-09 09:49:04.625461	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
944abeb7-e176-46e0-a864-34b20c211c1b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	BACCO	Service options: Outdoor seating · Food at bar	9c41d544-9f4e-4468-87a6-e078af942908	G/F, 21 Man Nin Street, Sai Kung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:04.691366	2025-10-09 09:49:04.691366	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
af024508-fa49-46c8-8b71-24d4ae722975	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	The Mira HK		9c41d544-9f4e-4468-87a6-e078af942908	Yamm, 118-130 Nathan Rd, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:04.757597	2025-10-09 09:49:04.757597	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
7cd00e88-f498-42cb-b9d1-e2997a738ba9	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Four Seasons Hotel		9c41d544-9f4e-4468-87a6-e078af942908	8 Finance St, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:04.823754	2025-10-09 09:49:04.823754	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
23ce32a8-e76d-450c-ba99-1dcfbe4e2171	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Mansarover Int’l Cuisine	Tel : 21091927	9c41d544-9f4e-4468-87a6-e078af942908	G/F, 21 Ha Ling Pei Tsuen, Tung Chung Road, Tung Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:04.898133	2025-10-09 09:49:04.898133	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
73765d28-a6cd-4b01-9ae8-598635af5e4f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	K28 Popcorn Cart	Tel : 3923 2888	9c41d544-9f4e-4468-87a6-e078af942908	Ocean Park, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:04.963733	2025-10-09 09:49:04.963733	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
41b80012-510e-419f-86e8-cad760e3a10a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	WOW!Bazaar! 特賣掂		9c41d544-9f4e-4468-87a6-e078af942908	Shop 408, Hing Man Shoppig Complex, 188 Tai Tam Road, Chai Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:05.030074	2025-10-09 09:49:05.030074	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
fa8c9b45-95fe-4509-ad35-cfdb4fc423cf	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Iman Halal Food Ltd	Tel :  3488 1442	9c41d544-9f4e-4468-87a6-e078af942908	Suite B2, 18/F, Gaylord Commercial Building, 114-118 Lockhart Road, Wan Cha			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:05.099812	2025-10-09 09:49:05.099812	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
a3df3d1a-cf8e-41ba-86d8-0affdfca3ebf	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Shahrazad	Tel : 2330 0242	9c41d544-9f4e-4468-87a6-e078af942908	2/F, Carfield Commercial Building, 77 Wyndham St, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:05.16689	2025-10-09 09:49:05.16689	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8d4c4910-90f1-40d1-8ada-815f2caa7732	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 2779 8768	9c41d544-9f4e-4468-87a6-e078af942908	Shop 3, G/F, Kowloon Bldg, 555 Nathan Rd, Yau Ma Tei			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:05.234958	2025-10-09 09:49:05.234958	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
c21fe27c-dcb6-472a-95be-f6a89d3f6eae	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 25033073	9c41d544-9f4e-4468-87a6-e078af942908	1/F, Ming Yuen Center, 402-404 King’s Road, North Point			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:05.302604	2025-10-09 09:49:05.302604	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
12c25d53-be80-4f51-a376-6901d3ad69ad	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Bushra	Tel :  6172 3591	9c41d544-9f4e-4468-87a6-e078af942908	Shop G6 & UG16, 66 Mody Rd, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:05.371039	2025-10-09 09:49:05.371039	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
7ca1d91c-65e5-4e2d-8bcb-3ae7e4df7b9c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Halal Meat Trading Limited	Tel :  5168 0046 or 5938 877	9c41d544-9f4e-4468-87a6-e078af942908	Shop 81, Choi Hung Road Market, San Po Kong, Wong Tai Sin MTR			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:05.437775	2025-10-09 09:49:05.437775	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0baaae6e-a10a-4b15-89e7-630601364c30	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Dicos	Tel : 2973 0081	9c41d544-9f4e-4468-87a6-e078af942908	Seng Ming Court, 375-377 King’s Road, North Point			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:05.503948	2025-10-09 09:49:05.503948	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
92314531-2091-4ade-a2a5-4db017037dcf	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC (Stanley)		9c41d544-9f4e-4468-87a6-e078af942908	Stanley, Carmel Rd, 23號赤柱廣場 1樓101號舖			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:05.575735	2025-10-09 09:49:05.575735	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d2a0053b-7786-4e31-b836-814005306242	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Pentahotel Hong Kong, Tuen Mun	Tel: 31121119	9c41d544-9f4e-4468-87a6-e078af942908	6 Tsun Wen Road, Tuen Mun			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:05.643174	2025-10-09 09:49:05.643174	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
34053b55-3cfb-4dbe-b1ea-45d959e690a7	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Chutney	Service options:  Vegan options  · Wi-Fi	9c41d544-9f4e-4468-87a6-e078af942908	4/F, Carfield Commercial Building, 77 Wyndham Street, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:05.7103	2025-10-09 09:49:05.7103	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ce218203-b9fa-4246-9c76-852f0f888aa2	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	W03 Horizon Grill		9c41d544-9f4e-4468-87a6-e078af942908	Ocean Park, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:05.776356	2025-10-09 09:49:05.776356	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0c5fac97-c735-4903-ba3d-e5e0523d45e8	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Dorsett Kitchen	Tel: 3987 2288	9c41d544-9f4e-4468-87a6-e078af942908	Dorsett Mongkok Dorsett Mong Kok, 88 Tai Kok Tsui Road, Tai Kok Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:05.843401	2025-10-09 09:49:05.843401	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
2c3954ca-3285-4dca-8218-b9a278fa54b3	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Cappadocia Turkish Kebab	As Cappadocia Turkish Kebab, we serve our customers with daily made kebabs and vegatables. Everything we use in our branch are made and manufactored by us. We use our special formula for sauces. Our service material are %100 recyclable. We use wooden forks/spoons and aluminium plating for service which can be heated and served again in any oven or microwave. 作為 Cappadocia Turkish Kebab，我們為客戶提供每日製作的烤肉串和蔬菜。 我們在分支機構中使用的所有東西都是由我們製造和製造的。我們使用 我們的服務材料是 100% 可回收的。 我們使用木叉/勺子和鍍鋁的服務，可以在任何烤箱或微波爐中加熱和再次服務。	9c41d544-9f4e-4468-87a6-e078af942908	Shop A, G/F, 118 Lock Hart Road, Wan Chai, Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:05.910543	2025-10-09 09:49:05.910543	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
6a5b0e7b-6e33-466a-bd66-d0a4859e6531	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Wu Zhi Jian Beef Noddles	Tel : 2677 3078	9c41d544-9f4e-4468-87a6-e078af942908	501號 Lockhart Rd, Causeway Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:05.97604	2025-10-09 09:49:05.97604	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
6ac3c092-efaf-4961-91ff-a59d310debed	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tandoori Junction		9c41d544-9f4e-4468-87a6-e078af942908	101 Electric Rd, Causeway Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:06.042079	2025-10-09 09:49:06.042079	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0de0a4c2-f7c2-4666-aec8-59cb368817e6	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	House of Curry	Tel:  6158 3200	9c41d544-9f4e-4468-87a6-e078af942908	G/F Shop 12a, Chungking Mansion, 36-44 Nathan Rd, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:06.108507	2025-10-09 09:49:06.108507	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d0dc636b-65e2-42e8-8028-0b775d3cec2c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Bijas Vegetarian Restaurant	Tel : 2964 9011	9c41d544-9f4e-4468-87a6-e078af942908	Catering Outlet D, G/F, Run Run Shaw Tower, Centennial Campus, HKU			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:06.17611	2025-10-09 09:49:06.17611	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ae805efd-0df4-4880-a457-9f278614cbec	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 2897 9192	9c41d544-9f4e-4468-87a6-e078af942908	Chai Wan Shop No. G8, G/F, Island Resort Mall, 28 Siu Sai Wan Road			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:06.249076	2025-10-09 09:49:06.249076	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
46eb6c5a-9384-41a9-b789-75948586f50d	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC ( Causeway Bay)		9c41d544-9f4e-4468-87a6-e078af942908	Causeway Bay, Percival St, 29號及軒尼詩道479-481號 東南大廈地下至二樓A1號舖			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:06.316533	2025-10-09 09:49:06.316533	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
72894a6d-51e1-4850-8b0d-194ce7ebfa8e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	The Market-Hotel ICON		9c41d544-9f4e-4468-87a6-e078af942908	2/F, 17 Science Museum Rd, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:06.383823	2025-10-09 09:49:06.383823	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d9e1190f-c905-47d3-86c8-9d4f4ecff906	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Salaam Namaste	TEL : 2447 1401	9c41d544-9f4e-4468-87a6-e078af942908	Shop 6, G/F, Winfield Bldg, 847-865 Canton Rd, Yau Ma Tei			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:06.451011	2025-10-09 09:49:06.451011	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0174feed-6cde-4e93-bf48-1402e85609cc	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Farzana Trading Limited	Tel : 9740 2126	9c41d544-9f4e-4468-87a6-e078af942908	Hollywood Plaza, Rm 1408. 14/F, 610 Nathan Rd, Mong Kok			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:06.517254	2025-10-09 09:49:06.517254	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
fb5f0455-4093-449b-b7a9-b4c521965c92	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 2338 9397	9c41d544-9f4e-4468-87a6-e078af942908	Shop U201-203, Upper G/F 2, Lok Fu Place, Wang Tau Hom, Wong Tai Sin			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:06.584006	2025-10-09 09:49:06.584006	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
54127c65-d824-4303-8d16-e7f315b1675f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Cooking Lobo	Tel : 5404 8708	9c41d544-9f4e-4468-87a6-e078af942908	Cactus Mansion, 1-19號 McGregor St, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:06.649735	2025-10-09 09:49:06.649735	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
9b20cbdb-646f-4ecb-a09c-45ab853a1362	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Great Thai Food	Tel No :  5303 3325	9c41d544-9f4e-4468-87a6-e078af942908	Shop 29 G/F Chung Mei Building, 16 Chung Wui Street, Tai Kok Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:06.719824	2025-10-09 09:49:06.719824	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
1732e6e3-4275-413a-8286-51791c75530d	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Little Indian Restaurant	Tel : 2777 0102	9c41d544-9f4e-4468-87a6-e078af942908	G/F, 19 Woosung Street, Ya Ma Tei			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:06.786043	2025-10-09 09:49:06.786043	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
9255831a-7bf3-4c82-8d76-c31484a1871d	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Cheeky Buns	Tel:  2581 2128	9c41d544-9f4e-4468-87a6-e078af942908	G/F, 45-47 Cochrane St, Central, Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:06.856331	2025-10-09 09:49:06.856331	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
59319746-02f2-4246-88d4-91a2272e7aa6	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Cravings	Tel : 9749 7545	9c41d544-9f4e-4468-87a6-e078af942908	867-885, Winfield Building, 871 Canton Rd, Yau Ma Tei			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:06.921426	2025-10-09 09:49:06.921426	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
43e67327-a6ae-43a7-8f6a-4d651a0c131d	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC- APM		9c41d544-9f4e-4468-87a6-e078af942908	Millennium City Phase V, Shop No. L2-1 Level 2, apm, 418 Kwun Tong Rd, Kwun Tong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:06.988305	2025-10-09 09:49:06.988305	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
a02fcbd5-7d18-47c5-895b-15ecdb15b16d	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ali Baba Kitchen	Tel : 2808 0250	9c41d544-9f4e-4468-87a6-e078af942908	Shop A3, G/F, Block 2, Kam Hoi Mansion, 47 Pan Hoi Street, Quarry Bay.			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:07.055479	2025-10-09 09:49:07.055479	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
dce9eae5-6830-4ddd-9d54-6af01a759c33	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tandoori Junction	Tel : 2494 7000	9c41d544-9f4e-4468-87a6-e078af942908	G/F, 58 Tung Lo Wan Rd, Causeway BayG/F, 58 Tung Lo Wan Rd, Causeway Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:07.121545	2025-10-09 09:49:07.121545	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
3d39297e-cb7b-4c9a-b36b-654d5efdc40c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 2756 0756	9c41d544-9f4e-4468-87a6-e078af942908	Shop 618, Level 6, Telford Plaza II, Kowloon Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:07.189021	2025-10-09 09:49:07.189021	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
4b01cdbe-38d8-4c7e-a122-bb987ef9ab64	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Hong Kong SkyCity Marriot Hotel, SkyCity Bistro	Tel: 3969 1888	9c41d544-9f4e-4468-87a6-e078af942908	1 Sky City Road East, Airport, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:07.255295	2025-10-09 09:49:07.255295	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
525071b6-4af8-42d0-9b29-7d80c331a9ee	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	pasteako	Tel   2330 0129	9c41d544-9f4e-4468-87a6-e078af942908	Block B, G/F, Hollywood), PMQ, 35 ABERDEEN STREET HG01-05, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:07.328247	2025-10-09 09:49:07.328247	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
a54840f5-65b5-40f7-be50-7de51dd79391	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Plaza Premium Lounge	Tel : 3018 3078	9c41d544-9f4e-4468-87a6-e078af942908	Airport, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:07.393743	2025-10-09 09:49:07.393743	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
db38c47e-833a-435c-b099-4786e5097078	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Kowloon Shangri La		9c41d544-9f4e-4468-87a6-e078af942908	Cafe Kool, 64 Mody Rd, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:07.459662	2025-10-09 09:49:07.459662	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d0b04a74-bc23-402e-91e3-6c785ba707f6	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Chutney	Tel : 5404 8708	9c41d544-9f4e-4468-87a6-e078af942908	4/F, Carfield Commercial Building, 77 Wyndham St, Central			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:07.52575	2025-10-09 09:49:07.52575	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
344ef650-8c9f-483d-aa7f-7bae89206387	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel: 2850 7945	9c41d544-9f4e-4468-87a6-e078af942908	(Tuen Mun 2) Shop no. 103 D, 1/F,Fu Tai Shopping Centre, Fu Tai Estate, Tuen Mun			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:07.591935	2025-10-09 09:49:07.591935	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
1fdcd4f4-be50-4b5e-b3df-7955ffd1d9f0	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Bakery kitchen of Bayview Restaurant*		9c41d544-9f4e-4468-87a6-e078af942908	1/F, Headland Cable Car Terminal Bldg, Ocean Park, Aberdeen			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:07.657656	2025-10-09 09:49:07.657656	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
38219ede-3b4b-4893-9dc8-d3dc4d83ed9e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC- Dragon Center SSP		9c41d544-9f4e-4468-87a6-e078af942908	Shop 317, Level 3, Dragon Centre, 37K Yen Chow St, Sham Shui Po			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:07.724139	2025-10-09 09:49:07.724139	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
7d29e0cf-1a95-4c32-a632-ceb679ad9f06	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Regal Riverside Hotel L ‘Eau*	Tel : 2132 1040	9c41d544-9f4e-4468-87a6-e078af942908	3/F, 34-36 Tai Chung Kiu Road, Sha Tin			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:07.790538	2025-10-09 09:49:07.790538	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d3e951de-0193-430f-90ff-b7b0296c59b9	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC ( Chai Wan)		9c41d544-9f4e-4468-87a6-e078af942908	號舖 吉勝街 新翠商場 322-323, Chai Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:07.857258	2025-10-09 09:49:07.857258	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d97fc024-2e1a-4154-8f8d-a84b193f40eb	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Turkeyano	Tel : 2312 0148	9c41d544-9f4e-4468-87a6-e078af942908	Shop 7A, G/F, Honour Hse, 375-381 Nathan Rd, Yau Ma Tei			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:07.923175	2025-10-09 09:49:07.923175	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
fc6d6e12-359a-473f-8230-aebfe0d59440	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Matbakh	Phone: 6580 2597	9c41d544-9f4e-4468-87a6-e078af942908	Shop C,D, no.2 Man Wai Street, Ferry Point			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:07.990527	2025-10-09 09:49:07.990527	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8aed7c70-7ac2-4545-b188-694ed90871c3	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Chrisly Cafe	Tel :  2387 1818	9c41d544-9f4e-4468-87a6-e078af942908	Shop G7&G8, G/F, Harbour Pinnacle, 8 Minden Avenue, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:08.056938	2025-10-09 09:49:08.056938	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
499291b8-dc75-4125-a537-ac507082dea2	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tikka House		9c41d544-9f4e-4468-87a6-e078af942908	B2, G/F, May Ka Mansion, 21-23 Fort St, North Point			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:08.12595	2025-10-09 09:49:08.12595	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
25e53c97-bd0f-48a1-a923-0277f00a2fc9	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Delicaso	Tel : 9498 7010	9c41d544-9f4e-4468-87a6-e078af942908	Shop MK09, g/F, Fresh Central, Ping Yan Shopping Center, 65 Ping Ha Rd, Tin Shui Wai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:08.192392	2025-10-09 09:49:08.192392	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8637ea86-3e5b-4571-a33c-3e490156a8ef	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Dicos	Tel : 3615 0977	9c41d544-9f4e-4468-87a6-e078af942908	Seng Ming Court, 375-377 King's Rd, North Point			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:08.258688	2025-10-09 09:49:08.258688	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
6d0dde63-218a-4fd2-aa2a-a80354b6c6c7	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC (South Horizons)		9c41d544-9f4e-4468-87a6-e078af942908	Shop G14 G/F, Marina Square West Centre, 12A South Horizon Drive, Ap Lei Chau			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:08.326686	2025-10-09 09:49:08.326686	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
f2d44a51-c03f-463b-81c6-290a6a4dc658	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 2728 8191	9c41d544-9f4e-4468-87a6-e078af942908	Shop 317, 3/F, Dragon Centre, 37K Yen Chow St, Sham Shui Po			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:08.393113	2025-10-09 09:49:08.393113	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
a5d0619d-34b8-465b-8073-16ddef6b8ba0	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer's Kebab & Pizzeria (HKMU)		9c41d544-9f4e-4468-87a6-e078af942908	P21, G/F, 30 Good Shepherd St, Ho Man Tin			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:08.459205	2025-10-09 09:49:08.459205	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8718b09c-9321-4a82-9ed6-e457dd862b37	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Curry Leaf Indian Cuisine	Tel : 8100 0911	9c41d544-9f4e-4468-87a6-e078af942908	G/F, M/F, Mau Lam Comm’l Bldg, 16-18 Mau Lam St, Jordan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:08.525438	2025-10-09 09:49:08.525438	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
f10db398-c3fb-41cd-9b9e-cc4096aae254	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Habib’s		9c41d544-9f4e-4468-87a6-e078af942908	Shop 58, 1/F, Gogo Mall, 112-140 Tuen Mun, Heung Sze Wui Road, Tuen Mun			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:08.59492	2025-10-09 09:49:08.59492	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d2fb7e22-104b-4826-81cc-c9841d5f7026	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Regal Airport Hotel, Regala Café & Dessert Bar*		9c41d544-9f4e-4468-87a6-e078af942908	2/F, Regal Airport Hotel, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:08.661447	2025-10-09 09:49:08.661447	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8e5d2e8b-a6be-4e5e-824f-852d7816a640	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Café East	Service options: Reservations required · All you can eat	9c41d544-9f4e-4468-87a6-e078af942908	New World Millennium Hotel 1/F, New World Millenium Hotel, 72 Mody Road, Tsim Sha Tsui East, Kowloon			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:08.728258	2025-10-09 09:49:08.728258	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b9a95010-c7f2-4298-9801-65cbb1a7674f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Marouf & Puff Bake	Tel:  6993 4206	9c41d544-9f4e-4468-87a6-e078af942908	G/F Seasons Commercial Bldg, 3-3A Humphreys Ave, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:08.794347	2025-10-09 09:49:08.794347	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
65215894-3ddb-4cd5-98e7-3f4b51c00ede	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Cathay Pacific Catering Services (H.K.) Ltd	Tel : 21162288	9c41d544-9f4e-4468-87a6-e078af942908	11 Catering Road East, Airport, Lantau Island			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:08.861446	2025-10-09 09:49:08.861446	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
a62b96f3-fa7d-4222-8ebd-bd7e172357c7	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 24569638	9c41d544-9f4e-4468-87a6-e078af942908	Shop S320 A&B, Level 3, Zone S, HANDS, Yau Oi Estate, Tuen Mun			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:08.927729	2025-10-09 09:49:08.927729	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
332013e9-d1ac-4c33-b42e-9442ef1f849f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Tandoor Junction	Tel : 21468282	9c41d544-9f4e-4468-87a6-e078af942908	G/F, 101 Electric Road, Tin Hau			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:08.995935	2025-10-09 09:49:08.995935	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b35e368e-9e1e-4833-bd4f-c644a267c9db	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Saison Foodservice Limited	Tel : 2537 8080	9c41d544-9f4e-4468-87a6-e078af942908	2/FL, Block A, Kerry T.C. Warehouse 1 3 Kin Chuen Street, Kwai Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:09.064066	2025-10-09 09:49:09.064066	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
18b370bd-239c-43b5-82a7-5c7945d9e655	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Siete Ocho	Tel  : 35288288	9c41d544-9f4e-4468-87a6-e078af942908	Dorsett Kai Tak Dorsett Kai Tak, 2/F, 43 Shing Kai Road, Kowloon City			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:09.130257	2025-10-09 09:49:09.130257	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d14564ba-31a3-45ff-922b-2e125204112c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Kwong Lee Trading	Tel : 2572 7367	9c41d544-9f4e-4468-87a6-e078af942908	16 Bowrington Road, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:09.19685	2025-10-09 09:49:09.19685	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b7eabe5a-7e7b-403d-9981-6b682a326b6c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	South Stream Market	Tel : 6213 3423	9c41d544-9f4e-4468-87a6-e078af942908	Flat 202-203, 2/F, Lai Sun Yuen Long Industrial Centre, 27 Wang Yip Street East, Yuen Long			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:09.263033	2025-10-09 09:49:09.263033	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
a336a69e-ec97-4c62-b78c-66806aa51070	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Mutton stall	Tel : 9572 0277	9c41d544-9f4e-4468-87a6-e078af942908	35 Mei Kwong St, To Kwa Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:09.330011	2025-10-09 09:49:09.330011	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
5e2370ed-881b-43fd-9ea3-f0abb8275916	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 2368 3065	9c41d544-9f4e-4468-87a6-e078af942908	Kai Tak Shop no. M3-104, Level 1, Kai Tak Mall 3, Kai Tak Sports Park, Kai Tak, Kowloon City			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:09.396437	2025-10-09 09:49:09.396437	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
eff6fca3-852e-4269-9052-486620ad532f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Al-Falah HK Limited	Tel : 2729 1700	9c41d544-9f4e-4468-87a6-e078af942908	186-200 Sai Lau Kok Rd, Tsuen Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:09.462897	2025-10-09 09:49:09.462897	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ee80cb02-bb93-4dd9-aa56-a52fb7140c60	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Ebeneezer’s Kebab & Pizzeria	Tel : 2561 2081	9c41d544-9f4e-4468-87a6-e078af942908	& Pizzeria\tG05 Li Wai Chun Building, The Chinese University of HK, Shatin, New Territories			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:09.53157	2025-10-09 09:49:09.53157	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
da25d984-1e7a-4ed0-8876-d27a394afdc1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Sun’s Milk Tea		9c41d544-9f4e-4468-87a6-e078af942908	8F55, 8/F, Dragon’s Centre, Sham Shui Po			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:09.59825	2025-10-09 09:49:09.59825	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
a9d070b4-5c1f-4fb3-a02e-8345afc9bf6b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 2326 9174	9c41d544-9f4e-4468-87a6-e078af942908	Shop 114C, G/F, Cheung Fat Plaza, Cheung Fat Plaza, Tsing Yi			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:09.665012	2025-10-09 09:49:09.665012	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
778d5249-51b1-46ec-b8f0-8755c5b07fe3	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Woodlands	Tel : 2129 2188	9c41d544-9f4e-4468-87a6-e078af942908	1/F, Dennies House, 20 Luard Rd, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:09.734826	2025-10-09 09:49:09.734826	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
1cea94fb-5189-4b3f-9382-3d89911d23fb	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Zai Lan Zhou Beef Noodles		9c41d544-9f4e-4468-87a6-e078af942908	8F12, 8/F, Dragon Center, Sham Shui Po			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:09.803558	2025-10-09 09:49:09.803558	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ce2e36a7-3230-43c9-b866-7dbce2eddacf	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Cook & Cook	Tel: 98074401	9c41d544-9f4e-4468-87a6-e078af942908	Shop 7, G/F, Look Yuen, 6 Tsing Pak Path, Tuen Mun			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:09.871367	2025-10-09 09:49:09.871367	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ff2df51d-bbb3-4253-800b-f9bae305ead2	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 2503 3073	9c41d544-9f4e-4468-87a6-e078af942908	Kennedy Town Shop Restaurant B, 1/F, 116-122A Belcher’s Street			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:09.937601	2025-10-09 09:49:09.937601	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
17958234-941f-4ea9-9c14-9cb835be9afd	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Himalaya Restaurant (Nepalese & indian cuisine)	Tel : 2527 5899	9c41d544-9f4e-4468-87a6-e078af942908	1/F A 22, Shu Tak Building, 30 Tai Wong St E, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:10.003738	2025-10-09 09:49:10.003738	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
2b10190e-3a7d-4bdd-b6e5-5b3a2a59be4f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Curry & Kabab Hut	Savour the taste of fresh and authentic Indian and Middle Eastern Cuisine. All dishes are halal.	9c41d544-9f4e-4468-87a6-e078af942908	G/F (Front Portion), 19 Sung Kit Street, Hung Hom, Kowloon			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:10.202979	2025-10-09 09:49:10.202979	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8a99a8eb-55f5-4c27-b0d3-58f398769e02	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Halal Care House	Tel: 84819211	9c41d544-9f4e-4468-87a6-e078af942908	Shop C, G/F, Lok Kui Building, 2 Ping Ha Road, Ping Shan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:10.268989	2025-10-09 09:49:10.268989	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ee734801-6e25-4b1d-949a-3c851920466c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	FARAH’s kitchen	Tel : 9050 3896	9c41d544-9f4e-4468-87a6-e078af942908	Flat no.15 ground floor, fuk sing factory building, 2 Walnut St, Tai Kok Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:10.33577	2025-10-09 09:49:10.33577	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
d7f1b687-99d1-4230-9a6d-43105d9461ac	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Regala Skycity Hotel, Petra		9c41d544-9f4e-4468-87a6-e078af942908	8 Airport Expo Boulevard, Airport			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:10.402318	2025-10-09 09:49:10.402318	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
0ceb9ffd-b29b-4312-b2da-71990ec96970	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Loi Chan Frozen Meat Company	Tel : 9095 4543	9c41d544-9f4e-4468-87a6-e078af942908	Mui Wo Chung Hau St, Mui Wo			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:10.467489	2025-10-09 09:49:10.467489	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
3d68b169-61e0-4cd7-92ad-8b67514e3fa6	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	The Peninsula Hong Kong		9c41d544-9f4e-4468-87a6-e078af942908	The Peninsula Hong Kong			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:10.534575	2025-10-09 09:49:10.534575	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
85a84cec-94f5-4e81-be9a-17d59deec191	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Mr. BBQ	Service options:  Good for watching sport	9c41d544-9f4e-4468-87a6-e078af942908	1/F, Surson Commercial Building, 140-142 Austin Rd, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:10.603863	2025-10-09 09:49:10.603863	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
58d651f9-de9e-4ba2-85f0-6109b4d37c09	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Nina hotel Island South ION*	Tel: 3968 6661	9c41d544-9f4e-4468-87a6-e078af942908	P3/F, Nina Hotel Island South, 55 Wong Chuk Hang Rd, Aberdeen\t3968 6661\tInternational Ocean Park Marriott Hotel   Marina Kitchen, Marina Wing, 18			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:10.669938	2025-10-09 09:49:10.669938	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
4832e306-11cc-4af3-b445-c1fc288822f4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Onion Hub		9c41d544-9f4e-4468-87a6-e078af942908	Shop A4, G/F, 96 Electric Rd, Tin Hau			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:10.73719	2025-10-09 09:49:10.73719	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
dcb9e990-d57c-460b-b9a9-040894f11faf	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Team River Corporation Limited:	Tel : 6531 6910	9c41d544-9f4e-4468-87a6-e078af942908	Western Wholesale Food Markets, Shop B61, 8 Fung Mat Road, Sai Wan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:10.803471	2025-10-09 09:49:10.803471	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
de0d556e-6e3b-4ab4-b529-b16d5e81e255	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Dorsett Tsuen Wan	Tel : 3996 6338	9c41d544-9f4e-4468-87a6-e078af942908	Dorsett Cafe, 28 Kin Cheung St, Kwai Chung			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:10.869559	2025-10-09 09:49:10.869559	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
95ae60a0-2719-445a-96c8-e98c1951e42b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	My Mart	Tel : 2321 8133	9c41d544-9f4e-4468-87a6-e078af942908	188 Wan Chai Rd, Wan Chai			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:10.940064	2025-10-09 09:49:10.940064	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b07339fd-dc70-4318-8c6d-cb90b5fd7d48	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Global Fine Foods Limited	Tel : 2687 6884	9c41d544-9f4e-4468-87a6-e078af942908	Wah Sang Industrial Building, 14-18 Wong Chuk Yeung St, Fo Tan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:11.021217	2025-10-09 09:49:11.021217	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b2708502-4711-4344-9f7c-57074fbcdca5	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Habib's	Tel : 2493 4000	9c41d544-9f4e-4468-87a6-e078af942908	Causeway Bay, Electric Rd, 83號Ground floor			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:11.087715	2025-10-09 09:49:11.087715	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
9756e4c2-0e40-49f2-b026-51ea377ea30e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Whu Zhi Beef noodles		9c41d544-9f4e-4468-87a6-e078af942908	Shop A2, G/F, 298 Hennessy Road, Wan Chai 灣仔軒尼詩道298號地下A2號舖			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:11.1541	2025-10-09 09:49:11.1541	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
a852fbbd-e67f-4a7a-96cd-945cdf5add2e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Onion Hub	Tel :  5919 8960\nHappy-hour food · Vegetarian options · Live music	9c41d544-9f4e-4468-87a6-e078af942908	Shop A4, G/F, 96 Electric Rd, Tin Hau			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:11.22217	2025-10-09 09:49:11.22217	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
e5c723cb-71d8-4f03-9a25-7d70ebfc101e	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Halalian Store	Tel :  2350 2022	9c41d544-9f4e-4468-87a6-e078af942908	Chun Fook Mansion, Hillwood Rd, Tsim Sha Tsui			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:11.288417	2025-10-09 09:49:11.288417	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
e49065ca-11f4-4442-aec0-635fa5a2c7d2	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 3514 5112	9c41d544-9f4e-4468-87a6-e078af942908	Shop 2107, 2/F, MOSTown, 18 On Luk Street, Man On Shan			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:11.354339	2025-10-09 09:49:11.354339	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8e0915a3-1ae8-4248-b54b-3f7c6f4ccb30	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	KFC	Tel : 2637 2289	9c41d544-9f4e-4468-87a6-e078af942908	Shop 124A-126A, 1/F, Fortune City One, City One Shatin, Shatin			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:11.420998	2025-10-09 09:49:11.420998	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
cbeece33-350e-4c54-91b0-9795116651e2	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Dilliwale	Tel : 60734268	9c41d544-9f4e-4468-87a6-e078af942908	9F, Kyoto Plaza, 491-499 Lockhart Rd, Causeway Bay			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:11.488902	2025-10-09 09:49:11.488902	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
28389d53-1e6f-406d-907d-a7968580ba6f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Mamtom	Service options: Has outdoor seating	9c41d544-9f4e-4468-87a6-e078af942908	Unit 1-6, 45 & 46, G/F, Wing On Plaza, 62 Mody Rd, TST			\N	\N	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:49:11.5553	2025-10-09 09:49:11.5553	\N	approved	\N	\N	\N	draft	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
93172f08-588b-4aba-ab38-680d46a88453	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	CUHK Prayer Room		17fc0986-d8a3-4ff6-ac34-5a193ab1c444	G24, Fung King Hey Building			22.27932780	114.16281310	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-09 09:48:44.527709	2025-10-09 09:50:16.48	\N	approved	\N	\N	\N	published	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
3d1147b9-7733-40d7-83bb-3f18fd9828c9	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	Islamic Primary School	SUBJECTS & MEDIUM OF INSTRUCTION\n\nEnglish: English language, Mathematics, General Studies, Art, P.E., Computer Studies, Music, Religious Studies Chinese: Chinese language, Putonghua\n\nCONTACT ADDRESS\n\nAddress: Estate Primary School No. 1 Yau Oi Estate Phase 1A Tuen Mun NT, Tuen Mun (屯門), New Territories Phone/Fax: 24502270 Fax: 26186424 Email: mail@islamps.edu.hk	9c41d544-9f4e-4468-87a6-e078af942908	友愛邨, 2號 Oi Tak Ln, Tuen Mun	\N	\N	22.38758530	113.97401740	f	\N	\N	\N	{https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/449c6b50-4c76-41f6-b4f0-e26a3db24bb1}	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-10-11 05:03:24.102095	2025-10-11 05:03:45.947	\N	pending	\N	\N	\N	published	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
8d71254d-a7dc-4eee-9591-a11cdfd1bae4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	listing	keychain	keychainkeyychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychainkeychain	16d6cef4-f2d4-4b6f-ba63-ad358b3b99f9	Quarry Bay, Hong Kong	Hong Kong	40100	22.28579500	114.21292020	f				{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-11-26 06:18:43.598985	2025-11-26 06:19:49.73	\N	pending	\N	\N	\N	published	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
4426421a-1dac-4823-bb3d-e2e1be5881ea	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	product	Handfree	Handfree mobile accessories Handfree mobile accessories Handfree mobile accessories Handfree mobile accessories Handfree mobile accessories Handfree mobile accessories Handfree mobile accessories Handfree mobile accessories Handfree mobile accessories Handfree mobile accessories 	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	{}	\N	\N	\N	30.00	1000	\N	\N	\N	\N	0	\N	t	f	2025-10-16 12:12:07.515788	2025-10-16 12:12:58.53	\N	pending	\N	\N	\N	published	\N	mobile accessories	cash_only	\N	\N	\N	f	\N	\N	\N	\N
30805d40-ea30-47fa-9ec8-1bd693cd4392	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	product	Mobile phone 	Mobile phone Mobile phone Mobile phone Mobile phone Mobile phone Mobile phone Mobile phone Mobile phone Mobile phone Mobile phone Mobile phone Mobile phone 	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	{}	\N	\N	\N	100.00	999	\N	\N	\N	\N	0	\N	t	f	2025-10-09 10:58:20.674319	2025-10-09 10:58:41.011	\N	pending	\N	\N	\N	published	2025-10-17 05:01:48.454	Smart devices	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ef24b4c4-502d-42cc-b802-1c90fae0b575	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	product	WATER BOTTLE		\N	\N	\N	\N	\N	\N	f	\N	\N	\N	{}	\N	\N	\N	45.00	1000	\N	\N	\N	\N	0	\N	t	f	2025-10-17 06:48:28.881557	2025-10-24 06:14:12.204	\N	pending	\N	\N	\N	published	\N		combo	90	10	1.00	f	\N	\N	\N	\N
b2860007-d99d-44ea-b42b-0704a3ed8ad0	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	product	Water bottle		\N	\N	\N	\N	\N	\N	f	\N	\N	\N	{}	\N	\N	\N	20.00	1000	\N	\N	\N	\N	0	\N	t	f	2025-10-17 05:05:34.007484	2025-10-17 06:08:33.243	\N	pending	\N	\N	\N	published	2025-10-17 06:27:02.016	product	cash_only	\N	\N	5.00	f	\N	\N	\N	\N
3d65c8d6-4a29-468e-bb0e-97525cc55f26	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	event	frrfrfrfrfrdeec`1	feeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee	\N	hong kong	\N	\N	22.34921550	114.18579780	f	\N	\N	\N	{/objects/uploads/171ed9b4-bff1-41fd-bd12-3ee941a09792}	\N	\N	\N	\N	\N	\N	2025-10-30 19:23:00	\N	\N	1	\N	t	f	2025-10-30 07:03:24.092357	2026-01-08 05:53:02.014	\N	pending	\N	\N	\N	published	\N	\N	cash_only	\N	\N	\N	f	\N	2	2.50	\N
6ec32337-b45a-429b-8825-2aba4e53e258	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	product	Mouse		\N	\N	\N	\N	\N	\N	f	\N	\N	\N	{}	\N	\N	\N	55.00	2000	\N	\N	\N	\N	0	\N	t	f	2025-10-22 10:40:37.366929	2025-10-30 07:18:46.432	\N	pending	\N	\N	\N	rejected	2025-10-22 10:47:53.353	Smart devices	cash_only	\N	\N	5.00	f	\N	\N	\N	\N
87fd157a-acec-488b-bf0b-196c00b8ba20	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	product	laptop	dell i7 \n10thgen\n8ram \n256ssd	\N	\N	\N	\N	\N	\N	f	\N	\N	\N	{/objects/uploads/ea62ea57-9d7e-491f-a517-9bb42824333b}	\N	\N	\N	230.00	289	\N	\N	\N	\N	0	\N	t	f	2025-10-11 09:58:42.369544	2025-11-25 08:01:16.544	\N	pending	\N	\N	\N	published	\N	laptop	cash_only	\N	\N	\N	f	\N	\N	\N	\N
e26f59f8-50f5-40fe-9949-525fdea8b49f	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	product	water bottle		\N	\N	\N	\N	\N	\N	f	\N	\N	\N	{}	\N	\N	\N	45.00	997	\N	\N	\N	\N	0	\N	t	f	2025-10-17 06:28:01.472577	2025-10-17 06:38:05.895	\N	pending	\N	\N	\N	published	2025-10-17 06:46:35.471		cash_only	\N	\N	5.00	f	\N	\N	\N	\N
dfa181ef-64d6-46ad-a0e6-a9c73bc51f7a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	listing	key chain	key chain key chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chain	16d6cef4-f2d4-4b6f-ba63-ad358b3b99f9	Quarry Bay, Hong Kong	Hong Kong	40100	22.28579500	114.21292020	f	3447728877			{https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/7de55308-1fbe-4aba-ab64-6879afd47406?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=heimdall-production%40replit-user-deployments.iam.gserviceaccount.com%2F20251126%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20251126T064723Z&X-Goog-Expires=899&X-Goog-Signature=9c82f3c5149a5ab566970b02df7bdebf85e14c05ac8d190538bb2499b47f55157a8ef2b78f01e57420f67eecbf906d4f2a7f24ad56488faf601b30e24a8eb01a988a21e0c0673da10afbe0f7a68efc0f852e65e1f2cd3cd1e720fac51c4bb58f7102996665ffd32c4a53e199ef63eb3a49f47036b823ac3fa27cf8f89bd49b965560fd91a07a19a11415fdb8187899c19145d6d17730a19d3c54e1eda00611fb33849be3cf80f6ab69d3208927e607c45bd9f7aa42d8785662d9b453c0ff12c2cb0a9b76004ff2bb3a521a7029c893d6ed6b980576cc4ad31f1361c77bfb060bfa5b18357b5bf5f33c62f8064b7a0a3c33f1c414c504a25dfbdffccfb8722a55&X-Goog-SignedHeaders=host,https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/717083b9-70f1-4e1b-b419-99834062ca95?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=heimdall-production%40replit-user-deployments.iam.gserviceaccount.com%2F20251126%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20251126T064810Z&X-Goog-Expires=899&X-Goog-Signature=a086b28f26523d5b59ed921c0f0c7b57bf61c69601d98ebddfc4017d53279056023f29def2a16008325e8ba5fa8dae931db5de7113fde638ef4cfdce11403b2defa4a02429754432419d4257d4ba04e29aec87ea7db606a66bc1be9579db0c3cc51d817384162e269155ef7185b4575fa51f993d7c635cad15fa77cf138c0a278e7ae6fa34f3042b0412f4f1349b8be38815b86d124bf9130c673b45f016b7cc3a3239442448d76fa99872bdef6aa818b1963e1bd5f46ee82a4d3636f705bdba50da47bae9b5d7b46a6e26c4bb32287633ae7e30953a2ea990fab5217aca58a55dde6e60917ebb2e705b6fdae74f90c531ab7fd420072efeac2d38a588e1afdb&X-Goog-SignedHeaders=host}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-11-26 06:48:18.935258	2025-11-26 11:08:19.357	\N	pending	\N	\N	\N	rejected	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
31fc5c31-ac94-465a-a2a8-c97f3d238ef2	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	listing	key chain	key chain key chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chain	16d6cef4-f2d4-4b6f-ba63-ad358b3b99f9	Quarry Bay, Hong Kong	Hong Kong		22.28579500	114.21292020	f	+852 9876 5432	test@gmail.com	ddcbwe.com	{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-11-26 06:22:03.731958	2025-11-26 06:58:07.696	\N	pending	\N	\N	\N	published	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
562562b4-4aac-48a7-897e-8818cc1da59b	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	listing	key chain 	key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain 	16d6cef4-f2d4-4b6f-ba63-ad358b3b99f9		Hong Kong	40100	\N	\N	f	+852 9876 5432			{https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/28b718bf-0bcd-47f7-8f22-b773c670e68c?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=heimdall-production%40replit-user-deployments.iam.gserviceaccount.com%2F20251126%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20251126T070329Z&X-Goog-Expires=899&X-Goog-Signature=58e99058cf39f263f1da8e87528a6b33ee9d6ae178cdb34abf92a806daf0e384c50a7a5f48762e7698f3d3b529d56151792bb713a34e0ac965d5ba8e63ff7bc9fbc01ba08cd5883bdb62520e622096aa1903ff54f0ca14421522889ca1bab4cbd968bebf0c0e4442ba2584e5bf01643861e3a68a6a6ac8d204e125dcf49d5078870c0efefda6e70ba6971ad157d7eed477596ed122758d84eae60e8f19bc82f1552f2c836a23acffb1ee353b27915f554a2abebd235501434e91592fe1aa3f4e0061a65db1fa71a35fbe7acd3942abf3736745fecfb0a313e3243c404b2a652f0c872ccf0c77f0042f299e966f607887d0964708af708de6425e8db4acd8d9dd&X-Goog-SignedHeaders=host}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-11-26 07:03:35.387174	2025-11-26 11:08:32.805	\N	pending	\N	\N	\N	rejected	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b22348b2-8033-4205-b99d-524e5d444076	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	listing	key chain	key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain 	16d6cef4-f2d4-4b6f-ba63-ad358b3b99f9	Quarry Bay, Hong Kong	Hong Kong	40100	22.28579500	114.21292020	f	+852 9876 5432			{https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/777f7b26-fac9-4991-97e6-caf60a1d531b?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=heimdall-production%40replit-user-deployments.iam.gserviceaccount.com%2F20251126%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20251126T065644Z&X-Goog-Expires=899&X-Goog-Signature=8d4ee49997726a4a19fcd7bca7203c8a2979645a107d8dd68b5e7f532ee34f78a4618bbb552266c4819e11bd65e50f7fcda06d848ef37097d7d09a286f248e229294d50442e3a57918dc35ab0b98463aa0ef0d09ff0860c9988e8fde75bba980c614fe6a1c1e32e5eb61ac70ecc1b51c355412febd7bd32b51bdbcf47d434b4afba37bdb13ecf7848166d27680ec4d5097949ff0b3739e0dd3c666fed3de06e812518d7d91e97c606b35dbc2060ecc6d19b3bef1bdefccf6ab0cc37b7e19e27e42cd810d04fa85ff0eab69bf6f43e0d3da2f49937d169cd0e20dcfe637f1021216a6d413110b27e335be09f8186867663bdd2e39726d85fc081876916a1b9af6&X-Goog-SignedHeaders=host}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-11-26 06:56:57.692916	2025-11-26 11:08:26.859	\N	pending	\N	\N	\N	rejected	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ebcaaad4-84e3-4d43-af59-8eb9a3428a12	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	listing	key chain 	key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain 	16d6cef4-f2d4-4b6f-ba63-ad358b3b99f9	Quarry Bay, Hong Kong	Hong Kong	40100	22.28579500	114.21292020	f	+852 9876 5432			{}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-11-26 07:07:33.409984	2025-11-26 11:08:37.221	\N	pending	\N	\N	\N	rejected	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
c377fc46-df81-4ecd-a5b4-e638c4af7fdd	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	listing	key chain 	key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain 	16d6cef4-f2d4-4b6f-ba63-ad358b3b99f9	Quarry Bay, Hong Kong	Hong Kong		22.28579500	114.21292020	f	+852 9876 5432			{https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/19fe1176-4581-4bdc-b5f1-90c237bc15da?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=heimdall-production%40replit-user-deployments.iam.gserviceaccount.com%2F20251126%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20251126T070853Z&X-Goog-Expires=899&X-Goog-Signature=2cda9a9855ab2d5dff418e1d4702c07a3fced4e52afa91a7b9590e37577cb33c21050ce1096215c78cb209d0741afc64850e10e6632c27161dde138574c786962d40a4eaf9cf4f0ff97ac3da08f8ec26d79c84a2c91bf02e6bd9570385fb0a4432d5c23466e5a3d3a1979f416034f8ca11e1943043c86864d1396980fd9fc2c0a7d9794926e25639d3b39e68fc83f8f10c63ff424c1b43481954bf334e8d77272f8495ead36741814015b85ccf8390b2d5693ded4b2583858958ad31f0d7f98d701dbccea8e9ac36b57595eec60623d15337ad3db89ffdbeba28cdb9b1b45aa403acf2f98a9b6f99c1364007aa5857a47e1a89845777f5abf09c589d68d2fe83&X-Goog-SignedHeaders=host}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-11-26 07:09:00.913731	2025-11-26 11:08:38.871	\N	pending	\N	\N	\N	rejected	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
ccc45838-3e97-40de-aabc-fc5bdfe33620	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	listing	key chain 	key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain 	2766aa77-265d-4aab-925a-14023f8fc703	Quarry Bay, Hong Kong	Hong Kong		22.28579500	114.21292020	f	+852 9876 5432			{https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/717165ce-4716-496c-972b-3459e17177ed?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=heimdall-production%40replit-user-deployments.iam.gserviceaccount.com%2F20251126%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20251126T072143Z&X-Goog-Expires=899&X-Goog-Signature=a324582e9753abfb1e0539f6437d54041a9149263cf893e48810c8803785395020656b5bccd8fa53693539a3a449d45bde662cbb8dc3958cf7264a775a9af806f98bfdccc0c9b4aa1c33aab7ae2b167632ca9fcbb4f9c90cf2ea0cfb2b7d2ef16360cb6153f8885e33c76c89684791efa4e480176631f84cd5db0a140cc2285405d530d241706de325ade3c61374a73cbd91cade68dd69b73483408bf3d7fb351ac4cbbcf85457c8997ed5213ecce565ecb28fe8844460b3211cbe2141417bd0bc1f300d93857ad883b9f7715dd6918e579f0866cc2826638c0944ab43ffa7d90f1e0de6fd0efe48fe8fc68a66562eb371e62c63500cbef66386225123608a8f&X-Goog-SignedHeaders=host}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-11-26 07:21:50.452263	2025-11-26 11:08:42.078	\N	pending	\N	\N	\N	rejected	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
375f16b3-29e4-428d-b6ff-e7632e986212	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	business	key chain 	key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain 	16d6cef4-f2d4-4b6f-ba63-ad358b3b99f9	Quarry Bay, Hong Kong	Hong Kong	40100	22.28579500	114.21292020	f	+852 9876 5432			{https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/5c3fc368-15cb-4d30-8e4f-e312dd19ebb5?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=heimdall-production%40replit-user-deployments.iam.gserviceaccount.com%2F20251126%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20251126T072413Z&X-Goog-Expires=899&X-Goog-Signature=81d1b65201b7d89e083b6a07755cdce4aff2697275359bf9e882be68a40bfaad497d1653691de5d4ede332988326f24258aa3fef43fb258a1210a1ca7e8a3fc198c6ee2fa3e73fda980aea02de739e8d692461af4f54df3f3716ef9643c957e25d97535f9a64920f34e161531d65ebe312b5b662f234ec8e4b8775bc7e5146c46147bfcf1ddff2c3a3c888902854dcd4d351bb123ebd0bcce70de70ea72b7ee7489cc8e1b3ec391aa19a735aaca1b77bddbfb5dd74b171f33b892a23347292573d5f41119633cc4dbddb5929412f1ad128aa7fb6bd24c2462a564d86c3ce48b39db5233638036036a74dbb6a41dd23a66a8949c5718217d3d9ee9389015dca91&X-Goog-SignedHeaders=host}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-11-26 07:24:20.14835	2025-11-26 07:26:25.956	\N	pending	\N	\N	\N	published	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
edd7e24e-e421-46f0-acaa-0016bf0da2e6	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	service	key chain 	key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain 	dcfce550-f202-4aec-819c-93e18e44f05a	\N	\N	\N	\N	\N	f	\N	\N	\N	{/objects/uploads/4da5007f-c060-4b17-baa6-e45ac0cedef6}	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-11-26 08:06:43.588076	2025-11-26 08:07:47.582	{td}	pending	\N	\N	\N	published	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
cc53376b-0fa8-487a-9657-6c52331a30e1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	event	Event managment	Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event swdwsw	\N	hong kong	\N	\N	22.34921550	114.18579780	f	\N	\N	\N	{/objects/uploads/aaaec2de-1c9d-4b92-9492-c866f20df66a}	\N	\N	\N	\N	\N	\N	2025-12-05 03:22:00	\N	221	7	\N	t	f	2025-11-26 10:03:39.648831	2026-01-08 07:48:40.328	\N	pending	\N	\N	\N	published	\N	\N	timedollar_only	\N	\N	\N	f	\N	1	0.50	{"price": null, "title": "Event managment", "images": ["/objects/uploads/aaaec2de-1c9d-4b92-9492-c866f20df66a"], "address": "hong kong", "website": null, "capacity": 32323, "eventDate": "2025-12-05T08:22:00.000Z", "inventory": null, "eventHours": "2.50", "eventPrice": null, "description": "Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event Add New Event swdwsw", "paymentType": "timedollar_only", "eventTdPrice": 1, "isOnlineOnly": false}
0e206695-7304-462b-8cc9-6fe31fcecd93	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	listing	key chain	key chain key chain key chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chainkey chain	16d6cef4-f2d4-4b6f-ba63-ad358b3b99f9	Quarry Bay, Hong Kong	Hong Kong	40100	22.28579500	114.21292020	f	+852 9876 5432			{https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/f1a8da3e-a9b8-436f-8ca2-7019e714be16?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=heimdall-production%40replit-user-deployments.iam.gserviceaccount.com%2F20251126%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20251126T065148Z&X-Goog-Expires=899&X-Goog-Signature=38eb023db2eaf7931d2abe8346cd71a28865dacbf6675e13d611c08c5e7a3d79230858fab7a88649ab7700a4dd15821073d6c974023c73ad97b5b1fe3c7d0f3465945bdf38f2709505c23b435fdb1bc291eaf240f1bbb40bcac1bf2b3ee3d24bb9c50bddde49fadbb52240ba45ac31743d4ba986cb03b0a3586156c73142da72f7d53c1dc7a1d7784ba13493b22b2b3cd3e89678eed9f402bc8076dee4a681a4be20216f518fec50623f6679fd68dc084713de8c32219eb3a89155af03869f767117213a2c4136ad0249d83eb67db37354b459f1e2441ebbced57f6a8784cfb3d239512baad67203a9115d717ebc5e814900a24d95f6152ec39e76b2426f6ff8&X-Goog-SignedHeaders=host}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-11-26 06:51:57.569263	2025-11-26 11:08:23.111	\N	pending	\N	\N	\N	rejected	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
b508163d-1276-4832-9339-b8e1fe6a5ad9	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	listing	key chain 	key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain key chain 	16d6cef4-f2d4-4b6f-ba63-ad358b3b99f9	Quarry Bay, Hong Kong			22.28579500	114.21292020	f	+852 9876 5432			{https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/a7eb44bc-8cb9-405c-96f0-467140602dc0?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=heimdall-production%40replit-user-deployments.iam.gserviceaccount.com%2F20251126%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20251126T071148Z&X-Goog-Expires=899&X-Goog-Signature=68574530a4091dfe955ade0e826f37ee6c7dc44c10462fc759cf0570043d4eec97bbd5e33a6307ef234bf1d22560531c8eaf0473f434d6d51c288bbd0bf00893da7c7855cdd74cd3083f1adcaf3e4de6bf02a6340ece6393feb91cb859eefbc75f5e344bcf2254593bfd98ca3759c756dcabfffe77d2623b6d78c119d6f56e6e3dcaa6e9364f3cba8b9eb2d1f19793f7c7b0a17dc8889910a5a936c976c14884c9b197a0e4d14b51f378b74586ac2af06702ca7dba84c2d93829987248e84b812d14a5beea2575f51607b87382d24d9546ff8fe4050d2c10943fbe36ba55383cda3d860f59aed7fa0fb2273997a5bb1a51841f85bb10d2bbadfb48a32f6b769e&X-Goog-SignedHeaders=host}	\N	{}	\N	\N	\N	\N	\N	\N	\N	0	\N	t	f	2025-11-26 07:11:55.893616	2025-11-26 11:08:40.502	\N	pending	\N	\N	\N	rejected	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
14a1e8f2-44eb-421d-b87a-13c425911ff0	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	event	emchubevent	emchubeventemchubeventemchubeventemchubeventemchubeventemchubeventemchubeventemchubeventemchubeventemchubeventemchubeventemchubeventemchubeventemchubeventemchubeventemchubevent	\N	hong kong	\N	\N	22.27929680	114.16289070	f	\N	\N	\N	{/objects/uploads/f8d81092-44d6-4d8e-9e03-e59f80b45fb9}	\N	\N	\N	\N	\N	\N	2025-12-27 09:23:00	\N	\N	1	\N	t	f	2025-12-26 13:50:35.300952	2025-12-26 13:53:15.895	\N	pending	\N	\N	\N	published	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
6e3a16d8-ee8d-4d41-a012-b0ae18e97333	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	event	testing event	testing eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting eventtesting event	\N	hong kong	\N	\N	22.27929680	114.16289070	f	\N	\N	\N	{/objects/uploads/80c7432f-457a-469e-916c-c8bcd41ae5ec}	\N	\N	\N	\N	\N	\N	2025-12-31 06:11:00	\N	\N	1	11.00	t	f	2025-12-29 07:36:11.651072	2025-12-29 07:40:36.285	\N	pending	\N	\N	\N	published	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
3fdfe925-b41d-492d-92b3-240a19c195a1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	event	New test event	New test eventNew test eventNew test eventNew test eventNew test eventNew test eventNew test eventNew test eventNew test eventNew test eventNew test eventNew test eventNew test eventNew test eventNew test eventNew test event	\N	hong kong	\N	\N	22.27929680	114.16289070	f	\N	\N	\N	{/objects/uploads/40389923-e2ba-4ff1-b38a-3e855f917da4}	\N	\N	\N	\N	\N	\N	2025-12-31 10:22:00	\N	\N	1	10.00	t	f	2025-12-29 07:44:23.907709	2025-12-29 07:46:24.134	\N	pending	\N	\N	\N	published	\N	\N	cash_only	\N	\N	\N	f	\N	\N	\N	\N
f8432326-71f8-4934-8c32-b73365fb7cbe	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	event	Testing event 	Testing event  Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event 	\N	hong kong	\N	\N	22.34921550	114.18579780	f	\N	\N	\N	{/objects/uploads/5495895a-8162-488d-a0eb-49f4c0960962}	\N	\N	\N	\N	\N	\N	2025-11-01 04:22:00	\N	\N	3	\N	t	f	2025-10-30 07:18:15.623299	2026-01-08 05:53:04.36	\N	pending	\N	\N	\N	published	\N	\N	cash_only	\N	\N	\N	f	\N	2	2.00	{"price": null, "title": "Testing event ", "images": ["/objects/uploads/5495895a-8162-488d-a0eb-49f4c0960962"], "address": "hong kong", "website": null, "capacity": null, "eventDate": "2025-11-01T09:22:00.000Z", "inventory": null, "eventHours": null, "eventPrice": null, "description": "Testing event  Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event Testing event ", "paymentType": "cash_only", "eventTdPrice": null, "isOnlineOnly": false}
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, conversation_id, sender_id, sender_role, message, is_read, created_at) FROM stdin;
c3b9d663-7f87-48e5-a47a-df7731dd4f42	66f55a99-15cb-495c-9820-8d5ce29b1d30	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	vendor	hi	t	2025-10-24 08:00:15.407165
3651918a-a98f-4a8e-b8b4-b3307867eedb	66f55a99-15cb-495c-9820-8d5ce29b1d30	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	vendor	by	t	2025-10-24 08:00:43.176755
14120e12-db55-4398-8ea8-0295d4e26088	66f55a99-15cb-495c-9820-8d5ce29b1d30	3f7ec0b2-bddd-4276-ae29-383b66b94421	customer	hi	t	2025-10-24 08:00:51.467678
510cbb2f-9e40-4eb4-88b6-f2ee937614b5	66f55a99-15cb-495c-9820-8d5ce29b1d30	3f7ec0b2-bddd-4276-ae29-383b66b94421	customer	hi	t	2025-10-24 08:01:30.257815
ff468e28-e877-49c9-8e6a-55e5e8da1eca	66f55a99-15cb-495c-9820-8d5ce29b1d30	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	vendor	phr sy hi	t	2025-10-24 08:01:45.119346
a127387d-01b4-4777-8ec6-f3c101505828	66f55a99-15cb-495c-9820-8d5ce29b1d30	3f7ec0b2-bddd-4276-ae29-383b66b94421	customer	ni chye product	t	2025-10-24 08:02:06.969205
857c1e39-ffcd-4876-a4d3-c905d54f2b95	66f55a99-15cb-495c-9820-8d5ce29b1d30	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	vendor	hi	t	2025-10-24 10:17:35.72706
79cc70c2-3bb0-4a8f-8eeb-3314fc9eae73	e6011945-301a-47c2-9030-525788eb86b7	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	customer	hi	t	2025-10-27 10:32:05.378052
ecf98404-a931-4931-8deb-a819fc37a302	e6011945-301a-47c2-9030-525788eb86b7	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	vendor	yes	t	2025-10-27 10:32:57.014258
06790f6e-9601-4913-aeb2-1b3cf969266b	e6011945-301a-47c2-9030-525788eb86b7	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	customer	i need some help	t	2025-10-27 10:33:06.875502
0855b329-be23-46a1-a782-2dbfe498f475	e6011945-301a-47c2-9030-525788eb86b7	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	vendor	how can i help you?	t	2025-10-27 10:33:18.828242
53a31473-8acc-4d35-831b-d3b68d7993cd	41f3d05e-fa2b-462d-b964-17ed75118f43	3f7ec0b2-bddd-4276-ae29-383b66b94421	customer	hi	t	2025-11-25 07:50:23.025367
26a9a102-9287-4146-92b8-8a7e5bdaa57f	41f3d05e-fa2b-462d-b964-17ed75118f43	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	vendor	yes	t	2025-11-25 07:50:57.475671
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, product_title, product_price, quantity, subtotal, created_at) FROM stdin;
03af137d-ef77-4c9d-a8ee-e15ef238fdd4	990b9083-28ed-49cc-9db5-725e516b85b8	ef24b4c4-502d-42cc-b802-1c90fae0b575	WATER BOTTLE	45.00	1	45.00	2025-10-23 05:19:20.012375
8fde0a22-a76e-4be9-ab24-709acc9c148f	dc5ff50d-7854-4ae1-a611-f82643a8d3aa	ef24b4c4-502d-42cc-b802-1c90fae0b575	WATER BOTTLE	45.00	1	45.00	2025-10-24 06:29:35.4952
7743e3fd-03f0-4516-bc72-c4bbf6cebd3e	5c8b004c-0bab-4630-bbdb-0eefc102876a	ef24b4c4-502d-42cc-b802-1c90fae0b575	WATER BOTTLE	45.00	1	45.00	2025-10-27 10:30:21.779944
13e161d9-7e1e-4eea-9781-e708b4689153	22d4fdc5-ec33-46a8-acdb-a8f66c46025c	4426421a-1dac-4823-bb3d-e2e1be5881ea	Handfree	30.00	1	30.00	2025-11-26 06:10:43.036881
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, user_id, total_amount, status, payment_method, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_postal_code, notes, created_at, updated_at, shipping_email, cash_amount, td_amount, transaction_id, coupon_id, coupon_code, coupon_cash_discount, coupon_td_discount, vendor_id) FROM stdin;
990b9083-28ed-49cc-9db5-725e516b85b8	3f7ec0b2-bddd-4276-ae29-383b66b94421	45.00	delivered	cash							2025-10-23 05:19:19.943174	2025-10-23 05:44:12.016		45.00	0.00	TXN-1761196759908-5I3UFPJI8	\N	\N	0.00	0.00	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225
dc5ff50d-7854-4ae1-a611-f82643a8d3aa	3f7ec0b2-bddd-4276-ae29-383b66b94421	45.00	confirmed	timedollar	dde	33434324324	dedede		4324		2025-10-24 06:29:35.426375	2025-10-27 10:30:46.031	frfrf@gmail.com	0.00	0.75	TXN-1761287375390-UTO9CEWHR	\N	\N	0.00	0.00	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225
5c8b004c-0bab-4630-bbdb-0eefc102876a	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	45.00	shipped	timedollar	test	3793074034	Dubai Silicon Oasis	Dubai	342001		2025-10-27 10:30:21.71215	2025-10-27 12:03:24.268	test@gmail.com	0.00	0.75	TXN-1761561021676-QFXZ5CTTH	\N	\N	0.00	0.00	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225
22d4fdc5-ec33-46a8-acdb-a8f66c46025c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	30.00	pending	cash							2025-11-26 06:10:42.967672	2025-11-26 06:10:42.967672		30.00	0.00	TXN-1764137442931-VN30WS44M	\N	\N	0.00	0.00	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, user_id, listing_id, vendor_id, rating, comment, created_at, updated_at, images) FROM stdin;
\.


--
-- Data for Name: saved_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.saved_items (id, user_id, listing_id, created_at) FROM stdin;
\.


--
-- Data for Name: service_offers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_offers (id, service_request_id, service_name, price, hours, status, payment_intent_id, created_by, created_at, updated_at) FROM stdin;
e4cff637-54b5-449d-b4e5-e8e19a93ef8b	2e9fd933-6c35-4d84-be2b-dd4215a3a4c4	uploading lisitngs	100.00	1.00	paid	pi_3SXzoHFE8EnxDnui1KaVYOhn	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	2025-11-27 06:50:00.162063	2025-11-27 07:40:15.413
9960b3a1-8132-4bd3-8b6d-1e789a5ca390	2e9fd933-6c35-4d84-be2b-dd4215a3a4c4	uploading lisitngs	322.00	4.00	paid	pi_3SY0I9FE8EnxDnui0jGzlZAh	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	2025-11-27 08:09:55.04168	2025-11-27 08:11:07.083
313ed3dd-c656-4557-9153-5e90575c25f9	640b5f76-ad53-418c-ad10-43a0ed908f89	import multiple lisitngs	250.00	1.00	paid	pi_3SY2XUFE8EnxDnui0La3ya8i	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	2025-11-27 10:22:04.819525	2025-11-27 10:35:06.611
9de3b0c8-dc00-49a8-9e35-8d9b42b10612	99923a5b-7b56-49f1-b72e-98c5335ec444	error	5.00	1.00	paid	pi_3SY3XzFE8EnxDnui1FhtYooY	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	2025-11-27 11:20:55.600834	2025-11-27 11:39:41.874
e54e7d1c-e8f5-4eee-8c6f-5f034082e494	9f23907b-94ec-4f08-b833-8ccb8279d781	join event	120.00	2.00	paid	pi_3SnCxIFE8EnxDnui1MUtIQC1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	2026-01-08 06:03:53.593091	2026-01-08 06:44:27.379
\.


--
-- Data for Name: service_request_fees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_request_fees (id, service_request_id, service_offer_id, user_id, fee, status, stripe_payment_intent_id, stripe_charge_id, currency, created_at, updated_at) FROM stdin;
09a907b8-221b-4d2a-adca-40bb96d88aa0	2e9fd933-6c35-4d84-be2b-dd4215a3a4c4	e4cff637-54b5-449d-b4e5-e8e19a93ef8b	573af9ce-5c72-4e7e-8289-79f4f0071215	100.00	completed	\N	\N	hkd	2025-11-27 06:50:00.162063	2025-11-27 10:10:38.074019
4929c951-72a2-471b-af29-be8de806937e	2e9fd933-6c35-4d84-be2b-dd4215a3a4c4	9960b3a1-8132-4bd3-8b6d-1e789a5ca390	573af9ce-5c72-4e7e-8289-79f4f0071215	322.00	completed	\N	\N	hkd	2025-11-27 08:09:55.04168	2025-11-27 10:10:38.074019
86aeb728-14db-4026-b1dc-3b58ce8233f2	640b5f76-ad53-418c-ad10-43a0ed908f89	313ed3dd-c656-4557-9153-5e90575c25f9	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	250.00	completed	pi_3SY2XUFE8EnxDnui0La3ya8i	\N	hkd	2025-11-27 10:35:06.77894	2025-11-27 10:35:06.77894
e8268830-eab7-4be1-b1e3-c05e0c624326	99923a5b-7b56-49f1-b72e-98c5335ec444	9de3b0c8-dc00-49a8-9e35-8d9b42b10612	3f7ec0b2-bddd-4276-ae29-383b66b94421	5.00	completed	pi_3SY3XzFE8EnxDnui1FhtYooY	\N	hkd	2025-11-27 11:39:42.041067	2025-11-27 11:39:42.041067
391bb188-b71e-49d4-b971-0a6ceb6932a6	9f23907b-94ec-4f08-b833-8ccb8279d781	e54e7d1c-e8f5-4eee-8c6f-5f034082e494	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	120.00	completed	pi_3SnCxIFE8EnxDnui1MUtIQC1	\N	hkd	2026-01-08 06:44:27.547155	2026-01-08 06:44:27.547155
\.


--
-- Data for Name: service_request_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_request_messages (id, service_request_id, sender_id, message, attachment_url, created_at, is_read) FROM stdin;
a046c59a-25bf-43c8-b58d-f692aec4f532	0e9da682-8d94-49be-b10f-1b94bd80ef07	3f7ec0b2-bddd-4276-ae29-383b66b94421	hi	\N	2025-11-26 12:01:44.139289	f
4e227e1f-3318-45aa-a12b-0355e32f818f	0e9da682-8d94-49be-b10f-1b94bd80ef07	3f7ec0b2-bddd-4276-ae29-383b66b94421	yes\n	\N	2025-11-26 12:04:02.585631	f
44d2b3cb-e09c-4ef5-9e84-cfaf74ebdb32	5895519d-b724-4031-abc3-d13fea5f09c1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	ye how can i help u	\N	2025-11-27 06:32:33.081326	f
aad71a51-bdd7-4410-9848-223d1203d988	5895519d-b724-4031-abc3-d13fea5f09c1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	hi	\N	2025-11-27 06:32:49.954257	f
12e29dfe-32a3-46d5-bf07-1be85cb07e07	5895519d-b724-4031-abc3-d13fea5f09c1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	hi	\N	2025-11-27 06:37:42.698804	f
23b394f1-acb9-44bc-bfbf-762b1428319e	5895519d-b724-4031-abc3-d13fea5f09c1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	hi	\N	2025-11-27 06:37:50.38283	f
5ac6ee88-a2ca-489a-8073-08eee972733a	2e9fd933-6c35-4d84-be2b-dd4215a3a4c4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	hi	\N	2025-11-27 06:42:58.371745	f
1117feeb-a3d9-45e1-b654-ffa1d5e3effa	2e9fd933-6c35-4d84-be2b-dd4215a3a4c4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	yes	\N	2025-11-27 06:43:07.145277	f
4a33bc37-58f8-4c34-b83b-f612af920f74	2e9fd933-6c35-4d84-be2b-dd4215a3a4c4	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	hi	\N	2025-11-27 06:46:30.896757	f
df1e319a-5c81-4227-8a19-78d3bc8157bc	2e9fd933-6c35-4d84-be2b-dd4215a3a4c4	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	hi	\N	2025-11-27 06:46:47.059776	f
4a9411b7-4a08-4f1e-9451-fb26c05c505d	2e9fd933-6c35-4d84-be2b-dd4215a3a4c4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	yes 	\N	2025-11-27 06:47:34.586682	f
a43f4737-11e9-417d-ba38-95479184ef80	2e9fd933-6c35-4d84-be2b-dd4215a3a4c4	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	OFFER: uploading lisitngs - HK$100 for 1 hours	\N	2025-11-27 06:50:00.234513	f
4ce0b662-709f-4564-8dc6-3f7f81d9f38a	2e9fd933-6c35-4d84-be2b-dd4215a3a4c4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	Payment received for offer: uploading lisitngs - HK$100.00	\N	2025-11-27 07:40:15.580475	f
ae95cc9e-036e-433d-afda-fbf26da974ad	2e9fd933-6c35-4d84-be2b-dd4215a3a4c4	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	OFFER: uploading lisitngs - HK$322 for 4 hours	\N	2025-11-27 08:09:55.115606	f
1fe04e8e-e555-408b-a320-226f3447ef16	2e9fd933-6c35-4d84-be2b-dd4215a3a4c4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	Payment received for offer: uploading lisitngs - HK$322.00	\N	2025-11-27 08:11:07.247872	f
5eea86d3-e050-45c9-a454-1a1a46907a00	640b5f76-ad53-418c-ad10-43a0ed908f89	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	hi how can we help you	\N	2025-11-27 10:20:11.37252	f
b6179781-4ed2-4621-8ec9-6298e9834aaf	640b5f76-ad53-418c-ad10-43a0ed908f89	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	i need one hour service what is the charges	\N	2025-11-27 10:20:34.415231	f
75dd5651-7cc3-4804-ab74-8f4ef18581d5	640b5f76-ad53-418c-ad10-43a0ed908f89	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	what service u need	\N	2025-11-27 10:20:46.740383	f
d9316895-ac10-4951-8c5e-439836d2be18	640b5f76-ad53-418c-ad10-43a0ed908f89	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	i need to import multipe lisitng in websute	\N	2025-11-27 10:21:04.771999	f
f03b4920-b903-49f4-886a-936602836062	640b5f76-ad53-418c-ad10-43a0ed908f89	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	ok price is hk250$	\N	2025-11-27 10:21:28.33125	f
d6774ffc-3a97-4fdd-ab82-d20792228c32	640b5f76-ad53-418c-ad10-43a0ed908f89	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	OFFER: import multiple lisitngs - HK$250 for 1 hours	\N	2025-11-27 10:22:04.888246	f
6a43cbcb-0c67-4900-9ea3-feeba6136eb7	640b5f76-ad53-418c-ad10-43a0ed908f89	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	Payment received for offer: import multiple lisitngs - HK$250.00	\N	2025-11-27 10:35:06.851784	f
e37dcbf2-9894-4faf-ba2d-f32037ff3c75	0e9da682-8d94-49be-b10f-1b94bd80ef07	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	hi	\N	2025-11-26 12:08:23.169748	t
ef36407a-4888-47c9-953e-273c03e01803	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	hi	\N	2025-11-27 11:08:44.936272	t
a1ba9cab-1412-4fd4-80ed-5f3d86e3a393	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	by	\N	2025-11-27 11:09:20.905676	t
d0bf9f7c-e602-47df-9e15-eb13774d56fe	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	OFFER: error - HK$5 for 1 hours	\N	2025-11-27 11:20:55.675632	t
ef9c5347-4a5d-43ff-b24a-dd25f660ec28	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	hi	\N	2025-11-27 11:41:21.331707	t
22c51e7a-9ac8-40bb-a364-7b36165143f8	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	hi	\N	2025-11-27 11:49:28.12519	t
a9b25b94-663e-494a-bd3e-82dd38ca7461	99923a5b-7b56-49f1-b72e-98c5335ec444	3f7ec0b2-bddd-4276-ae29-383b66b94421	hi	\N	2025-11-27 11:20:38.36226	t
1b4a8e9d-521a-4b2b-b20a-973591341403	99923a5b-7b56-49f1-b72e-98c5335ec444	3f7ec0b2-bddd-4276-ae29-383b66b94421	Payment received for offer: error - HK$5.00	\N	2025-11-27 11:39:42.111505	t
5cfa108d-2e4c-4c90-bba4-1b68307c85c1	99923a5b-7b56-49f1-b72e-98c5335ec444	3f7ec0b2-bddd-4276-ae29-383b66b94421	yes	\N	2025-11-27 11:42:31.920297	t
cdb05678-4d64-4e92-8a6d-e17a7d4bff79	99923a5b-7b56-49f1-b72e-98c5335ec444	3f7ec0b2-bddd-4276-ae29-383b66b94421	hi	\N	2025-11-27 11:49:16.954489	t
6d2d8b5f-c6f3-4d46-8cbe-471b62b370ca	99923a5b-7b56-49f1-b72e-98c5335ec444	3f7ec0b2-bddd-4276-ae29-383b66b94421	hi	\N	2025-11-27 11:49:37.935504	t
8e8c5215-72b3-4cb7-ba06-358374ea7f67	99923a5b-7b56-49f1-b72e-98c5335ec444	3f7ec0b2-bddd-4276-ae29-383b66b94421	hi	\N	2025-11-27 11:57:29.418375	t
a8cb4a0d-5b2d-4f65-b216-7ee0960e02ca	0e9da682-8d94-49be-b10f-1b94bd80ef07	3f7ec0b2-bddd-4276-ae29-383b66b94421	hi	\N	2025-11-28 05:49:01.074652	f
77892c48-c54f-4f42-bece-7694e6e10e21	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	kcnodsn	\N	2025-11-28 10:07:57.946142	t
2dbe38a8-f573-40e0-a4cc-a113849973ef	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	yes	\N	2025-11-28 07:52:50.378009	t
2018d6bf-9cd2-4325-b732-73d55496b65d	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	isowcisdm 	\N	2025-11-28 06:35:17.306622	t
afe20e3f-9338-4f73-a309-45a4802c6a57	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	hi	\N	2025-11-27 11:57:43.392639	t
b6c4186b-ad05-4387-81fd-bdb2d3c29abe	0e9da682-8d94-49be-b10f-1b94bd80ef07	3f7ec0b2-bddd-4276-ae29-383b66b94421	udeicnd	\N	2025-11-28 06:44:30.459642	f
9ae032f6-14ce-486f-8670-3c4d6cf46355	0e9da682-8d94-49be-b10f-1b94bd80ef07	3f7ec0b2-bddd-4276-ae29-383b66b94421	khguyuc	\N	2025-11-28 06:49:48.136681	f
3353d03c-908f-4db0-a00c-465403d942ab	0e9da682-8d94-49be-b10f-1b94bd80ef07	3f7ec0b2-bddd-4276-ae29-383b66b94421	DEDEECEC	\N	2025-11-28 06:51:54.131554	f
22a99ce0-0619-4aec-ba3d-26a94431e0f8	0e9da682-8d94-49be-b10f-1b94bd80ef07	3f7ec0b2-bddd-4276-ae29-383b66b94421	GTTTTTTTTTTTTT	\N	2025-11-28 06:55:04.023569	f
2be488b8-0ecc-4018-9fc2-428134a8cda6	0e9da682-8d94-49be-b10f-1b94bd80ef07	3f7ec0b2-bddd-4276-ae29-383b66b94421	DEEEEEEEEEEEEEEEEE	\N	2025-11-28 06:56:53.703438	f
17efe03e-d88f-4863-836e-95e87caec12e	0e9da682-8d94-49be-b10f-1b94bd80ef07	3f7ec0b2-bddd-4276-ae29-383b66b94421	feeeeeeeeeeeeeeeeeeeee	\N	2025-11-28 06:59:50.063788	f
002e03bd-4cb2-4db9-af90-8c6eefaa9e2e	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	hi	\N	2025-11-28 05:41:30.328796	t
c5266a08-6e41-40ce-9ad3-c607e314254a	0e9da682-8d94-49be-b10f-1b94bd80ef07	3f7ec0b2-bddd-4276-ae29-383b66b94421	rrtrtrtrtrrrtrrttrtrtr	\N	2025-11-28 07:16:49.155295	f
dfb5d050-a3d2-491f-896d-cb4c1e8158a3	0e9da682-8d94-49be-b10f-1b94bd80ef07	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	hii	\N	2025-11-28 07:00:40.478599	t
bd2b8874-a889-4d12-b069-3667a001c793	0e9da682-8d94-49be-b10f-1b94bd80ef07	3f7ec0b2-bddd-4276-ae29-383b66b94421	cdcddccdccdc	\N	2025-11-28 07:21:43.118047	f
8a794096-f929-4f4f-9126-123865e25ad4	0e9da682-8d94-49be-b10f-1b94bd80ef07	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	cdcdcd	\N	2025-11-28 07:25:51.056094	t
2b577978-38db-471b-b225-966d964b9219	0e9da682-8d94-49be-b10f-1b94bd80ef07	3f7ec0b2-bddd-4276-ae29-383b66b94421	cfdvfbbbgbgb	\N	2025-11-28 07:25:31.067003	f
dc6f869e-ddb9-4e88-a49f-ce7d3f9e6b18	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	hiiiiiiiiiii	\N	2025-11-28 05:58:59.063445	t
99beb004-9503-44f8-827f-c3183c061815	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	heyyy	\N	2025-11-28 06:08:53.598406	t
cb510aa7-e073-439f-a41d-4e3a4a5b3669	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	hey	\N	2025-11-28 06:12:54.04902	t
1ca61ccb-2f35-4fd2-afcc-8e41ac2ebf08	99923a5b-7b56-49f1-b72e-98c5335ec444	3f7ec0b2-bddd-4276-ae29-383b66b94421	yes	\N	2025-11-28 05:48:38.400305	t
804bfa6b-5af9-405f-a687-f54e7f6c7af0	99923a5b-7b56-49f1-b72e-98c5335ec444	3f7ec0b2-bddd-4276-ae29-383b66b94421	vfvfvv	\N	2025-11-28 07:52:19.245054	t
c6f371a3-1417-4eba-bb2a-e0b7fedd03a4	99923a5b-7b56-49f1-b72e-98c5335ec444	3f7ec0b2-bddd-4276-ae29-383b66b94421	kzjwicx	\N	2025-11-28 10:07:37.307779	t
e514ae28-68c6-46a7-84ee-6781281b712f	99923a5b-7b56-49f1-b72e-98c5335ec444	3f7ec0b2-bddd-4276-ae29-383b66b94421	cccccccccccccccccc	\N	2025-11-28 07:34:55.105997	t
b0122a96-22d7-45ec-9344-1460f30fde4f	99923a5b-7b56-49f1-b72e-98c5335ec444	3f7ec0b2-bddd-4276-ae29-383b66b94421	lkewnc;ceme	\N	2025-11-28 10:11:56.299839	t
dc076682-2ac7-43fc-92bd-03d37c3a4bc2	99923a5b-7b56-49f1-b72e-98c5335ec444	3f7ec0b2-bddd-4276-ae29-383b66b94421	ccececece	\N	2025-11-28 10:12:37.699389	t
71d360af-6932-454a-8738-04d99c476be0	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	oefheowf	\N	2025-11-28 06:24:24.207488	t
84f72992-dcdb-46d3-9da4-1d75b347d9aa	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	kjshcpidsv 	\N	2025-11-28 06:26:55.064191	t
dc5237d0-ed19-42c9-97e9-acbc4e02bd00	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	swswswsws	\N	2025-11-28 07:33:17.6393	t
55090a89-ef96-4780-be3d-d1e40380c427	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	frvrvrv	\N	2025-11-28 07:52:04.640888	t
e523ac75-a9ec-4311-a468-3713db209ad7	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	cvfvrvrv	\N	2025-11-28 10:12:48.838699	t
d8792fff-f722-49d1-a14a-42b88b14c3ca	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	hii	\N	2025-12-01 09:40:02.330278	t
b95d6952-ea0f-4c3c-a047-58e7c7fcbd60	99923a5b-7b56-49f1-b72e-98c5335ec444	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	jhgfj	\N	2025-12-01 09:45:29.736799	t
f7ea7ff6-200c-49f2-9c22-ba601c3d1a72	9f23907b-94ec-4f08-b833-8ccb8279d781	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	hi	\N	2026-01-08 06:02:25.585773	f
d4ee0d23-18dd-4c11-851c-c290a9485502	9f23907b-94ec-4f08-b833-8ccb8279d781	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	yes	\N	2026-01-08 06:02:48.753223	f
75696cbf-8566-4ac0-810d-d2b869c369a6	9f23907b-94ec-4f08-b833-8ccb8279d781	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	OFFER: join event - HK$120 for 2 hours	\N	2026-01-08 06:03:53.660522	f
10cee690-a85d-4281-8f8d-e4869c70f38f	9f23907b-94ec-4f08-b833-8ccb8279d781	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	yes	\N	2026-01-08 06:04:13.0178	f
81d62c15-e6dc-41eb-bab0-793345cceeed	9f23907b-94ec-4f08-b833-8ccb8279d781	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	Payment received for offer: join event - HK$120.00	\N	2026-01-08 06:44:27.628469	f
\.


--
-- Data for Name: service_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_requests (id, requester_id, requester_type, title, description, estimated_hours, preferred_date, status, assigned_admin_id, completed_at, rejection_reason, created_at, updated_at, unread_by_requester, unread_by_admin) FROM stdin;
99923a5b-7b56-49f1-b72e-98c5335ec444	3f7ec0b2-bddd-4276-ae29-383b66b94421	user	need technical support 	need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support 	1.00	2025-11-30	approved	\N	\N	\N	2025-11-27 11:07:38.104493	2025-12-19 10:06:40.617	0	0
5895519d-b724-4031-abc3-d13fea5f09c1	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	vendor	need help	need help need help need help need help need help need help need help need help need help need help need help need help need help 	2.00	2025-11-29	approved	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	\N	\N	2025-11-27 06:31:16.532252	2025-11-27 06:32:21.074	0	0
2e9fd933-6c35-4d84-be2b-dd4215a3a4c4	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	vendor	hi need support	hi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need supporthi need support	3.00	2025-11-29	in_progress	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	\N	\N	2025-11-27 06:42:17.35222	2025-11-27 06:46:41.045	0	0
640b5f76-ad53-418c-ad10-43a0ed908f89	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	vendor	need to import files	need to import filesneed to import filesneed to import filesneed to import filesneed to import filesneed to import filesneed to import filesneed to import filesneed to import filesneed to import filesneed to import filesneed to import filesneed to import filesneed to import filesneed to import filesneed to import filesneed to import filesneed to import files	2.00	2025-11-28	completed	\N	2025-11-27 10:37:01.279	\N	2025-11-27 10:19:47.166221	2025-11-27 10:37:01.279	0	0
0e9da682-8d94-49be-b10f-1b94bd80ef07	3f7ec0b2-bddd-4276-ae29-383b66b94421	user	need technical support 	need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support need technical support 	1.00	2025-11-28	approved	\N	\N	\N	2025-11-26 11:55:49.263328	2025-11-28 07:40:09.009	0	0
9f23907b-94ec-4f08-b833-8ccb8279d781	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	vendor	want to join event	want to join event want to join event want to join event want to join event want to join event want to join event want to join event want to join event want to join event want to join event want to join event want to join event 	1.00	2026-01-09	in_progress	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	\N	\N	2026-01-08 06:01:20.965239	2026-01-08 06:45:55.796	1	0
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
mVOhDrjoLts75yfsX2HbJszsdWy7EeW8	{"cookie": {"path": "/", "secure": false, "expires": "2026-01-29T06:32:01.772Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "passport": {"user": "5f6b34c2-ad16-473b-a56d-1e4e3eaaf225"}}	2026-02-02 10:13:10
QS60_N6M-GLR27wbxyh2qaQUEgD0icke	{"cookie": {"path": "/", "secure": false, "expires": "2026-01-26T11:46:30.845Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "passport": {"user": "3f7ec0b2-bddd-4276-ae29-383b66b94421"}}	2026-02-02 10:58:36
\.


--
-- Data for Name: staff_audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff_audit_logs (id, staff_id, staff_username, staff_role, action, entity_type, entity_id, entity_title, description, metadata, ip_address, user_agent, created_at) FROM stdin;
e3276ce5-803c-4ef9-a9e0-1d35c6b9c839	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	super_admin	create	staff	a265d435-d160-4130-98de-00eaef7c00ec	testuser	Created staff user: testuser with role: sales	{"staffRole":"sales"}	10.82.5.161	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-10-28 06:36:57.881172
363953c0-99a8-4534-847d-6ac663a1b468	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	super_admin	update	staff	a265d435-d160-4130-98de-00eaef7c00ec	testuser	Updated staff role for testuser to: mediator	{"newRole":"mediator"}	10.82.4.77	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-10-28 06:37:06.40892
f7798adc-b3e9-4243-99ff-b68fed9eddf8	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	super_admin	delete	staff	a265d435-d160-4130-98de-00eaef7c00ec	testuser	Deleted staff user: testuser	\N	10.82.2.236	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-10-28 06:49:53.787616
c6cb6c36-59a7-4d90-8ef8-c454c4f855d3	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	super_admin	create	staff	aceb721f-3ff0-4883-ad6a-d15cb81a8e39	john_support	Created staff user: john_support with role: support	{"staffRole":"support"}	10.82.2.236	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-10-28 06:53:46.046613
3812ec91-691e-47e2-b1d7-c1e7dc325959	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	super_admin	delete	staff	aceb721f-3ff0-4883-ad6a-d15cb81a8e39	john_support	Deleted staff user: john_support	\N	10.82.4.77	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-10-28 07:03:27.221461
29f1d57d-92fd-4dd2-a6fe-85482eaba4d0	3f7ec0b2-bddd-4276-ae29-383b66b94421	system	super_admin	create	staff	ede87102-30fb-41a3-8c9b-a395cac01241	john_support	Created staff user: john_support with role: support	{"staffRole":"support"}	10.82.4.77	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-10-28 07:04:02.737436
c72b6632-e2a6-42d6-9913-dcc1ec077a44	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	system_admin	super_admin	update	staff	ede87102-30fb-41a3-8c9b-a395cac01241	john_support	Updated staff role for john_support to: sales	{"newRole":"sales"}	10.82.3.161	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-11-29 05:54:41.935516
2ee92140-a9ac-4201-b3b2-8c61434c6f12	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	system_admin	super_admin	update	staff	ede87102-30fb-41a3-8c9b-a395cac01241	john_support	Updated staff role for john_support to: support	{"newRole":"support"}	10.82.3.161	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-11-29 05:54:48.466087
6cf5823c-054e-49f5-9697-afd200d109fb	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	system_admin	super_admin	create	staff	feb17047-d2e5-4165-b456-96ccb79b8f00	sales	Created staff user: sales with role: sales	{"staffRole":"sales"}	10.82.6.137	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2025-12-01 11:55:58.56515
c79965ef-8065-4d17-bd55-41a215e44e4a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	usman	super_admin	create	staff	a33b874b-aeab-4e65-b62a-1ffe80639670	test	Created staff user: test with role: support	{"staffRole":"support"}	10.82.8.3	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36	2026-01-19 11:05:00.082947
\.


--
-- Data for Name: staff_help_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff_help_requests (id, user_id, user_name, listing_type, message, status, assigned_to, response_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: support_ticket_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_ticket_messages (id, ticket_id, sender_id, message, created_at, receiver_id, is_read) FROM stdin;
1731aa16-7bcc-45d7-bbb4-e912a3fa91fd	04c34e14-72e1-4f00-94b8-f07ae8d4f639	ede87102-30fb-41a3-8c9b-a395cac01241	hi	2025-10-29 10:14:36.373286	3f7ec0b2-bddd-4276-ae29-383b66b94421	f
429a8570-93b0-4734-ae86-007121319b26	04c34e14-72e1-4f00-94b8-f07ae8d4f639	3f7ec0b2-bddd-4276-ae29-383b66b94421	yes	2025-10-29 10:15:35.53255	ede87102-30fb-41a3-8c9b-a395cac01241	f
b177425f-874b-4ac0-a989-8002f3c2a1d6	e00dead9-5dd0-4f59-b2d1-46fe86e99341	ede87102-30fb-41a3-8c9b-a395cac01241	hi	2025-10-30 05:44:59.602575	3f7ec0b2-bddd-4276-ae29-383b66b94421	f
a4e02a08-0039-4e0e-a6d1-38f7fdfbeaff	e00dead9-5dd0-4f59-b2d1-46fe86e99341	3f7ec0b2-bddd-4276-ae29-383b66b94421	hi	2025-10-30 05:46:26.614442	ede87102-30fb-41a3-8c9b-a395cac01241	f
3f41325c-8b5e-4936-b671-37c410cbf599	e00dead9-5dd0-4f59-b2d1-46fe86e99341	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	fde	2025-11-29 06:27:27.153358	3f7ec0b2-bddd-4276-ae29-383b66b94421	f
5b89219d-7e5e-4bd4-aeb0-27b6e4554fc6	e00dead9-5dd0-4f59-b2d1-46fe86e99341	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	cdc	2025-11-29 06:31:10.014588	3f7ec0b2-bddd-4276-ae29-383b66b94421	f
f9731837-522c-4ec5-853b-b01c359c7f6d	e00dead9-5dd0-4f59-b2d1-46fe86e99341	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	cdd	2025-11-29 06:31:12.939169	3f7ec0b2-bddd-4276-ae29-383b66b94421	f
\.


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_tickets (id, user_id, subject, message, status, priority, assigned_to, created_at, updated_at, issue_type, attachment_url) FROM stdin;
e00dead9-5dd0-4f59-b2d1-46fe86e99341	3f7ec0b2-bddd-4276-ae29-383b66b94421	I want to transfer domain http://Studyflag.com to hostinger	kjiuiuii	assigned	normal	ede87102-30fb-41a3-8c9b-a395cac01241	2025-10-29 11:49:17.163762	2025-11-29 06:31:12.972	report-fraud	\N
5f65a65b-3050-46c2-ad38-4580aaa4f751	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	I have other technical issues	ochocdsvpdc	open	high	ede87102-30fb-41a3-8c9b-a395cac01241	2025-10-27 10:33:50.205093	2025-10-29 05:58:03.684	general	\N
04c34e14-72e1-4f00-94b8-f07ae8d4f639	3f7ec0b2-bddd-4276-ae29-383b66b94421	scam	scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam scam	assigned	high	ede87102-30fb-41a3-8c9b-a395cac01241	2025-10-27 05:39:08.492912	2025-10-29 10:15:35.565	general	\N
\.


--
-- Data for Name: td_conversions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.td_conversions (id, user_id, td_spent, coupon_code, coupon_id, created_at) FROM stdin;
\.


--
-- Data for Name: td_disputes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.td_disputes (id, order_id, buyer_id, seller_id, mediator_id, status, reason, deadline, resolution_note, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: td_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.td_transactions (id, user_id, type, amount, listing_id, order_id, note, created_at) FROM stdin;
\.


--
-- Data for Name: td_wallet; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.td_wallet (id, user_id, td_balance, td_earned, td_spent, updated_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, order_id, vendor_id, customer_id, stripe_payment_intent_id, stripe_charge_id, total_amount, platform_commission, vendor_earnings, status, currency, description, metadata, created_at, updated_at, payment_method, cash_amount, td_amount) FROM stdin;
14ce80e3-a768-4bcc-9e06-a680421211c8	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLGvJFE8EnxDnui0qR4ktz3	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-10-23 05:18:53.778089	2025-10-23 05:18:53.778089	cash	0.00	0.00
dd9c9f55-ee78-444c-83c7-45ae20f61c1f	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SLH4rFE8EnxDnui0PzBbw0H	\N	145.00	7.25	137.75	pending	hkd	Payment for order N/A	\N	2025-10-23 05:28:45.181078	2025-10-23 05:28:45.181078	cash	0.00	0.00
9aee1850-5728-4739-a747-05077b6f576a	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SLH57FE8EnxDnui0onSSwj4	\N	145.00	7.25	137.75	pending	hkd	Payment for order N/A	\N	2025-10-23 05:29:01.233966	2025-10-23 05:29:01.233966	cash	0.00	0.00
a34350f4-0d87-494e-bccf-8e16844dee28	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SLH5HFE8EnxDnui12aobyco	\N	145.00	7.25	137.75	pending	hkd	Payment for order N/A	\N	2025-10-23 05:29:11.747381	2025-10-23 05:29:11.747381	cash	0.00	0.00
fa50fb71-1402-434f-acc2-25dfed00d6ea	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLIKhFE8EnxDnui1EFner3C	\N	275.00	13.75	261.25	pending	hkd	Payment for order N/A	\N	2025-10-23 06:49:11.529571	2025-10-23 06:49:11.529571	cash	0.00	0.00
e0e7e320-7710-4bfc-a04b-c0898481945a	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLINNFE8EnxDnui1lKuIeVU	\N	275.00	13.75	261.25	pending	hkd	Payment for order N/A	\N	2025-10-23 06:51:57.146573	2025-10-23 06:51:57.146573	cash	0.00	0.00
e7599fb4-1709-48f3-b730-e14f06cc79c5	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLdGzFE8EnxDnui1JMYONON	\N	230.00	11.50	218.50	pending	hkd	Payment for order N/A	\N	2025-10-24 05:10:45.294472	2025-10-24 05:10:45.294472	cash	230.00	0.00
ff12f48b-ec50-4a2c-bb6b-c3f2d675d2a4	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLdHRFE8EnxDnui0ay186h6	\N	230.00	11.50	218.50	pending	hkd	Payment for order N/A	\N	2025-10-24 05:11:13.427953	2025-10-24 05:11:13.427953	cash	230.00	0.00
37ae9e8d-5275-4b97-ac40-43014a72f5ef	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLdHTFE8EnxDnui12TjwxEF	\N	230.00	11.50	218.50	pending	hkd	Payment for order N/A	\N	2025-10-24 05:11:15.684357	2025-10-24 05:11:15.684357	cash	230.00	0.00
287f5a77-a5f9-4b7c-be31-2cf9083b7697	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLdHiFE8EnxDnui0sJz1lIk	\N	230.00	11.50	218.50	pending	hkd	Payment for order N/A	\N	2025-10-24 05:11:31.068594	2025-10-24 05:11:31.068594	cash	230.00	0.00
b57efb29-89ed-47ea-a957-46b42eac8cb2	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLdKvFE8EnxDnui0sctck74	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-10-24 05:14:49.949698	2025-10-24 05:14:49.949698	cash	45.00	0.00
97624285-33e5-4baa-b89c-f2fa9a66689c	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLdMjFE8EnxDnui1zY3k8vx	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-10-24 05:16:42.066645	2025-10-24 05:16:42.066645	cash	45.00	0.00
a9237431-a7dc-4287-a776-78938855a62b	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLdSoFE8EnxDnui1gWseBII	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-10-24 05:22:58.919536	2025-10-24 05:22:58.919536	cash	45.00	0.00
09fddba0-80fc-4c1b-84b5-b252faa12128	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLdpGFE8EnxDnui1UzkKBLG	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-10-24 05:46:10.160708	2025-10-24 05:46:10.160708	cash	45.00	0.00
e8341596-49a5-4f08-842d-ee1d074bdf2d	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLeF2FE8EnxDnui00xY4lRp	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-10-24 06:12:48.771112	2025-10-24 06:12:48.771112	cash	45.00	0.00
2f57b8df-f8ae-4939-bed9-7075bcb93fad	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLeG1FE8EnxDnui0xWCjMRr	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-10-24 06:13:49.212081	2025-10-24 06:13:49.212081	cash	45.00	0.00
d2182651-e6ab-440c-a103-e6c53f661224	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLeGAFE8EnxDnui1whVEhE9	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-10-24 06:13:58.598234	2025-10-24 06:13:58.598234	cash	45.00	0.00
1de60f99-0c81-464e-b881-419475d14f60	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLeGAFE8EnxDnui0lJ9WQO1	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-10-24 06:13:59.117206	2025-10-24 06:13:59.117206	cash	45.00	0.00
2c9a6084-25ea-48ee-bbb1-138caccd759e	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLeH5FE8EnxDnui1NAUWl0x	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-10-24 06:14:55.408788	2025-10-24 06:14:55.408788	cash	45.00	0.00
d47fb512-6afc-4ce5-ac0f-a955b4b921b9	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLeHLFE8EnxDnui1YVje3JB	\N	40.50	2.02	38.48	pending	hkd	Payment for order N/A	\N	2025-10-24 06:15:11.611337	2025-10-24 06:15:11.611337	cash	40.50	0.00
6be93974-3556-47cf-9d9b-bb1bd0195078	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLeI8FE8EnxDnui1pqT7mUY	\N	40.50	2.02	38.48	pending	hkd	Payment for order N/A	\N	2025-10-24 06:16:00.651366	2025-10-24 06:16:00.651366	cash	40.50	0.00
6d64a35a-71a7-4952-8d84-4e0a7ac4ce40	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLeISFE8EnxDnui1znjHcD2	\N	40.50	2.02	38.48	pending	hkd	Payment for order N/A	\N	2025-10-24 06:16:20.872091	2025-10-24 06:16:20.872091	cash	40.50	0.00
334047f9-d7b0-43d5-8d05-7e5b1ebf4414	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLeUQFE8EnxDnui05K6mmTV	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-10-24 06:28:42.796821	2025-10-24 06:28:42.796821	cash	45.00	0.00
993b69c5-2ae2-45b2-b59f-985a04cda7d8	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLeUwFE8EnxDnui16j9gF4P	\N	90.00	4.50	85.50	pending	hkd	Payment for order N/A	\N	2025-10-24 06:29:14.397729	2025-10-24 06:29:14.397729	cash	90.00	0.00
8d1f18e4-f65b-4593-9b30-3913dd07cdd6	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SLeUxFE8EnxDnui0FEDeg1J	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-10-24 06:29:15.1679	2025-10-24 06:29:15.1679	cash	45.00	0.00
f4ff1c1b-09db-4f1e-976f-f614e2bdad26	dc5ff50d-7854-4ae1-a611-f82643a8d3aa	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	\N	\N	45.00	2.25	42.75	completed	hkd	Payment for order dc5ff50d-7854-4ae1-a611-f82643a8d3aa	{"tdDiscount": 0, "cashDiscount": 0}	2025-10-24 06:29:35.569849	2025-10-24 06:29:35.569849	timedollar	0.00	0.75
d9e6a494-7da0-4621-8521-e4aa6ac531fd	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SMn8tFE8EnxDnui1t5PlJFF	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-10-27 09:55:12.122291	2025-10-27 09:55:12.122291	cash	45.00	0.00
98e61af1-d38e-449a-912b-a186bc5bd0b3	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	pi_3SMngIFE8EnxDnui1bNKmtRV	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-10-27 10:29:42.199418	2025-10-27 10:29:42.199418	cash	45.00	0.00
4e7ef519-179e-4f4f-8bd9-42494edb82c9	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	pi_3SMngPFE8EnxDnui07dkvKn4	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-10-27 10:29:49.192594	2025-10-27 10:29:49.192594	cash	45.00	0.00
951db590-9a41-4719-a029-e858f732d3b8	5c8b004c-0bab-4630-bbdb-0eefc102876a	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	\N	\N	45.00	2.25	42.75	completed	hkd	Payment for order 5c8b004c-0bab-4630-bbdb-0eefc102876a	{"tdDiscount": 0, "cashDiscount": 0}	2025-10-27 10:30:21.862105	2025-10-27 10:30:21.862105	timedollar	0.00	0.75
9f5cbc9a-720e-4ab3-8a6c-9b9404eb790c	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SXbvZFE8EnxDnui1bVltcqW	\N	30.00	1.50	28.50	pending	hkd	Payment for order N/A	\N	2025-11-26 06:10:09.29421	2025-11-26 06:10:09.29421	cash	30.00	0.00
98765bb4-cb42-4811-91ed-8b25f169839c	22d4fdc5-ec33-46a8-acdb-a8f66c46025c	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SXbvfFE8EnxDnui0SteP6lo	\N	30.00	1.50	28.50	completed	hkd	Payment for order N/A	{"tdDiscount": 0, "cashDiscount": 0}	2025-11-26 06:10:15.779451	2025-11-26 06:10:43.07	cash	30.00	0.00
a19d6339-87de-4860-b514-06ddfabf4774	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SXc2cFE8EnxDnui1ISle2nn	\N	45.00	2.25	42.75	pending	hkd	Payment for order N/A	\N	2025-11-26 06:17:26.936383	2025-11-26 06:17:26.936383	cash	45.00	0.00
68156846-1f3a-41e4-8c42-1a0baa0fecfa	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SXgiHFE8EnxDnui1l3JJdGe	\N	30.00	1.50	28.50	pending	hkd	Payment for order N/A	\N	2025-11-26 11:16:45.199229	2025-11-26 11:16:45.199229	cash	30.00	0.00
7a759caa-1406-4a8e-92cf-1e616116bd1c	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3SYPXLFE8EnxDnui0RHPJ04E	\N	230.00	11.50	218.50	pending	hkd	Payment for order N/A	\N	2025-11-28 11:08:27.687491	2025-11-28 11:08:27.687491	cash	230.00	0.00
93409df6-e2f0-4563-9bd9-33060c82f129	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3Sg3FGFE8EnxDnui0nPCuYZF	\N	60.00	3.00	57.00	pending	hkd	Payment for order N/A	\N	2025-12-19 12:57:22.893963	2025-12-19 12:57:22.893963	cash	60.00	0.00
7c2e4882-d686-4cf5-a76d-e9c0149cc8c3	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3Sg3FJFE8EnxDnui07f57UtN	\N	60.00	3.00	57.00	pending	hkd	Payment for order N/A	\N	2025-12-19 12:57:25.150676	2025-12-19 12:57:25.150676	cash	60.00	0.00
68ea71a9-e0b8-4252-b95b-7a0ec9c951ba	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3Sg3FJFE8EnxDnui1cDuxlwX	\N	60.00	3.00	57.00	pending	hkd	Payment for order N/A	\N	2025-12-19 12:57:25.68515	2025-12-19 12:57:25.68515	cash	60.00	0.00
e335f63a-c021-4011-bab7-05182d3ccf2c	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3Sg3KNFE8EnxDnui0OTQYhkL	\N	60.00	3.00	57.00	pending	hkd	Payment for order N/A	\N	2025-12-19 13:02:39.213771	2025-12-19 13:02:39.213771	cash	60.00	0.00
7e433eae-4380-4419-9753-80adb33e3b08	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SndA1FE8EnxDnui1NjMRyth	\N	30.00	1.50	28.50	pending	hkd	Payment for order N/A	\N	2026-01-09 10:43:17.470703	2026-01-09 10:43:17.470703	cash	30.00	0.00
341a84d0-3c3f-43a5-bd5f-b26e19d0d11d	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SndA3FE8EnxDnui0RIdm2qO	\N	30.00	1.50	28.50	pending	hkd	Payment for order N/A	\N	2026-01-09 10:43:19.955305	2026-01-09 10:43:19.955305	cash	30.00	0.00
b0390e0d-34bf-4ed3-b2ea-12b9c634eb97	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SndA7FE8EnxDnui1Emjv9Wx	\N	30.00	1.50	28.50	pending	hkd	Payment for order N/A	\N	2026-01-09 10:43:23.70382	2026-01-09 10:43:23.70382	cash	30.00	0.00
01d6d96d-ed6f-455b-9045-9cf452806217	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SndA8FE8EnxDnui1NVF4oYD	\N	30.00	1.50	28.50	pending	hkd	Payment for order N/A	\N	2026-01-09 10:43:24.559789	2026-01-09 10:43:24.559789	cash	30.00	0.00
a622fa67-f5f9-4bd5-a005-84466e2798bd	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SndCGFE8EnxDnui1jW96ZVr	\N	230.00	11.50	218.50	pending	hkd	Payment for order N/A	\N	2026-01-09 10:45:36.503196	2026-01-09 10:45:36.503196	cash	230.00	0.00
710999aa-90f6-4f6e-a4cf-de9806afaf7d	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SndCRFE8EnxDnui0oUJK0q5	\N	230.00	11.50	218.50	pending	hkd	Payment for order N/A	\N	2026-01-09 10:45:47.40831	2026-01-09 10:45:47.40831	cash	230.00	0.00
4fd3a8d9-3ad0-46a8-8a3e-a9a85cabf59c	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SndG0FE8EnxDnui1Qne6naB	\N	460.00	23.00	437.00	pending	hkd	Payment for order N/A	\N	2026-01-09 10:49:28.911851	2026-01-09 10:49:28.911851	cash	460.00	0.00
25557f95-8df2-4ee1-b703-dbcb942f7299	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SndGHFE8EnxDnui1xWcsdGN	\N	460.00	23.00	437.00	pending	hkd	Payment for order N/A	\N	2026-01-09 10:49:45.416614	2026-01-09 10:49:45.416614	cash	460.00	0.00
edab4c76-1fdd-46ea-95df-016ec19d8bb6	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SndGKFE8EnxDnui1JbjHWod	\N	230.00	11.50	218.50	pending	hkd	Payment for order N/A	\N	2026-01-09 10:49:48.746542	2026-01-09 10:49:48.746542	cash	230.00	0.00
cfb3bf99-3bf0-4418-9f4f-877113534eeb	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SrIG1FE8EnxDnui0Fq7o9p9	\N	1010.00	50.50	959.50	pending	hkd	Payment for order N/A	\N	2026-01-19 13:12:37.292399	2026-01-19 13:12:37.292399	cash	1010.00	0.00
afa5f7a1-f7e4-43b4-9248-a4d9ca2e8856	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SrIG8FE8EnxDnui1VqMjurW	\N	1010.00	50.50	959.50	pending	hkd	Payment for order N/A	\N	2026-01-19 13:12:44.716242	2026-01-19 13:12:44.716242	cash	1010.00	0.00
2b7eedd8-d36c-4bae-a4df-f843db00475b	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	pi_3SrIGNFE8EnxDnui02oOBBFS	\N	1010.00	50.50	959.50	pending	hkd	Payment for order N/A	\N	2026-01-19 13:12:59.6325	2026-01-19 13:12:59.6325	cash	1010.00	0.00
12194e95-d0ed-46d3-88b1-8eb9989a7cb3	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3Srw6FFE8EnxDnui0mAZozJh	\N	30.00	1.50	28.50	pending	hkd	Payment for order N/A	\N	2026-01-21 07:45:11.186676	2026-01-21 07:45:11.186676	cash	30.00	0.00
cadaa7cd-6bef-4ade-afed-811110e669f8	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3Srw6KFE8EnxDnui0KMApyRu	\N	30.00	1.50	28.50	pending	hkd	Payment for order N/A	\N	2026-01-21 07:45:16.345082	2026-01-21 07:45:16.345082	cash	30.00	0.00
9b32701e-bbd9-4871-8fe0-c394d70090e4	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3Srw6LFE8EnxDnui1OQDNoyG	\N	30.00	1.50	28.50	pending	hkd	Payment for order N/A	\N	2026-01-21 07:45:17.972098	2026-01-21 07:45:17.972098	cash	30.00	0.00
d28ae1a3-53d6-4891-b2d5-2cdcdcaa0dad	\N	5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	3f7ec0b2-bddd-4276-ae29-383b66b94421	pi_3Srw6VFE8EnxDnui1iqRRYym	\N	30.00	1.50	28.50	pending	hkd	Payment for order N/A	\N	2026-01-21 07:45:27.377278	2026-01-21 07:45:27.377278	cash	30.00	0.00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, first_name, last_name, profile_image_url, created_at, updated_at, username, password, role, phone, bio, vendor_status, reset_password_token, reset_password_expires, timedollar_balance, td_cash_split_percentage, status, staff_role) FROM stdin;
a48e4ba3-2d48-4198-a204-5727332b98e5	mehndilicious@example.com	test	Replit	/objects/uploads/8d10d425-9064-4aa7-a4de-56804f5f96ed	2025-10-09 05:50:36.517109	2025-10-09 08:10:53.721	test12	fef822c1e7247130c18314c250b4d9f791140398a75245296b5143bee6eb994598c736c20e0cff3712cc5bb71a8e66708bd72aa9b8ed38b8a919748f7ceb98b0.23cf28d1fd0b3da6d1217cbfaf0e80d9	vendor	3447728877	\N	verified	5f5e03291ca28856191656ab1c5c1fe3192950c225e088823882ce1228cb810a	2025-10-09 09:10:53.721	0	50	active	\N
573af9ce-5c72-4e7e-8289-79f4f0071215	usmanfefrefr@gmail.com	eferfrf	frefref	\N	2025-10-14 09:38:16.747038	2025-10-14 10:34:24.28	frfre	15443b6dc0f31ab40878695de04252c3bf33b9299fafcf646c33c4e53b478d90b251b58b13dff991cf80504081121a9f61e32e84d3ffddc4d7db9997f34c66c2.66f3ab3f872b1b889ca3a66e822692fa	consumer	\N	\N	rejected	\N	\N	0	50	active	\N
cc3bf743-010e-489c-aa7b-04f8aa65a905	usman5555555@gmail.com	wdeded	dededdd	\N	2025-10-14 10:25:03.777644	2025-10-14 10:54:33.686	admin	005e6350de82e0954893a324fa3f0e0eb395dc3178b0efbfd254460c20e2eb7e2e16db1e5f85ac4dcf9d3bbb65954262348d4e80f9dcd23366edd5b9ed5fec4b.3c0d50f54a2e652689b06bd929703f2f	vendor	\N	\N	verified	\N	\N	0	50	active	\N
5f6b34c2-ad16-473b-a56d-1e4e3eaaf225	usmanshahid34466@gmail.com	Usman	Replit	/objects/uploads/7da3644b-a873-4033-9139-99b67cd42cf4	2025-10-09 08:19:27.167535	2025-10-09 09:47:10.77	usman	f50a8abc6ce7bdae3140527fd8acd8719f1e083d8d3004862bd8e910876c8b48280994a40b3aa7ccad22a05e113502d38ade0df5e58d4f1e77257387208fbf42.23759ad162963ec0a3a0e78f7519cda2	vendor	\N	\N	verified	9fc68d24ca1fd148ac508efcaaa4c9cdee13863ab3cbc286421a2b69234fa889	2025-10-09 09:20:41.375	0	50	active	\N
79df6452-30cb-4e63-8247-b9a6a219f7be	us369393@gmail.com	test	Replit	\N	2025-10-11 06:04:18.877987	2025-10-11 08:04:31.527	agent	cf3c3789005ace7db5a80d32653c01cfcf66a78493802b6ad89f07b9a56013059a74fb8df1e6b274d11368a3eb70a807b9a9e868c7de07fc7e07c80e501c7353.c752bdcc67ec861f9115344181897b30	consumer	\N	\N	rejected	\N	\N	0	50	active	\N
a65a53d9-0c68-4330-be42-0860cfa9fffe	ali.khan@example.com	ali	ali	\N	2025-10-13 06:01:13.358809	2025-10-13 06:01:13.358809	ali	9d299f9b708b6d29f9663fcdbf79d2cb81e9fb15e46500120d4e4eba0e5b7975e5c3839c2cccba8f429309a444ed5d7ab89cee90e6de77a1e9922d7ab112d075.f47055c16e27c76642ef2ab7d2d495ff	consumer	\N	\N	none	\N	\N	0	50	active	\N
59409a03-884c-40f4-9dc0-e5898b9cc0b4	TEST@GMAIL.COM	XCon 	test	\N	2025-10-15 12:31:49.074031	2025-10-15 12:31:49.074031	xcon	eec10a879451fff66706b40165fdc65d8816c7b6b6d8c00802bb7e94e264c6a289fed8ccedb759997ab6043219dec5e2c4ea38a077daf2c236f4b1e854850760.45c13ea24ae2cb7d58a8a2754575d3aa	consumer	\N	\N	none	\N	\N	0	50	active	\N
973ca52e-e6bd-404b-bb79-11f764715389	xconreplit@gmail.com	test	Rev	\N	2025-10-11 10:13:18.955674	2025-10-21 10:59:10.932	admin1	11a7a680348a6fbfd507e6b74fc1bdf404754c64cc91ad5c7a7f5c8ab45a91598796f911d0643942063f52f7dd0b4bb115e4548f255279928089edca6d5230f8.8504c64878860a8476a64068919563c8	consumer	\N	\N	none	\N	\N	0	50	active	\N
3272fb6d-4c35-4b65-8faf-3e8a5792d831	testswswdsw@gmail.com	frfrfrf	rfrfrfr	\N	2025-12-05 06:24:54.30802	2025-12-05 06:24:54.30802	frfrfrfrfrfrf	7d8c0b8b431e63f63c2da21671c285efb79e6d5f476ed348f60f533fc2107639e4ae7417fe6b2ac0deb194e3c4a401de1b1034180df5f54c15674757ef2eafcb.d209ed8813b2efa56d3580539d0ba95f	consumer	\N	\N	none	\N	\N	0	50	active	\N
fa63deef-79da-4112-83b6-a54b2a4ea7ec	mrusmanshahidd@gmail.com	Usman	Shahid	\N	2026-01-08 07:10:00.613275	2026-01-08 07:10:00.613275	usman_shahid	0af725924efd95fcd423d31a43384810701b20c489cdb804bff93506b7bb27b9c4bc7711cc9e2f450c92dc615b00ba54854898ff6f869ca3d2f09186d3696e95.4fd929b32b7f38771535bb209eca163b	consumer	\N	\N	none	\N	\N	0	50	active	\N
cbdb538b-520c-4f9e-9ce3-52b8dec4ade4	admin@system.local	\N	\N	\N	2025-10-27 06:58:59.708165	2025-10-27 10:30:21.476	system_admin	a4dd2574a23fd94581708f84b64b5500ae7b0468d0cba4cc170583b1d761747c12df5890f27faa1c5183a2bdf05dfd7b5ac31d31f9d92a520e6530ee34b29a2d.0e050de055a54a69cdf7322d666946e8	admin	\N	\N	none	\N	\N	19.25	50	active	\N
31a6fecf-9ef1-47f8-9d2f-a8fb4300b002	usmanshahid5066@gmail.com	XCon 	us	\N	2025-10-16 05:37:49.808441	2025-11-28 11:09:53.074	usm	280b80ff6f5617977401d5451eabe9bc2ed98b19129709c7aa8dfe0d7c25ee7e9f399e72340abcd2688a28922f57387b4e594ec3de48aed77b1273e23dc25a6e.ea291879ca809a30cfd7673c9e001837	consumer	\N	\N	none	\N	\N	0	50	active	\N
9fd72a42-5e9f-4cf1-afb2-500f6b14597d	admin@usman.com	Usman	Shahid	\N	2026-01-08 07:48:18.73867	2026-01-08 07:53:19.409	Usman	cea679ba681e44a9d84ec8d325c4a5c604a616f86f0e7898300ee25bd49f98e11d31dab1c8bab92d2808fc371004cf5fe572058e8435da23e51a98009e693316.e419b47cbb299e8368738e6fdffdfd2c	consumer	\N	\N	none	\N	\N	10	50	active	\N
a33b874b-aeab-4e65-b62a-1ffe80639670	test@gmail.com	\N	\N	\N	2026-01-19 11:05:00.001873	2026-01-19 11:05:00.001873	test	b37ba62b858c7d1ee5fb67f5f7ced7a983a79cf2197ca29be5a690e31a54a8e1c7a72cdc363502c94e3c33172d0d6ba768abc010a3117d9003767b770de8f4b4.a7c5144252eb0320bb57064563d92ff3	staff	\N	\N	none	\N	\N	0	50	active	support
ede87102-30fb-41a3-8c9b-a395cac01241	johnsupport@gmail.com	\N	\N	\N	2025-10-28 07:04:02.667595	2025-12-01 07:03:25.751	john_support	de5796a4a89ffae5e688a5da0ce674f092250df42311ef4285cc67de27fc949e6d9c09a62b9dc085d068fc91ef12ba28c622aa9b2d278c6c93fb3aa532841100.0b36131bb0fe9ba46cd85b14696b6378	staff	\N	\N	none	\N	\N	0	50	active	support
feb17047-d2e5-4165-b456-96ccb79b8f00	sales@gmail.com	\N	\N	\N	2025-12-01 11:55:58.428569	2025-12-01 11:55:58.428569	sales	f0426b95b54de523715e70886092278561875912b3bbf034a229cdbfd9c1e5664a843ce4357208b371d144d249b0ad5fe78e9dce262897816f19ebb430d41c5f.6b10b003a08739771f042d601f9fbbf7	staff	\N	\N	none	\N	\N	0	50	active	sales
3f7ec0b2-bddd-4276-ae29-383b66b94421	usmanshahid2092@gmail.com	eferfrf	Replit	/objects/uploads/f73eaebc-d6e3-42cb-9d03-299a1e328d40	2025-10-16 07:39:14.580286	2026-01-21 12:21:23.587	system	d9a8c819689b4f0dc41ba26b46018283f8f82532580abb49f70929892bddc1c568a46597b5050028d5bf9148cc8525d83de9d73ea2524fd0e9c64c221c67660b.bd01c96119f4a16eb7b3a5d1fe6c1873	consumer	\N	\N	none	\N	\N	109.25	50	active	\N
05e0900a-05c6-4b6b-8b01-5e31bccb0646	usman@gmail.com	test	frefref	\N	2025-10-14 12:07:42.896997	2026-01-20 10:04:06.845	dee	ecaf392564df607a2640e63e96cadba8a0b96d86eea51d58301068ccb9c98610f89b1b25315efefa72eb6a34a42222089e54352a65edbd88b97e89ed417288e0.61c5c498b5895191d1e5b67ce53f9ef8	consumer	\N	\N	rejected	\N	\N	0	50	active	\N
93445c9a-ed7d-4753-a3ed-8e4e1ff9d347	test12@gmail.com	test	us	\N	2026-01-20 10:01:35.394383	2026-01-20 10:05:02.448	testuser12	319e08e59268fc55f2303c9421659c8ad2d35dca0abe324e7bc457b22b46f22a9528467389e9ec562768c5af8b9bd9ca4f04ad22b728ef181c47b58a76fd0872.9189b643192648117ce99dc8af5e334e	vendor	\N	\N	verified	\N	\N	0	50	active	\N
\.


--
-- Data for Name: vendor_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendor_requests (id, user_id, business_name, identification_doc, business_registration_doc, address_proof_doc, description, status, rejection_reason, reviewed_by, reviewed_at, created_at, updated_at, business_type, contact_number) FROM stdin;
219f8906-8d74-411f-b207-a2611ad539d9	79df6452-30cb-4e63-8247-b9a6a219f7be	Usman 	https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/41a74c5a-5dc0-487f-9793-c78890eff614	\N	https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/dec7fd52-4e6d-4d40-870a-a6669ebec039		rejected	kahsksd	79df6452-30cb-4e63-8247-b9a6a219f7be	2025-10-11 08:04:31.459	2025-10-11 08:03:54.373587	2025-10-11 08:04:31.459	individual	+923036001701
bae87a49-3985-4bfc-b408-de8e5c2def5b	573af9ce-5c72-4e7e-8289-79f4f0071215	fvvv	https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/2da8fc2c-24f4-4eef-8c18-d0e47c5516d3	\N	https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/0fc6e9fd-a159-4714-b8c6-c4e8ae4f3eec	frfrvrfv	rejected	ffr	573af9ce-5c72-4e7e-8289-79f4f0071215	2025-10-14 09:58:23.18	2025-10-14 09:38:56.823811	2025-10-14 09:58:23.18	individual	+923036001701
77d6d1fd-8e39-4030-a251-85be97570e01	573af9ce-5c72-4e7e-8289-79f4f0071215	eecececec	https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/bb320c47-1c75-4191-9852-d22af6e7f75b	\N	https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/8dfa8bc9-9812-4b2e-bce5-1a9cedfddc72	fcdcecd	rejected	dddded	cc3bf743-010e-489c-aa7b-04f8aa65a905	2025-10-14 10:34:24.214	2025-10-14 09:59:22.95585	2025-10-14 10:34:24.214	individual	+923036001701
b4c7341f-ba0b-4a42-a38b-fd4a99ffbd2f	cc3bf743-010e-489c-aa7b-04f8aa65a905	xcon	https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/5721ed17-e735-45aa-a047-0b76f3000bae	\N	https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/bd292f3c-24a3-4d38-b436-3e59cfbefec5		rejected	deded	cc3bf743-010e-489c-aa7b-04f8aa65a905	2025-10-14 10:34:38.084	2025-10-14 10:25:40.411758	2025-10-14 10:34:38.084	individual	+923036001701
130aea4a-cd5c-401c-bd8c-c179ce33320b	cc3bf743-010e-489c-aa7b-04f8aa65a905	deededed	https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/b903cfa1-05bc-4cb1-b475-d72e35d2e8fc	\N	https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/2556a858-45d4-4f77-902a-779b36354c12		approved	\N	cc3bf743-010e-489c-aa7b-04f8aa65a905	2025-10-14 10:54:33.622	2025-10-14 10:35:34.302757	2025-10-14 10:54:33.622	individual	+923036001701
147b01eb-9e61-41b2-bd1a-c78030114d86	05e0900a-05c6-4b6b-8b01-5e31bccb0646	decdc	https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/dabbea76-02ff-4acb-b688-44bfbeb36c56	\N	https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/b00c2e2a-3009-45a4-8e5e-ffc28e07f025	cce	rejected	ew3ededed	93445c9a-ed7d-4753-a3ed-8e4e1ff9d347	2026-01-20 10:04:06.78	2025-10-14 12:08:04.606578	2026-01-20 10:04:06.78	individual	+923036001701
2e60ef62-e273-49d1-89f3-dac25f52ca25	93445c9a-ed7d-4753-a3ed-8e4e1ff9d347	@testuser12	https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/5d3b392d-69a8-44cc-895d-bd5e34c4910d	\N	https://storage.googleapis.com/replit-objstore-35423fe6-4dad-4741-84f7-248f7aded216/.private/uploads/cf98fd6a-10d8-46ec-9862-2a0c601d6cff	cewdcecececec ecececewc ecececewcew cewcecewewc ewcewcewc ewcewcew cewcewcew cce ewcw ecewcecece	approved	\N	93445c9a-ed7d-4753-a3ed-8e4e1ff9d347	2026-01-20 10:05:02.382	2026-01-20 10:03:12.711568	2026-01-20 10:05:02.382	individual	2143321313232
\.


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: business_listings business_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_listings
    ADD CONSTRAINT business_listings_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_unique UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: contact_queries contact_queries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_queries
    ADD CONSTRAINT contact_queries_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: coupon_usage coupon_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_unique UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: event_registrations event_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_pkey PRIMARY KEY (id);


--
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: saved_items saved_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_pkey PRIMARY KEY (id);


--
-- Name: service_offers service_offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_offers
    ADD CONSTRAINT service_offers_pkey PRIMARY KEY (id);


--
-- Name: service_request_fees service_request_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_request_fees
    ADD CONSTRAINT service_request_fees_pkey PRIMARY KEY (id);


--
-- Name: service_request_fees service_request_fees_stripe_payment_intent_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_request_fees
    ADD CONSTRAINT service_request_fees_stripe_payment_intent_id_unique UNIQUE (stripe_payment_intent_id);


--
-- Name: service_request_messages service_request_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_request_messages
    ADD CONSTRAINT service_request_messages_pkey PRIMARY KEY (id);


--
-- Name: service_requests service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: staff_audit_logs staff_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_audit_logs
    ADD CONSTRAINT staff_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: staff_help_requests staff_help_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_help_requests
    ADD CONSTRAINT staff_help_requests_pkey PRIMARY KEY (id);


--
-- Name: support_ticket_messages support_ticket_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_ticket_messages
    ADD CONSTRAINT support_ticket_messages_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: td_conversions td_conversions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.td_conversions
    ADD CONSTRAINT td_conversions_pkey PRIMARY KEY (id);


--
-- Name: td_disputes td_disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.td_disputes
    ADD CONSTRAINT td_disputes_pkey PRIMARY KEY (id);


--
-- Name: td_transactions td_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.td_transactions
    ADD CONSTRAINT td_transactions_pkey PRIMARY KEY (id);


--
-- Name: td_wallet td_wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.td_wallet
    ADD CONSTRAINT td_wallet_pkey PRIMARY KEY (id);


--
-- Name: td_wallet td_wallet_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.td_wallet
    ADD CONSTRAINT td_wallet_user_id_unique UNIQUE (user_id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_stripe_payment_intent_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_stripe_payment_intent_id_unique UNIQUE (stripe_payment_intent_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vendor_requests vendor_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_requests
    ADD CONSTRAINT vendor_requests_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: activity_logs activity_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: bookings bookings_listing_id_listings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_listing_id_listings_id_fk FOREIGN KEY (listing_id) REFERENCES public.listings(id);


--
-- Name: bookings bookings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: business_listings business_listings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_listings
    ADD CONSTRAINT business_listings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: cart_items cart_items_product_id_listings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_listings_id_fk FOREIGN KEY (product_id) REFERENCES public.listings(id);


--
-- Name: cart_items cart_items_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: conversations conversations_customer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_customer_id_users_id_fk FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- Name: conversations conversations_product_id_listings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_product_id_listings_id_fk FOREIGN KEY (product_id) REFERENCES public.listings(id);


--
-- Name: conversations conversations_vendor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_vendor_id_users_id_fk FOREIGN KEY (vendor_id) REFERENCES public.users(id);


--
-- Name: coupon_usage coupon_usage_coupon_id_coupons_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_coupon_id_coupons_id_fk FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);


--
-- Name: coupon_usage coupon_usage_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: coupon_usage coupon_usage_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: coupons coupons_approved_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_approved_by_users_id_fk FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: coupons coupons_product_id_listings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_product_id_listings_id_fk FOREIGN KEY (product_id) REFERENCES public.listings(id);


--
-- Name: coupons coupons_vendor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_vendor_id_users_id_fk FOREIGN KEY (vendor_id) REFERENCES public.users(id);


--
-- Name: event_registrations event_registrations_event_id_listings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_event_id_listings_id_fk FOREIGN KEY (event_id) REFERENCES public.listings(id);


--
-- Name: event_registrations event_registrations_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: event_registrations event_registrations_vendor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_vendor_id_users_id_fk FOREIGN KEY (vendor_id) REFERENCES public.users(id);


--
-- Name: listings listings_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: listings listings_moderated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_moderated_by_users_id_fk FOREIGN KEY (moderated_by) REFERENCES public.users(id);


--
-- Name: listings listings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: messages messages_conversation_id_conversations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: order_items order_items_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items order_items_product_id_listings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_listings_id_fk FOREIGN KEY (product_id) REFERENCES public.listings(id);


--
-- Name: orders orders_coupon_id_coupons_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_coupon_id_coupons_id_fk FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);


--
-- Name: orders orders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: orders orders_vendor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_vendor_id_users_id_fk FOREIGN KEY (vendor_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_listing_id_listings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_listing_id_listings_id_fk FOREIGN KEY (listing_id) REFERENCES public.listings(id);


--
-- Name: reviews reviews_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: reviews reviews_vendor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_vendor_id_users_id_fk FOREIGN KEY (vendor_id) REFERENCES public.users(id);


--
-- Name: saved_items saved_items_listing_id_listings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_listing_id_listings_id_fk FOREIGN KEY (listing_id) REFERENCES public.listings(id);


--
-- Name: saved_items saved_items_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: service_offers service_offers_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_offers
    ADD CONSTRAINT service_offers_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: service_offers service_offers_service_request_id_service_requests_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_offers
    ADD CONSTRAINT service_offers_service_request_id_service_requests_id_fk FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id);


--
-- Name: service_request_fees service_request_fees_service_request_id_service_requests_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_request_fees
    ADD CONSTRAINT service_request_fees_service_request_id_service_requests_id_fk FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id);


--
-- Name: service_request_fees service_request_fees_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_request_fees
    ADD CONSTRAINT service_request_fees_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: service_request_messages service_request_messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_request_messages
    ADD CONSTRAINT service_request_messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: service_request_messages service_request_messages_service_request_id_service_requests_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_request_messages
    ADD CONSTRAINT service_request_messages_service_request_id_service_requests_id FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id);


--
-- Name: service_requests service_requests_assigned_admin_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_assigned_admin_id_users_id_fk FOREIGN KEY (assigned_admin_id) REFERENCES public.users(id);


--
-- Name: service_requests service_requests_requester_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_requester_id_users_id_fk FOREIGN KEY (requester_id) REFERENCES public.users(id);


--
-- Name: staff_audit_logs staff_audit_logs_staff_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_audit_logs
    ADD CONSTRAINT staff_audit_logs_staff_id_users_id_fk FOREIGN KEY (staff_id) REFERENCES public.users(id);


--
-- Name: staff_help_requests staff_help_requests_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_help_requests
    ADD CONSTRAINT staff_help_requests_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: staff_help_requests staff_help_requests_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_help_requests
    ADD CONSTRAINT staff_help_requests_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: support_ticket_messages support_ticket_messages_receiver_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_ticket_messages
    ADD CONSTRAINT support_ticket_messages_receiver_id_users_id_fk FOREIGN KEY (receiver_id) REFERENCES public.users(id);


--
-- Name: support_ticket_messages support_ticket_messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_ticket_messages
    ADD CONSTRAINT support_ticket_messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: support_ticket_messages support_ticket_messages_ticket_id_support_tickets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_ticket_messages
    ADD CONSTRAINT support_ticket_messages_ticket_id_support_tickets_id_fk FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE;


--
-- Name: support_tickets support_tickets_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: support_tickets support_tickets_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: td_conversions td_conversions_coupon_id_coupons_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.td_conversions
    ADD CONSTRAINT td_conversions_coupon_id_coupons_id_fk FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);


--
-- Name: td_conversions td_conversions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.td_conversions
    ADD CONSTRAINT td_conversions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: td_disputes td_disputes_buyer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.td_disputes
    ADD CONSTRAINT td_disputes_buyer_id_users_id_fk FOREIGN KEY (buyer_id) REFERENCES public.users(id);


--
-- Name: td_disputes td_disputes_mediator_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.td_disputes
    ADD CONSTRAINT td_disputes_mediator_id_users_id_fk FOREIGN KEY (mediator_id) REFERENCES public.users(id);


--
-- Name: td_disputes td_disputes_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.td_disputes
    ADD CONSTRAINT td_disputes_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: td_disputes td_disputes_seller_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.td_disputes
    ADD CONSTRAINT td_disputes_seller_id_users_id_fk FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- Name: td_transactions td_transactions_listing_id_listings_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.td_transactions
    ADD CONSTRAINT td_transactions_listing_id_listings_id_fk FOREIGN KEY (listing_id) REFERENCES public.listings(id);


--
-- Name: td_transactions td_transactions_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.td_transactions
    ADD CONSTRAINT td_transactions_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: td_transactions td_transactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.td_transactions
    ADD CONSTRAINT td_transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: td_wallet td_wallet_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.td_wallet
    ADD CONSTRAINT td_wallet_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_customer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_customer_id_users_id_fk FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: transactions transactions_vendor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_vendor_id_users_id_fk FOREIGN KEY (vendor_id) REFERENCES public.users(id);


--
-- Name: vendor_requests vendor_requests_reviewed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_requests
    ADD CONSTRAINT vendor_requests_reviewed_by_users_id_fk FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: vendor_requests vendor_requests_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_requests
    ADD CONSTRAINT vendor_requests_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict ZQ8m0nRswo1iZiGxaj21hbfWfIhONVsKw6tGXWX6Xi9MJ8NvIV9xOfKtUAKKRrb

