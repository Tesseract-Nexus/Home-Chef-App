# HomeChef Database Schema

Complete documentation of all database models and their relationships.

## Overview

HomeChef uses PostgreSQL with GORM (Go ORM) for database management. All models include automatic timestamps (`created_at`, `updated_at`) and soft delete support (`deleted_at`).

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    User     │───────│   ChefProfile   │───────│  MenuItem   │
└─────────────┘       └─────────────────┘       └─────────────┘
      │                       │                       │
      │                       │                       │
      ▼                       ▼                       ▼
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    Cart     │       │     Order       │◄──────│  CartItem   │
└─────────────┘       └─────────────────┘       └─────────────┘
      │                       │
      │                       │
      ▼                       ▼
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│  CartItem   │       │   OrderItem     │       │   Review    │
└─────────────┘       └─────────────────┘       └─────────────┘
```

## Models

### User

The core user model supporting multiple roles.

```go
type Role string

const (
    RoleAdmin    Role = "admin"
    RoleChef     Role = "chef"
    RoleDriver   Role = "driver"
    RoleCustomer Role = "customer"
)

type User struct {
    ID        uint           `gorm:"primaryKey"`
    Name      string         `gorm:"not null"`
    Email     string         `gorm:"uniqueIndex;not null"`
    Password  string         `gorm:"not null"` // bcrypt hashed
    Role      Role           `gorm:"not null;default:'customer'"`
    AvatarURL string
    Phone     string
    Points    int            `gorm:"default:0"` // Loyalty points
    CreatedAt time.Time
    UpdatedAt time.Time
    DeletedAt gorm.DeletedAt `gorm:"index"`
}
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uint | PK, auto-increment | Unique identifier |
| name | string | NOT NULL | User's display name |
| email | string | UNIQUE, NOT NULL | Login email |
| password | string | NOT NULL | Bcrypt hashed password |
| role | enum | NOT NULL, default 'customer' | User role |
| avatar_url | string | - | Profile image URL |
| phone | string | - | Contact phone number |
| points | int | default 0 | Loyalty points earned |

**Relationships:**
- Has one `ChefProfile` (if role is chef)
- Has many `Orders` (as customer)
- Has many `Orders` (as driver, via driver_id)
- Has one `Cart`
- Has many `Reviews`
- Has one `AdAccount`

---

### ChefProfile

Extended profile for users with the "chef" role.

```go
type ChefProfile struct {
    ID             uint   `gorm:"primaryKey"`
    UserID         uint   `gorm:"uniqueIndex;not null"`
    User           User   `gorm:"foreignKey:UserID"`
    KitchenName    string `gorm:"not null"`
    Bio            string
    Address        string
    City           string `gorm:"not null"`
    State          string `gorm:"not null"`
    ZipCode        string
    CertificateURL string
    IsVerified     bool   `gorm:"default:false"`
    CreatedAt      time.Time
    UpdatedAt      time.Time
    DeletedAt      gorm.DeletedAt `gorm:"index"`
}
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uint | PK | Unique identifier |
| user_id | uint | UNIQUE, FK(users.id) | Owner user |
| kitchen_name | string | NOT NULL | Kitchen display name |
| bio | string | - | Chef's biography |
| address | string | - | Street address |
| city | string | NOT NULL | City |
| state | string | NOT NULL | State/Province |
| zip_code | string | - | Postal code |
| certificate_url | string | - | Food handler certificate |
| is_verified | bool | default false | Admin verification status |

**Relationships:**
- Belongs to `User` (one-to-one)
- Has many `MenuItems`
- Has many `Orders`
- Has many `Reviews`

---

### MenuItem

Food items offered by chefs.

```go
type MenuItem struct {
    ID            uint        `gorm:"primaryKey"`
    ChefProfileID uint        `gorm:"not null"`
    ChefProfile   ChefProfile `gorm:"foreignKey:ChefProfileID"`
    Name          string      `gorm:"not null"`
    Description   string
    Price         float64     `gorm:"not null"`
    ImageURL      string
    IsAvailable   bool        `gorm:"default:true"`
    CreatedAt     time.Time
    UpdatedAt     time.Time
    DeletedAt     gorm.DeletedAt `gorm:"index"`
}
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uint | PK | Unique identifier |
| chef_profile_id | uint | FK(chef_profiles.id) | Owner chef |
| name | string | NOT NULL | Item name |
| description | string | - | Item description |
| price | float64 | NOT NULL | Price in dollars |
| image_url | string | - | Item image URL |
| is_available | bool | default true | Availability status |

