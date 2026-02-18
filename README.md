# 🍽️ POS — Multi-Restaurant Point of Sale System

A full-featured, multi-tenant Point of Sale system built with **Laravel + Inertia.js + React + TypeScript**.

---

## ✅ Integrated Features

### 🏢 Super Admin
- [x] Company management (CRUD)
- [x] Restaurant management (CRUD, active/inactive toggle)
- [x] User management (CRUD, role assignment)
- [x] Role management (CRUD, system vs custom roles)
- [x] Super Admin dashboard with stats

### 🍕 Inventory
- [x] Category management (CRUD, per-restaurant)
- [x] Product management (CRUD, images, pricing)
- [x] Product variations — sizes with price adjustments
- [x] Product add-ons (linked products as extras)

### 👥 Staff
- [x] Employee management (CRUD, linked user accounts)
- [x] Role-based access control

### 🏠 Restaurant Setup
- [x] Area management (floor zones)
- [x] Table management (capacity, status, area assignment)
- [x] Multi-restaurant switching

### 🖥️ Point of Sale (POS)
- [x] POS terminal with category browsing & product search
- [x] Cart with quantity controls
- [x] Size & add-on selection dialog
- [x] Dine-in / Takeaway / Delivery order types
- [x] Customer selection
- [x] Table selection (dine-in)
- [x] Cash / Card / Online payment methods
- [x] Order creation & receipt generation

### 🔍 Search & Filtering
- [x] Server-side dynamic search on all list pages
- [x] Debounced query-param search (URL-shareable)
- [x] Multi-filter support (status, role, area, restaurant, etc.)

### 🔐 Auth & Settings
- [x] Login / Register / Email verification
- [x] Two-factor authentication (2FA)
- [x] Profile settings (name, email, password, avatar)
- [x] Session management

---

## 🚧 Planned Features (In Progress)

### 📋 Order Management ✅
- [x] Order history list with search & filters (date, status, type)
- [x] Order detail view (items, payment, customer, table)
- [x] Order status updates (pending → preparing → ready → served → paid)
- [x] Print receipt from order detail

### 📊 Reports & Analytics ✅
- [x] Period selector (Today, 7 days, 30 days, Month, Year, Custom range)
- [x] Revenue & orders KPI summary cards
- [x] Revenue over time bar chart (SVG, no external library)
- [x] Revenue by payment method (donut chart + breakdown)
- [x] Revenue by order type (donut chart + breakdown)
- [x] Orders by hour of day (hourly distribution chart)
- [x] Top 10 best-selling products with ranked progress bars

### 📦 Inventory Stock Tracking ✅
- [x] `track_quantity` flag per product (opt-in tracking)
- [x] `stock_alert` threshold per product (configurable low-stock level)
- [x] Auto-deduct stock on every POS sale (inside DB transaction)
- [x] Manual stock adjustments (restock / correction) with dialog
- [x] Stock log history per product (before/after, type, user, order ref)
- [x] Stock Management page with summary KPIs (total / ok / low / out)
- [x] Mini stock bar indicators in product rows
- [x] Filterable by status (In Stock / Low / Out) and restaurant

### 🏟️ Discounts & Promotions ✅
- [x] Discount model with `code`, `type` (percentage/fixed), `value`, `min_order_amount`, `max_discount_amount`, `usage_limit`, date range
- [x] Full CRUD management page (create/edit/delete with dialog, copy-code button)
- [x] Status badges (Active / Inactive / Expired / Scheduled / Limit Reached)
- [x] `apply` API endpoint validates code, checks eligibility, returns discount amount
- [x] POS terminal: discount code input with live Apply button and spinner
- [x] Cart totals show discount line in green with code label
- [x] Tax calculated on discounted subtotal
- [x] `used_count` auto-incremented on successful order
- [x] Discount ID + amount stored on order record

### 🍳 Kitchen Display System (KDS) ✅
- [x] KDS dashboard with real-time polling (every 10s)
- [x] `kitchen_status` (pending/preparing/ready) and `completed_at` tracking
- [x] Kanban-style status cards with elapsed time timer
- [x] Visual indicators for New (Yellow), Cooking (Orange), Ready (Green)
- [x] Status transition buttons (Start Cooking -> Mark Ready -> Complete)
- [x] Detail view of items, addons, sizes, and notes

### 👤 Customer Loyalty
- [ ] Customer purchase history
- [ ] Points / loyalty system
- [ ] Customer profile management

### 🕐 Basic HR (Shifts & Attendance)
- [ ] Shift scheduling per employee
- [ ] Clock-in / clock-out
- [ ] Attendance logs

---

## 🛠️ Setup

### Prerequisites
- PHP 8.2+
- Node.js 18+
- MySQL / MariaDB

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd pos

# Install PHP dependencies
composer install

# Install JS dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate
```

### Database

```bash
# Run migrations
php artisan migrate:fresh

# Run seeders (creates default super admin, roles, etc.)
php artisan db:seed
```

### Development

```bash
# Start Laravel dev server
php artisan serve

# Start Vite dev server (in a separate terminal)
npm run dev
```

### Production Build

```bash
npm run build
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 12 (PHP) |
| Frontend | React 19 + TypeScript |
| SSR Bridge | Inertia.js |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Build Tool | Vite |
| Auth | Laravel Fortify |
| Database | MySQL / MariaDB |

---

## 👤 Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@example.com | password |
