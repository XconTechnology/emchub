--
-- PostgreSQL database dump
--

\restrict giNPWqbeq5XPs5Q7Mvv9x6Wd2KWFBSD3AD5j7edxiH0ehkj9uajCnbKQJLfETNL

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

\unrestrict giNPWqbeq5XPs5Q7Mvv9x6Wd2KWFBSD3AD5j7edxiH0ehkj9uajCnbKQJLfETNL