**Relationships:**
- Belongs to `ChefProfile`
- Has many `CartItems`
- Has many `OrderItems`

---

### Cart

Shopping cart for customers.

```go
type Cart struct {
    ID        uint       `gorm:"primaryKey"`
    UserID    uint       `gorm:"uniqueIndex;not null"`
    User      User       `gorm:"foreignKey:UserID"`
    CartItems []CartItem `gorm:"foreignKey:CartID"`
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uint | PK | Unique identifier |
| user_id | uint | UNIQUE, FK(users.id) | Cart owner |

**Constraints:**
- One cart per user (enforced by unique user_id)
- Items must be from the same chef (enforced by application logic)

**Relationships:**
- Belongs to `User` (one-to-one)
- Has many `CartItems`

---

### CartItem

Individual items in a shopping cart.

```go
type CartItem struct {
    ID         uint     `gorm:"primaryKey"`
    CartID     uint     `gorm:"not null"`
    Cart       Cart     `gorm:"foreignKey:CartID"`
    MenuItemID uint     `gorm:"not null"`
    MenuItem   MenuItem `gorm:"foreignKey:MenuItemID"`
    Quantity   uint     `gorm:"not null;default:1"`
    CreatedAt  time.Time
    UpdatedAt  time.Time
}
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uint | PK | Unique identifier |
| cart_id | uint | FK(carts.id) | Parent cart |
| menu_item_id | uint | FK(menu_items.id) | Referenced menu item |
| quantity | uint | NOT NULL, default 1 | Item quantity |

**Relationships:**
- Belongs to `Cart`
- Belongs to `MenuItem`

---

### Order

Customer orders placed through checkout.

```go
type OrderStatus string

const (
    OrderStatusPending        OrderStatus = "pending"
    OrderStatusProcessing     OrderStatus = "processing"
    OrderStatusOutForDelivery OrderStatus = "out_for_delivery"
    OrderStatusDelivered      OrderStatus = "delivered"
    OrderStatusCancelled      OrderStatus = "cancelled"
)

type Order struct {
    ID              uint        `gorm:"primaryKey"`
    UserID          uint        `gorm:"not null"`
    User            User        `gorm:"foreignKey:UserID"`
    ChefProfileID   uint        `gorm:"not null"`
    ChefProfile     ChefProfile `gorm:"foreignKey:ChefProfileID"`
    DriverID        *uint       // Nullable
    Driver          User        `gorm:"foreignKey:DriverID"`
    OrderItems      []OrderItem `gorm:"foreignKey:OrderID"`
    Status          OrderStatus `gorm:"not null;default:'pending'"`
    TotalAmount     float64     `gorm:"not null"`
    OrderDate       time.Time   `gorm:"not null"`
    DeliveryAddress string
    CreatedAt       time.Time
    UpdatedAt       time.Time
    DeletedAt       gorm.DeletedAt `gorm:"index"`
}
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uint | PK | Unique identifier |
| user_id | uint | FK(users.id) | Customer who placed order |
| chef_profile_id | uint | FK(chef_profiles.id) | Chef fulfilling order |
| driver_id | uint* | FK(users.id), NULLABLE | Assigned delivery driver |
| status | enum | NOT NULL, default 'pending' | Order status |
| total_amount | float64 | NOT NULL | Order total in dollars |
| order_date | timestamp | NOT NULL | When order was placed |
| delivery_address | string | - | Delivery destination |

**Order Status Flow:**
```
pending → processing → out_for_delivery → delivered
    │
    └──────────────→ cancelled
