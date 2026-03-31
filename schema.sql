-- SQL Schema for Zenith Centre (Neon Database)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'customer', -- 'super_admin', 'staff', 'accountant', 'secretary', 'customer'
  contact_info TEXT,
  address TEXT,
  profile_image_url TEXT,
  staff_id VARCHAR(50) UNIQUE, -- Internal employee ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  image_url TEXT
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount_percentage INTEGER,
  image_url TEXT,
  description TEXT,
  stock_quantity INTEGER DEFAULT 100,
  department_id BIGINT REFERENCES departments(id) ON DELETE CASCADE,
  options JSONB,
  option_price_modifiers JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  staff_id BIGINT REFERENCES users(id) ON DELETE SET NULL, -- Staff who processed/placed the order
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  guest_contact VARCHAR(255),
  total_amount DECIMAL(10, 2) NOT NULL,
  order_type VARCHAR(50) DEFAULT 'pickup', -- 'pickup', 'delivery'
  payment_method VARCHAR(50) DEFAULT 'card', -- 'card', 'cash', 'transfer'
  payment_reference VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'FAILED', 'COMPLETED'
  status VARCHAR(50) DEFAULT 'PLACED', -- 'PLACED', 'PAID', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'
  delivery_address TEXT,
  delivery_status VARCHAR(50) DEFAULT 'Placed',
  order_number VARCHAR(20) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  customizations JSONB, -- Stores specific order details like sugar level, milk type, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Activities Table (Audit Log)
CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Staff Departments (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS staff_departments (
  staff_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  department_id BIGINT REFERENCES departments(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, department_id)
);

-- 9. Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(255) PRIMARY KEY,
  value VARCHAR(255) NOT NULL
);

-- 10. Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  guest_name VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
