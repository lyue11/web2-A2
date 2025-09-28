-- =============================================
-- PROG2002 Assessment 2 - Charity Events Database
-- Create database structure for Charity Events Management System
-- =============================================

-- Drop database if exists (for reset)
DROP DATABASE IF EXISTS charityevents_db;

-- Create database
CREATE DATABASE charityevents_db;
USE charityevents_db;

-- =============================================
-- Table 1: Organisations Table
-- =============================================
CREATE TABLE organisations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    mission_statement TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table 2: Categories Table
-- =============================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- =============================================
-- Table 3: Events Table (Core Table)
-- =============================================
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    full_description LONGTEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    location VARCHAR(255) NOT NULL,
    venue_details TEXT,
    
    -- Foreign keys
    organisation_id INT,
    category_id INT,
    
    -- Ticket information
    ticket_price DECIMAL(10,2) DEFAULT 0.00,
    is_free BOOLEAN DEFAULT FALSE,
    
    -- Fundraising goals
    fundraising_goal DECIMAL(10,2) DEFAULT 0.00,
    current_amount DECIMAL(10,2) DEFAULT 0.00,
    
    -- Event status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Image URL
    image_url VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- =============================================
-- Insert Sample Data
-- =============================================

-- Insert organisations data
INSERT INTO organisations (name, description, mission_statement, contact_email, contact_phone, address) VALUES
('Hope Light Charity Foundation', 'Non-profit organization dedicated to helping underprivileged children and families', 'Creating a better tomorrow for every child', 'contact@hopelight.org', '+61 2 1234 5678', '123 Sydney Central'),
('Green Earth Environmental Organization', 'Charity focused on environmental protection and sustainable development', 'Protecting the planet, creating a sustainable future', 'info@greenearth.org', '+61 3 9876 5432', '456 Green Avenue, Melbourne');

-- Insert categories data
INSERT INTO categories (name, description) VALUES
('Fun Run', 'Various themed running events like color run, neon run, etc.'),
('Charity Gala', 'Formal dinner events usually with speeches and auctions'),
('Concert', 'Charity music performance events'),
('Auction', 'Item or service auctions to raise funds'),
('Workshop', 'Educational and interactive workshop events'),
('Community Cleanup', 'Community environment cleanup activities');

-- Insert events data (at least 8, including past and future events)
INSERT INTO events (title, description, full_description, event_date, event_time, location, organisation_id, category_id, ticket_price, is_free, fundraising_goal, current_amount, is_active, is_featured, image_url) VALUES
-- Future events
('2025 Sydney Color Run', '5km color run to raise funds for children medical research', 'Join our annual color run and enjoy a colorful 5km running experience by Sydney beach. All proceeds will be donated to children hospital.', '2025-10-15', '08:00:00', 'Bondi Beach, Sydney', 1, 1, 45.00, FALSE, 50000.00, 12500.00, TRUE, TRUE, '/images/color-run.jpg'),
('Charity Symphony Night', 'Classical music feast supporting music education', 'Special charity performance by Sydney Symphony Orchestra, supporting music education programs for children in remote areas.', '2025-11-20', '19:30:00', 'Sydney Opera House', 1, 3, 85.00, FALSE, 30000.00, 8500.00, TRUE, TRUE, '/images/symphony-night.jpg'),
('Environmental Art Auction', 'Famous artists work auction for environmental protection', 'Multiple renowned Australian artists donate their works for auction, all proceeds go to environmental protection projects.', '2025-09-30', '18:00:00', 'Melbourne Arts Centre', 2, 4, 0.00, TRUE, 20000.00, 7500.00, TRUE, FALSE, '/images/art-auction.jpg'),
('Sustainable Development Workshop', 'Learn eco-friendly living skills', 'Free workshop teaching you how to practice sustainable development at home, reducing carbon footprint.', '2025-10-08', '10:00:00', 'University of Melbourne', 2, 5, 0.00, TRUE, 5000.00, 1200.00, TRUE, FALSE, '/images/workshop.jpg'),

-- More future events
('Beach Cleanup Day', 'Community beach cleanup volunteer activity', 'Join our monthly beach cleanup activity to protect marine environment. Tools and snacks provided.', '2025-10-25', '09:00:00', 'St Kilda Beach, Melbourne', 2, 6, 0.00, TRUE, 2000.00, 300.00, TRUE, FALSE, '/images/beach-cleanup.jpg'),
('Charity Gala: Education Equality', 'Support education opportunities in remote areas', 'Formal gala dinner with guest speakers, live auction, all proceeds to provide educational resources and scholarships.', '2025-11-05', '19:00:00', 'Crown Hotel Ballroom, Melbourne', 1, 2, 150.00, FALSE, 75000.00, 25000.00, TRUE, TRUE, '/images/gala-dinner.jpg'),

-- Past events (for testing "past events" display logic)
('2024 Christmas Charity Market', 'Holiday market supporting homeless shelter', 'Handmade goods, food and entertainment activities to raise funds for homeless shelter.', '2024-12-15', '10:00:00', 'Federation Square, Melbourne', 2, 4, 0.00, TRUE, 15000.00, 13200.00, TRUE, FALSE, '/images/christmas-market.jpg'),
('Spring Fun Run 2024', 'Community running event for cancer research', '5km fun run with obstacle course and costume contest.', '2024-09-10', '07:30:00', 'Royal Botanic Gardens, Melbourne', 1, 1, 35.00, FALSE, 25000.00, 21800.00, TRUE, FALSE, '/images/spring-fun-run.jpg'),

-- Suspended event (test filtering logic)
('Suspended Test Event', 'This event should not appear on the website', 'This event is suspended due to policy violation, used for testing filter function.', '2025-12-01', '12:00:00', 'Test Location', 1, 1, 0.00, TRUE, 1000.00, 0.00, FALSE, FALSE, '/images/test.jpg');

-- =============================================
-- Create Useful Views (Optional but recommended)
-- =============================================

-- Active events view (only shows is_active = TRUE events)
CREATE VIEW active_events AS
SELECT e.*, o.name as organisation_name, c.name as category_name
FROM events e
LEFT JOIN organisations o ON e.organisation_id = o.id
LEFT JOIN categories c ON e.category_id = c.id
WHERE e.is_active = TRUE;

-- Upcoming events view (future date + active)
CREATE VIEW upcoming_events AS
SELECT * FROM active_events 
WHERE event_date >= CURDATE()
ORDER BY event_date ASC;

-- Past events view (past date + active)
CREATE VIEW past_events AS
SELECT * FROM active_events 
WHERE event_date < CURDATE()
ORDER BY event_date DESC;

-- =============================================
-- Display confirmation information
-- =============================================
SELECT 'Database created successfully!' as status;
SELECT COUNT(*) as organisation_count FROM organisations;
SELECT COUNT(*) as category_count FROM categories;
SELECT COUNT(*) as event_count FROM events;
SELECT COUNT(*) as active_event_count FROM events WHERE is_active = TRUE;
SELECT COUNT(*) as upcoming_event_count FROM events WHERE is_active = TRUE AND event_date >= CURDATE();