```

**Relationships:**
- Belongs to `User` (as customer)
- Belongs to `ChefProfile`
- Belongs to `User` (as driver, optional)
- Has many `OrderItems`
- Has one `Review`

---

### OrderItem

Individual items within an order.

```go
type OrderItem struct {
    ID           uint     `gorm:"primaryKey"`
    OrderID      uint     `gorm:"not null"`
    Order        Order    `gorm:"foreignKey:OrderID"`
    MenuItemID   uint     `gorm:"not null"`
    MenuItem     MenuItem `gorm:"foreignKey:MenuItemID"`
    Quantity     uint     `gorm:"not null"`
    PriceAtOrder float64  `gorm:"not null"` // Price snapshot
    CreatedAt    time.Time
    UpdatedAt    time.Time
}
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uint | PK | Unique identifier |
| order_id | uint | FK(orders.id) | Parent order |
| menu_item_id | uint | FK(menu_items.id) | Ordered item |
| quantity | uint | NOT NULL | Item quantity |
| price_at_order | float64 | NOT NULL | Price when ordered (snapshot) |

**Note:** `price_at_order` captures the price at the time of order, preventing issues if menu prices change later.

**Relationships:**
- Belongs to `Order`
- Belongs to `MenuItem`

---

### Review

Customer reviews for completed orders.

```go
type ReviewStatus string

const (
    ReviewStatusPending  ReviewStatus = "pending"
    ReviewStatusApproved ReviewStatus = "approved"
    ReviewStatusRejected ReviewStatus = "rejected"
)

type Review struct {
    ID            uint         `gorm:"primaryKey"`
    OrderID       uint         `gorm:"uniqueIndex;not null"`
    Order         Order        `gorm:"foreignKey:OrderID"`
    UserID        uint         `gorm:"not null"`
    User          User         `gorm:"foreignKey:UserID"`
    ChefProfileID uint         `gorm:"not null"`
    ChefProfile   ChefProfile  `gorm:"foreignKey:ChefProfileID"`
    Rating        int          `gorm:"not null"` // 1-5
    Comment       string
    Status        ReviewStatus `gorm:"not null;default:'pending'"`
    CreatedAt     time.Time
    UpdatedAt     time.Time
    DeletedAt     gorm.DeletedAt `gorm:"index"`
}
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uint | PK | Unique identifier |
| order_id | uint | UNIQUE, FK(orders.id) | Associated order |
| user_id | uint | FK(users.id) | Review author |
| chef_profile_id | uint | FK(chef_profiles.id) | Reviewed chef |
| rating | int | NOT NULL, 1-5 | Star rating |
| comment | string | - | Written review |
| status | enum | NOT NULL, default 'pending' | Moderation status |

**Constraints:**
- One review per order (enforced by unique order_id)
- Order must be delivered before review (enforced by application)
- Only order owner can review (enforced by application)

**Review Status Flow:**
```
pending → approved
    │
    └──→ rejected
```

**Relationships:**
- Belongs to `Order` (one-to-one)
- Belongs to `User`
- Belongs to `ChefProfile`

---

### AdAccount

Advertising account for users.

```go
type AdAccount struct {
    ID           uint   `gorm:"primaryKey"`
    UserID       uint   `gorm:"not null"`
    User         User   `gorm:"foreignKey:UserID"`
    BusinessName string `gorm:"not null"`
    CreatedAt    time.Time
    UpdatedAt    time.Time
}
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uint | PK | Unique identifier |
| user_id | uint | FK(users.id) | Account owner |
| business_name | string | NOT NULL | Business display name |

**Relationships:**
- Belongs to `User`
- Has many `AdCampaigns`

---

### AdCampaign

Advertising campaigns with budget and date range.

