-- Production Database Seed Script for EMC HUB
-- Run this SQL directly in your production database

-- Step 1: Create categories (if they don't exist)
INSERT INTO categories (id, name, description)
VALUES 
  ('ed-category-001', 'Education', 'Educational institutions and services'),
  ('arts-category-001', 'Arts', 'Arts and creative services')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Get or create a system user for listings
INSERT INTO users (id, username, email, password, role)
VALUES ('system-user-001', 'system', 'system@emchub.com', 'not-used', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Step 3: Insert demo listings
INSERT INTO listings (
  id, user_id, type, title, description, category_id, 
  address, city, latitude, longitude, phone, email, website,
  is_online_only, moderation_status, is_active
) VALUES
-- Islamic Primary School
(
  'listing-001',
  'system-user-001',
  'business',
  'Islamic Primary School',
  'Islamic Primary School of Hong Kong provides quality Islamic education combining academic excellence with Islamic values. Located in Hong Kong, the school offers a comprehensive curriculum for primary-aged students.',
  'ed-category-001',
  'Hong Kong',
  'Hong Kong',
  '22.3193',
  '114.1694',
  '+852 1234 5678',
  'info@islamicprimary.edu.hk',
  NULL,
  false,
  'approved',
  true
),
-- EdSquare
(
  'listing-002',
  'system-user-001',
  'business',
  'EdSquare',
  'EdSquare is an educational center providing quality tutoring and learning support services. We focus on helping students achieve their academic goals through personalized learning approaches.',
  'ed-category-001',
  'Hong Kong',
  'Hong Kong',
  '22.3220',
  '114.1700',
  '+852 2345 6789',
  'contact@edsquare.edu.hk',
  NULL,
  false,
  'approved',
  true
),
-- Ease Education Limited
(
  'listing-003',
  'system-user-001',
  'business',
  'Ease Education Limited',
  'TCCA 2/F, Waterside Plaza, 38 Wong Shun Street Tuen Wan, New Territories Hong Kong SAR

Ease Education is a charitable institution or trust of a public character, is exempt from tax under Section 88 of the Inland revenue ordinance. Our mission is to promote excellence in academics, personal responsibility, and character development and to instill life long learning.',
  'ed-category-001',
  'TCCA 2/F, Waterside Plaza, 38 Wong Shun Street Tuen Wan, New Territories',
  'Hong Kong',
  '22.3705',
  '114.1090',
  '+852 3456 7890',
  'info@easeeducation.org.hk',
  NULL,
  false,
  'approved',
  true
),
-- Alif Complementary Educational Services
(
  'listing-004',
  'system-user-001',
  'business',
  'Alif Complementary Educational Services',
  'On-demand educational courses uniquely suited to the audiences needs such as note-taking, financial literacy, mnemonics and other study skills.',
  'ed-category-001',
  'Hong Kong SAR, China',
  'Hong Kong',
  '22.3193',
  '114.1694',
  '+852 4567 8901',
  'support@alifservices.edu.hk',
  NULL,
  true,
  'approved',
  true
),
-- mehndilicious_
(
  'listing-005',
  'system-user-001',
  'business',
  'mehndilicious_',
  '📍🇵🇰|🇭🇰 ~💯Organic cones

Dm to book henna service for any occasion 🇭🇰',
  'arts-category-001',
  'Quarry Bay, Hong Kong',
  'Hong Kong',
  '22.2875',
  '114.2100',
  '+852 9876 5432',
  'mehndilicious@example.com',
  'https://www.instagram.com/mehndilicious/?hl=en',
  false,
  'approved',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT COUNT(*) as total_listings FROM listings WHERE moderation_status = 'approved';
