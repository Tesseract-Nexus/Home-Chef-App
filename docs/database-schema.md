# Database Schema Documentation

## Overview

Complete database schema for HomeChef platform supporting all features including order management with countdown timer, tipping system, rewards, and analytics.

## Core Tables

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'chef', 'delivery_partner', 'admin') NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_phone (phone),
    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
);
```

### Orders Table with Countdown Timer Support
```sql
CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    chef_id VARCHAR(255) NOT NULL,
    delivery_partner_id VARCHAR(255),
    status ENUM(
        'pending_payment', 'payment_confirmed', 'sent_to_chef', 
        'chef_accepted', 'preparing', 'ready_for_pickup', 
        'delivery_assigned', 'picked_up', 'out_for_delivery', 
        'delivered', 'cancelled'
    ) NOT NULL DEFAULT 'pending_payment',
    
    -- Order Details
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    taxes DECIMAL(10,2) DEFAULT 0,
    platform_fee DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    
    -- Timing
    placed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estimated_delivery_time TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Cancellation Policy
    free_cancellation_window_seconds INT DEFAULT 30,
    penalty_rate DECIMAL(3,2) DEFAULT 0.40,
    
    -- Computed Columns for Cancellation
    can_cancel_free BOOLEAN GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (NOW() - placed_at)) <= free_cancellation_window_seconds
    ) STORED,
    
    penalty_amount DECIMAL(10,2) GENERATED ALWAYS AS (
        CASE 
            WHEN EXTRACT(EPOCH FROM (NOW() - placed_at)) <= free_cancellation_window_seconds 
            THEN 0 
            ELSE LEAST(GREATEST(total * penalty_rate, 20), 500)
        END
    ) STORED,
    
    -- Address and Instructions
    delivery_address JSON NOT NULL,
    delivery_instructions TEXT,
    special_instructions TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (chef_id) REFERENCES chefs(id),
    FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id),
    
    INDEX idx_orders_customer (customer_id, created_at DESC),
    INDEX idx_orders_chef (chef_id, created_at DESC),
    INDEX idx_orders_delivery (delivery_partner_id, created_at DESC),
    INDEX idx_orders_status (status),
    INDEX idx_orders_placed_at (placed_at),
    INDEX idx_orders_cancellation (can_cancel_free, penalty_amount)
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    dish_id VARCHAR(255) NOT NULL,
    dish_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    customizations JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (dish_id) REFERENCES dishes(id),
    
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_dish (dish_id)
);
```

### Order Timeline Table
```sql
CREATE TABLE order_timeline (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    status ENUM(
        'payment_confirmed', 'sent_to_chef', 'chef_accepted', 
        'preparing', 'ready_for_pickup', 'delivery_assigned', 
        'picked_up', 'out_for_delivery', 'delivered', 'cancelled'
    ) NOT NULL,
    message TEXT NOT NULL,
    estimated_time VARCHAR(50),
    location JSON,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    
    INDEX idx_timeline_order (order_id, created_at),
    INDEX idx_timeline_status (status)
);
```

### Chefs Table with Search Optimization
```sql
CREATE TABLE chefs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    description TEXT,
    cuisine_types JSON NOT NULL, -- Array of cuisine types
    dietary_preferences JSON, -- Array of dietary options
    
    -- Business Info
    min_order_amount DECIMAL(10,2) DEFAULT 200,
    delivery_radius DECIMAL(5,2) DEFAULT 5, -- in kilometers
    avg_preparation_time INT DEFAULT 30, -- in minutes
    delivery_fee DECIMAL(10,2) DEFAULT 25,
    
    -- Performance Metrics
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    total_orders INT DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 100,
    
    -- Availability
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    
    -- Working Hours
    working_hours JSON, -- {start: "09:00", end: "21:00"}
    working_days JSON, -- Array of days
    
    -- Location
    location POINT NOT NULL, -- For spatial queries
    address JSON NOT NULL,
    
    -- Media
    avatar_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    
    -- Offers
    has_active_offers BOOLEAN DEFAULT false,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    
    -- Indexes for search optimization
    INDEX idx_chefs_search (rating DESC, avg_preparation_time ASC),
    INDEX idx_chefs_cuisine USING GIN(cuisine_types),
    INDEX idx_chefs_location USING GIST(location),
    INDEX idx_chefs_active (is_active, is_verified, is_available),
    INDEX idx_chefs_offers (has_active_offers, discount_percentage),
    FULLTEXT INDEX idx_chefs_text_search (specialty, description)
);
```

### Dishes/Menu Table
```sql
CREATE TABLE dishes (
    id VARCHAR(255) PRIMARY KEY,
    chef_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    cuisine_type VARCHAR(100) NOT NULL,
    
    -- Dietary Information
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    spice_level ENUM('mild', 'medium', 'hot') DEFAULT 'medium',
    
    -- Preparation
    preparation_time INT NOT NULL, -- in minutes
    serves INT DEFAULT 1,
    
    -- Ingredients and Allergens
    ingredients JSON, -- Array of ingredients
    allergens JSON, -- Array of allergens
    
    -- Nutrition Information
    nutritional_info JSON, -- {calories, protein, carbs, fat}
    
    -- Availability
    is_available BOOLEAN DEFAULT true,
    
    -- Performance
    rating DECIMAL(3,2) DEFAULT 0,
    total_orders INT DEFAULT 0,
    total_reviews INT DEFAULT 0,
    
    -- Media
    images JSON, -- Array of image URLs
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chef_id) REFERENCES chefs(id) ON DELETE CASCADE,
    
    INDEX idx_dishes_chef (chef_id),
    INDEX idx_dishes_category (category),
    INDEX idx_dishes_cuisine (cuisine_type),
    INDEX idx_dishes_dietary (is_vegetarian, is_vegan, is_gluten_free),
    INDEX idx_dishes_available (is_available),
    INDEX idx_dishes_rating (rating DESC),
    FULLTEXT INDEX idx_dishes_search (name, description)
);
```

### Tips Table for Direct Bank Transfers
```sql
CREATE TABLE tips (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    customer_id VARCHAR(255) NOT NULL,
    recipient_id VARCHAR(255) NOT NULL,
    recipient_type ENUM('chef', 'delivery') NOT NULL,
    
    -- Tip Details
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 10 AND amount <= 500),
    message TEXT,
    
    -- Bank Transfer
    transfer_id VARCHAR(255), -- Bank transfer reference
    bank_transaction_id VARCHAR(255), -- Bank's transaction ID
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id),
    
    -- Ensure one tip per recipient per order
    UNIQUE KEY unique_tip_per_recipient (order_id, recipient_type),
    
    INDEX idx_tips_recipient (recipient_id, created_at DESC),
    INDEX idx_tips_customer (customer_id, created_at DESC),
    INDEX idx_tips_order (order_id),
    INDEX idx_tips_status (status)
);
```

### User Rewards Table
```sql
CREATE TABLE user_rewards (
    user_id VARCHAR(255) PRIMARY KEY,
    total_tokens INT DEFAULT 0,
    lifetime_earned INT DEFAULT 0,
    lifetime_redeemed INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
    
    -- Subscription Info
    subscription_plan_id VARCHAR(255),
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    is_subscription_active BOOLEAN GENERATED ALWAYS AS (
        subscription_end_date IS NOT NULL AND subscription_end_date > NOW()
    ) STORED,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id),
    
    INDEX idx_rewards_tier (tier),
    INDEX idx_rewards_subscription (is_subscription_active)
);
```

### Reward Transactions Table
```sql
CREATE TABLE reward_transactions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    type ENUM('earned', 'redeemed') NOT NULL,
    amount INT NOT NULL,
    description TEXT NOT NULL,
    order_id VARCHAR(255),
    
    -- Redemption Details
    redemption_type ENUM('discount', 'cashback', 'free_delivery'),
    discount_amount DECIMAL(10,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    
    INDEX idx_reward_transactions_user (user_id, created_at DESC),
    INDEX idx_reward_transactions_type (type),
    INDEX idx_reward_transactions_order (order_id)
);
```

### Addresses Table
```sql
CREATE TABLE addresses (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    type ENUM('home', 'work', 'holiday', 'temporary') NOT NULL,
    label VARCHAR(100),
    full_address TEXT NOT NULL,
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    
    -- Coordinates for delivery optimization
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    is_default BOOLEAN DEFAULT false,
    delivery_instructions TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_addresses_user (user_id),
    INDEX idx_addresses_default (user_id, is_default),
    INDEX idx_addresses_location (latitude, longitude),
    INDEX idx_addresses_pincode (pincode)
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    customer_id VARCHAR(255) NOT NULL,
    chef_id VARCHAR(255) NOT NULL,
    dish_id VARCHAR(255),
    
    -- Review Content
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    images JSON, -- Array of image URLs
    tags JSON, -- Array of tags like "delicious", "authentic"
    
    -- Engagement
    helpful_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT false, -- Verified purchase
    
    -- Status
    status ENUM('published', 'pending', 'rejected') DEFAULT 'published',
    moderation_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (chef_id) REFERENCES chefs(id),
    FOREIGN KEY (dish_id) REFERENCES dishes(id),
    
    -- Ensure one review per order
    UNIQUE KEY unique_review_per_order (order_id),
    
    INDEX idx_reviews_chef (chef_id, created_at DESC),
    INDEX idx_reviews_customer (customer_id, created_at DESC),
    INDEX idx_reviews_dish (dish_id, rating DESC),
    INDEX idx_reviews_rating (rating),
    INDEX idx_reviews_status (status)
);
```

### Delivery Partners Table
```sql
CREATE TABLE delivery_partners (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Vehicle Information
    vehicle_type ENUM('motorcycle', 'scooter', 'bicycle', 'car') NOT NULL,
    vehicle_brand VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_number VARCHAR(20) NOT NULL,
    vehicle_color VARCHAR(50),
    
    -- Documents
    driving_license_number VARCHAR(50),
    driving_license_expiry DATE,
    vehicle_registration_number VARCHAR(50),
    insurance_policy_number VARCHAR(50),
    insurance_expiry DATE,
    
    -- Performance Metrics
    rating DECIMAL(3,2) DEFAULT 0,
    total_deliveries INT DEFAULT 0,
    completed_deliveries INT DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 100,
    avg_delivery_time DECIMAL(5,2) DEFAULT 0,
    
    -- Availability
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT false,
    current_location POINT,
    
    -- Working Preferences
    preferred_zones JSON, -- Array of zone IDs
    max_distance_km DECIMAL(5,2) DEFAULT 10,
    
    -- Emergency Contact
    emergency_contact JSON, -- {name, phone, relation}
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    
    INDEX idx_delivery_partners_location USING GIST(current_location),
    INDEX idx_delivery_partners_available (is_available, is_active),
    INDEX idx_delivery_partners_rating (rating DESC)
);
```

### Support Tickets Table
```sql
CREATE TABLE support_tickets (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent', 'critical') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'waiting_customer', 'escalated', 'resolved', 'closed') DEFAULT 'open',
    
    -- Participants
    created_by VARCHAR(255) NOT NULL,
    assigned_to VARCHAR(255),
    
    -- Related Data
    order_id VARCHAR(255),
    chef_id VARCHAR(255),
    delivery_partner_id VARCHAR(255),
    
    -- Resolution
    resolution TEXT,
    resolution_type ENUM('solved', 'workaround', 'duplicate', 'wont_fix'),
    customer_satisfaction INT CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (chef_id) REFERENCES chefs(id),
    FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id),
    
    INDEX idx_tickets_created_by (created_by, created_at DESC),
    INDEX idx_tickets_assigned (assigned_to, status),
    INDEX idx_tickets_status (status),
    INDEX idx_tickets_priority (priority),
    INDEX idx_tickets_category (category)
);
```

### Analytics Tables

#### Order Analytics
```sql
CREATE TABLE order_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(255) NOT NULL,
    
    -- Timing Metrics
    placement_to_acceptance_seconds INT,
    preparation_time_seconds INT,
    delivery_time_seconds INT,
    total_order_time_seconds INT,
    
    -- Cancellation Metrics
    was_cancelled BOOLEAN DEFAULT false,
    cancellation_reason VARCHAR(100),
    cancellation_time_seconds INT,
    penalty_applied DECIMAL(10,2) DEFAULT 0,
    
    -- Financial Metrics
    order_value DECIMAL(10,2),
    platform_fee DECIMAL(10,2),
    chef_earnings DECIMAL(10,2),
    delivery_fee DECIMAL(10,2),
    tip_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Performance Metrics
    customer_rating INT,
    chef_rating INT,
    delivery_rating INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id),
    
    INDEX idx_analytics_order (order_id),
    INDEX idx_analytics_date (created_at),
    INDEX idx_analytics_cancellation (was_cancelled, cancellation_reason)
);
```

#### Platform Analytics
```sql
CREATE TABLE platform_analytics_daily (
    date DATE PRIMARY KEY,
    
    -- Order Metrics
    total_orders INT DEFAULT 0,
    completed_orders INT DEFAULT 0,
    cancelled_orders INT DEFAULT 0,
    avg_order_value DECIMAL(10,2) DEFAULT 0,
    
    -- Revenue Metrics
    gross_revenue DECIMAL(12,2) DEFAULT 0,
    platform_fees DECIMAL(12,2) DEFAULT 0,
    delivery_fees DECIMAL(12,2) DEFAULT 0,
    tip_revenue DECIMAL(12,2) DEFAULT 0,
    
    -- User Metrics
    active_customers INT DEFAULT 0,
    active_chefs INT DEFAULT 0,
    active_delivery_partners INT DEFAULT 0,
    new_registrations INT DEFAULT 0,
    
    -- Performance Metrics
    avg_delivery_time_minutes DECIMAL(5,2) DEFAULT 0,
    customer_satisfaction DECIMAL(3,2) DEFAULT 0,
    chef_acceptance_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Cancellation Metrics
    free_cancellations INT DEFAULT 0,
    penalty_cancellations INT DEFAULT 0,
    total_penalty_collected DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_platform_analytics_date (date DESC)
);
```

## Indexes for Performance

### Search Optimization
```sql
-- Chef search optimization
CREATE INDEX idx_chefs_search_composite ON chefs(
    is_active, is_verified, rating DESC, avg_preparation_time ASC
);