```go
type AdCampaign struct {
    ID          uint      `gorm:"primaryKey"`
    AdAccountID uint      `gorm:"not null"`
    AdAccount   AdAccount `gorm:"foreignKey:AdAccountID"`
    Name        string    `gorm:"not null"`
    Budget      float64   `gorm:"not null"`
    StartDate   time.Time `gorm:"not null"`
    EndDate     time.Time `gorm:"not null"`
    IsActive    bool      `gorm:"default:false"`
    CreatedAt   time.Time
    UpdatedAt   time.Time
}
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uint | PK | Unique identifier |
| ad_account_id | uint | FK(ad_accounts.id) | Parent account |
| name | string | NOT NULL | Campaign name |
| budget | float64 | NOT NULL | Campaign budget |
| start_date | timestamp | NOT NULL | Campaign start |
| end_date | timestamp | NOT NULL | Campaign end |
| is_active | bool | default false | Active status |

**Relationships:**
- Belongs to `AdAccount`
- Has many `Ads`

---

### Ad

Individual advertisements within a campaign.

```go
type Ad struct {
    ID           uint       `gorm:"primaryKey"`
    AdCampaignID uint       `gorm:"not null"`
    AdCampaign   AdCampaign `gorm:"foreignKey:AdCampaignID"`
    Title        string     `gorm:"not null"`
    Content      string     `gorm:"not null"`
    ImageURL     string
    TargetURL    string
    CreatedAt    time.Time
    UpdatedAt    time.Time
}
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uint | PK | Unique identifier |
| ad_campaign_id | uint | FK(ad_campaigns.id) | Parent campaign |
| title | string | NOT NULL | Ad headline |
| content | string | NOT NULL | Ad body text |
| image_url | string | - | Ad image |
| target_url | string | - | Click destination |

**Relationships:**
- Belongs to `AdCampaign`
- Has many `AdImpressions`
- Has many `AdClicks`

---

### AdImpression

Tracks when an ad is displayed.

```go
type AdImpression struct {
    ID        uint `gorm:"primaryKey"`
    AdID      uint `gorm:"not null"`
    Ad        Ad   `gorm:"foreignKey:AdID"`
    UserID    uint // Optional - anonymous impressions allowed
    CreatedAt time.Time
}
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uint | PK | Unique identifier |
| ad_id | uint | FK(ads.id) | Displayed ad |
| user_id | uint | NULLABLE | Viewing user (if logged in) |
| created_at | timestamp | - | Impression time |

---

### AdClick

Tracks when an ad is clicked.

```go
type AdClick struct {
    ID        uint `gorm:"primaryKey"`
    AdID      uint `gorm:"not null"`
    Ad        Ad   `gorm:"foreignKey:AdID"`
    UserID    uint // Optional
    CreatedAt time.Time
}
```

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uint | PK | Unique identifier |
| ad_id | uint | FK(ads.id) | Clicked ad |
| user_id | uint | NULLABLE | Clicking user (if logged in) |
| created_at | timestamp | - | Click time |

---

## Indexes

The following indexes are automatically created:

| Table | Column(s) | Type | Purpose |
|-------|-----------|------|---------|
| users | email | UNIQUE | Login lookup |
| users | deleted_at | INDEX | Soft delete queries |
| chef_profiles | user_id | UNIQUE | One profile per user |
| chef_profiles | deleted_at | INDEX | Soft delete queries |
| carts | user_id | UNIQUE | One cart per user |
| orders | user_id | INDEX | Customer order lookup |
| orders | chef_profile_id | INDEX | Chef order lookup |
| orders | driver_id | INDEX | Driver order lookup |
| orders | deleted_at | INDEX | Soft delete queries |
| reviews | order_id | UNIQUE | One review per order |
| reviews | deleted_at | INDEX | Soft delete queries |

---

## Migration

GORM auto-migrates all models on application startup:

```go
initializers.DB.AutoMigrate(
    &models.User{},
    &models.ChefProfile{},
    &models.MenuItem{},
    &models.Cart{},
    &models.CartItem{},
    &models.Order{},
    &models.OrderItem{},
    &models.Review{},
    &models.AdAccount{},
    &models.AdCampaign{},
    &models.Ad{},
    &models.AdImpression{},
    &models.AdClick{},
)
```

**Note:** For production, consider using versioned migrations instead of auto-migrate.
