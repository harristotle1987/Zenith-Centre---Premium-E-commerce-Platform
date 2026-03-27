# ☕ Zenith Centre - Premium Coffee & Retail Management System

Zenith Centre is a sophisticated, full-stack e-commerce and Point of Sale (POS) platform specifically tailored for premium coffee shops and retail environments. It seamlessly integrates a high-end customer storefront with a robust, role-based administrative dashboard for real-time inventory, staff, and financial oversight.

---

## ✨ Key Features

### 🛍️ Customer Experience
- **Editorial UI/UX:** A visually stunning, responsive interface inspired by modern design trends, featuring smooth animations powered by `motion`.
- **Flexible Ordering:** Support for both **In-Shop Pickup** and **Delivery** options.
- **Guest & Member Checkout:** Seamless experience for both registered users and one-time guests.
- **Secure Payments:** Integrated with **Paystack** for reliable local and international transactions.
- **Order History:** Comprehensive dashboard for users to track, sort, and filter their past orders.
- **Multi-Currency Support:** Toggle between **NGN** and **USD** with real-time price adjustments.
- **Authentication:** Secure JWT-based login, registration, and **Google OAuth** integration.

### 🛡️ Administrative Power (POS & Dashboard)
- **Role-Based Access Control (RBAC):**
  - **Super Admin:** Full system oversight, financial analytics, and staff management.
  - **Staff (Secretary/Accountant/Barista):** Manage orders, update inventory, and handle daily operations.
- **Real-Time POS:** A dedicated interface for staff to place orders directly for walk-in customers.
- **Inventory Management:** 
  - Dynamic stock tracking with automatic decrementing on sales.
  - Manual stock adjustments and product management (CRUD).
- **Financial Analytics:** Real-time tracking of total inflow, transaction history, and payment methods.
- **Activity Logs:** Audit trail of all significant administrative actions for transparency.
- **Real-Time Notifications:** Instant updates on new orders via **Socket.io**.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 with TypeScript
- **Styling:** Tailwind CSS 4
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React
- **State Management:** React Hooks (Context/State)
- **Payments:** React Paystack (v6.0.0)

### Backend
- **Runtime:** Node.js (Express)
- **Database:** PostgreSQL (Neon)
- **Real-time:** Socket.io
- **Authentication:** JWT, Bcryptjs, Google Auth Library
- **Validation:** Custom middleware for role-based authorization

---

## 📋 Database Schema

The system uses a highly optimized PostgreSQL schema:
- `users`: Manages profiles, roles, and authentication.
- `products` & `departments`: Handles the catalog and inventory levels.
- `orders` & `order_items`: Tracks every purchase with detailed snapshots.
- `transactions`: Logs financial movements for accounting.
- `activities`: Stores an audit log of administrative changes.

---

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **PostgreSQL** (Recommended: Neon.tech)
- **Paystack Account** (For payment processing)
- **Google Cloud Project** (For Google OAuth)

### Environment Variables
Create a `.env` file in the root directory:
```env
# Database
DB_URL=your_postgresql_connection_string

# Authentication
JWT_SECRET=your_secure_random_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Payments
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# App Configuration
APP_URL=http://localhost:3000
```

### Installation & Setup
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd zenith-centre
   ```

2. **Install dependencies:**
   Due to React 19 peer dependency requirements for some packages, use the following command:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Initialize the Database:**
   The application includes an initialization route. Once the server is running, you can use the "Initialize System" button on the login page or send a POST request to `/api/init-db?reset=true`.

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

---

## 🚀 Deployment (Vercel)

When deploying to Vercel, ensure the following configuration is set in your **Project Settings**:

1. **Install Command:**
   ```bash
   npm install --legacy-peer-deps
   ```
2. **Build Command:**
   ```bash
   npm run build
   ```
3. **Environment Variables:**
   Ensure all variables from your `.env` file are added to the Vercel dashboard.

---

## 🔒 Security & Performance
- **Data Integrity:** All sensitive operations are wrapped in database transactions.
- **Password Hashing:** Industry-standard `bcryptjs` is used for all user and staff passwords.
- **Authentication:** Secure JWT-based sessions with role-specific middleware protection.
- **Optimized Assets:** Images are loaded with lazy-loading and appropriate referrer policies.
- **Scalability:** Designed with a clean separation of concerns between the Express API and React frontend.

---

*Zenith Centre - Elevating the standard of retail management.*