-- Dish search optimization  
CREATE INDEX idx_dishes_search_composite ON dishes(
    is_available, rating DESC, total_orders DESC
);

-- Order search optimization
CREATE INDEX idx_orders_search_composite ON orders(
    customer_id, status, created_at DESC
);
```

### Spatial Indexes
```sql
-- Location-based queries
CREATE SPATIAL INDEX idx_chefs_location ON chefs(location);
CREATE SPATIAL INDEX idx_delivery_partners_location ON delivery_partners(current_location);
```

### Analytics Indexes
```sql
-- Time-series analytics
CREATE INDEX idx_orders_analytics_time ON orders(created_at, status);
CREATE INDEX idx_tips_analytics_time ON tips(created_at, recipient_type);
CREATE INDEX idx_reviews_analytics_time ON reviews(created_at, rating);
```

## Views for Common Queries

### Active Orders View
```sql
CREATE VIEW active_orders AS
SELECT 
    o.*,
    u.name as customer_name,
    u.phone as customer_phone,
    c.name as chef_name,
    c.specialty as chef_specialty,
    dp.name as delivery_partner_name,
    dp.vehicle_number
FROM orders o
JOIN users u ON o.customer_id = u.id
JOIN chefs ch ON o.chef_id = ch.id
JOIN users c ON ch.user_id = c.id
LEFT JOIN delivery_partners dp_table ON o.delivery_partner_id = dp_table.id
LEFT JOIN users dp ON dp_table.user_id = dp.id
WHERE o.status NOT IN ('delivered', 'cancelled');
```

### Chef Performance View
```sql
CREATE VIEW chef_performance AS
SELECT 
    c.id,
    c.user_id,
    u.name,
    c.specialty,
    c.rating,
    c.total_orders,
    c.total_reviews,
    COUNT(o.id) as orders_this_month,
    AVG(o.total) as avg_order_value,
    SUM(CASE WHEN o.status = 'delivered' THEN o.total ELSE 0 END) as revenue_this_month,
    AVG(r.rating) as recent_rating
FROM chefs c
JOIN users u ON c.user_id = u.id
LEFT JOIN orders o ON c.id = o.chef_id AND o.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
LEFT JOIN reviews r ON c.id = r.chef_id AND r.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
GROUP BY c.id, c.user_id, u.name, c.specialty, c.rating, c.total_orders, c.total_reviews;
```

This comprehensive database schema supports all HomeChef features with proper indexing for performance and analytics capabilities.