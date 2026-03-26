import express from 'express';
import { neon } from '@neondatabase/serverless';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

const JWT_SECRET = process.env.JWT_SECRET || 'zenith-secret-key-2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || process.env.VITE_APP_URL;

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) : null;

export const REAL_PRODUCTS: Record<string, any[]> = {
  "Coffee": [
    {
      "name": "Espresso",
      "price": 3.00,
      "image": "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Americano",
      "price": 3.50,
      "image": "https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Latte",
      "price": 4.50,
      "image": "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Cappuccino",
      "price": 4.50,
      "image": "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Mocha",
      "price": 5.00,
      "image": "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Caramel Macchiato",
      "price": 5.25,
      "image": "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Tea & Other": [
    {
      "name": "Chai Latte",
      "price": 4.50,
      "image": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Matcha Latte",
      "price": 5.00,
      "image": "https://images.unsplash.com/photo-1536281140500-77814e0c5fb5?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Earl Grey Tea",
      "price": 3.00,
      "image": "https://images.unsplash.com/photo-1594631252845-29fc4cc8cbf9?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Hot Chocolate",
      "price": 4.00,
      "image": "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Pastries": [
    {
      "name": "Butter Croissant",
      "price": 3.50,
      "image": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Chocolate Croissant",
      "price": 4.00,
      "image": "https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Blueberry Muffin",
      "price": 3.75,
      "image": "https://images.unsplash.com/photo-1525124568695-c4c6cd3ea847?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Banana Bread",
      "price": 3.50,
      "image": "https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&q=80&w=800"
    }
  ]
};

const DB_URL = process.env.DB_URL || 'postgresql://neondb_owner:npg_7CR1YVwcemiX@ep-frosty-wildflower-a4c65g6a-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DB_URL);

// Fallback mock data if DB is not connected yet
const MOCK_PRODUCTS = [
  { id: "1", name: "Espresso", price: 3.00, image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=800", department: "Coffee", stock: 100 },
  { id: "2", name: "Latte", price: 4.50, image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=800", department: "Coffee", stock: 100 },
  { id: "3", name: "Butter Croissant", price: 3.50, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800", department: "Pastries", stock: 50 }
];

const MOCK_DEPARTMENTS = [
  "All",
  "Coffee",
  "Tea & Other",
  "Pastries"
];

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});
const PORT = 3000;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

  // Make io available to routes
  app.set('io', io);

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Database Health check
  app.get('/api/db-health', async (req, res) => {
    try {
      
      const result = await sql`SELECT 1 as health`;
      res.json({ status: 'ok', database: 'connected', result });
    } catch (error) {
      console.error('DB Health Check Error:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Database connection failed', 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Test DB connection immediately
  (async () => {
    try {
      
      const result = await sql`SELECT 1 as health`;
      console.log('Database connection test successful:', result);
    } catch (error) {
      console.error('Database connection test failed:', error);
      console.error('DB_URL used:', DB_URL.replace(/:[^:@]+@/, ':****@')); // Mask password
    }
  })();

  // Run migrations in background
  (async () => {
    try {
      
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255)`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255)`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_contact VARCHAR(255)`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255)`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending'`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS staff_id INTEGER REFERENCES users(id)`;
      await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255)`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`;
      await sql`CREATE TABLE IF NOT EXISTS settings (key VARCHAR(255) PRIMARY KEY, value VARCHAR(255) NOT NULL)`;
      await sql`INSERT INTO settings (key, value) VALUES ('exchange_rate', '1') ON CONFLICT (key) DO NOTHING`;
      await sql`CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        user_id INTEGER REFERENCES users(id),
        guest_name VARCHAR(255),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
      console.log('Payment and guest columns checked/added to orders and transactions tables, settings table initialized, feedback table initialized');
    } catch (e) {
      console.error('Migration error:', e);
    }
  })();

  // Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const authorizeRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    };
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name, contact_info, address } = req.body;
      
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await sql`
        INSERT INTO users (email, password_hash, name, role, contact_info, address)
        VALUES (${email}, ${hashedPassword}, ${name}, 'customer', ${contact_info}, ${address})
        RETURNING id, email, name, role, address
      `;
      res.json(result[0]);
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(`Login attempt for: ${email}`);
      
      
      const users = await sql`SELECT * FROM users WHERE email = ${email}`;
      if (users.length === 0) {
        console.log(`User not found: ${email}`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = users[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        console.log(`Invalid password for: ${email}`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      console.log(`Login successful for: ${email} (Role: ${user.role})`);
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, address: user.address, contact_info: user.contact_info } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      
      const user = await sql`
        SELECT id, email, name, role, contact_info, address, profile_image_url, staff_id, created_at
        FROM users
        WHERE id = ${req.user.id}
      `;
      if (user.length > 0) {
        res.json(user[0]);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // Google OAuth Routes
  app.get('/api/auth/google/url', (req, res) => {
    if (!googleClient || !GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google OAuth not configured' });
    }
    
    const getRedirectUri = (req: any) => {
      if (APP_URL) {
        return `${APP_URL.replace(/\/$/, '')}/api/auth/google/callback`;
      }
      return `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    };

    const redirectUri = getRedirectUri(req);
    const url = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      redirect_uri: redirectUri
    });
    res.json({ url });
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      const { code } = req.query;
      if (!googleClient || !GOOGLE_CLIENT_ID || !code) {
        return res.status(400).send('Invalid request');
      }

      const getRedirectUri = (req: any) => {
        if (APP_URL) {
          return `${APP_URL.replace(/\/$/, '')}/api/auth/google/callback`;
        }
        return `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
      };

      const redirectUri = getRedirectUri(req);
      const { tokens } = await googleClient.getToken({
        code: code as string,
        redirect_uri: redirectUri
      });
      
      googleClient.setCredentials(tokens);
      
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      const userInfo = await userInfoRes.json();
      
      
      
      // Check if user exists
      let users = await sql`SELECT * FROM users WHERE email = ${userInfo.email}`;
      let user;
      
      if (users.length === 0) {
        // Create new user
        const result = await sql`
          INSERT INTO users (email, password_hash, name, role)
          VALUES (${userInfo.email}, 'google-auth-no-password', ${userInfo.name}, 'customer')
          RETURNING id, email, name, role, address
        `;
        user = result[0];
      } else {
        user = users[0];
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      const userPayload = { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        address: user.address,
        contact_info: user.contact_info
      };

      // Send success message to parent window and close popup
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  token: '${token}',
                  user: ${JSON.stringify(userPayload)}
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Google Auth error:', error);
      res.status(500).send('Authentication failed');
    }
  });

  // Exchange Rate Routes
  app.get('/api/exchange-rate', async (req, res) => {
    try {
      const result = await sql`SELECT value FROM settings WHERE key = 'exchange_rate'`;
      res.json({ exchange_rate: result[0]?.value || '1' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch exchange rate' });
    }
  });

  app.put('/api/admin/exchange-rate', authenticateToken, authorizeRole(['super_admin', 'accountant']), async (req: any, res) => {
    try {
      const { exchange_rate } = req.body;
      await sql`UPDATE settings SET value = ${exchange_rate} WHERE key = 'exchange_rate'`;
      res.json({ message: 'Exchange rate updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update exchange rate' });
    }
  });

  app.post('/api/paystack/initialize', async (req, res) => {
    const { email, amount, orderId } = req.body;
    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // Paystack amount is in kobo
          reference: `order_${orderId}_${Date.now()}`
        })
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Paystack initialization error:', error);
      res.status(500).json({ error: 'Failed to initialize payment' });
    }
  });

  // API Routes
  app.get('/api/departments', async (req, res) => {
    console.log('GET /api/departments request received');
    try {
      console.time('fetchDepartments');
      const rows = await sql`SELECT name FROM departments ORDER BY name ASC`;
      console.timeEnd('fetchDepartments');
      
      if (rows.length === 0) {
        console.log('No departments found, returning mock data');
        return res.json(MOCK_DEPARTMENTS);
      }
      
      const departments = ["All", ...rows.map((r: any) => r.name)];
      console.log(`Returning ${departments.length} departments`);
      res.json(departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.json(MOCK_DEPARTMENTS); // Fallback to mock on error
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      console.time('fetchProducts');
      const products = await sql`
        SELECT p.id, p.name, p.price, p.image_url as image, p.stock_quantity as stock, d.name as department
        FROM products p
        LEFT JOIN departments d ON p.department_id = d.id
      `;
      console.timeEnd('fetchProducts');
      
      if (products.length === 0) {
        return res.json(MOCK_PRODUCTS);
      }
      
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.json(MOCK_PRODUCTS); // Fallback to mock on error
    }
  });

  app.post('/api/init-db', async (req: any, res) => {
    try {
      // Check if any users exist to allow initial bootstrap
      let usersExist = false;
      try {
        const users = await sql`SELECT id FROM users LIMIT 1`;
        usersExist = users.length > 0;
      } catch (e) {
        // Table might not exist, which is fine for bootstrap
        usersExist = false;
      }

      if (usersExist) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
          // If no token, check if it's a super_admin trying to login? No, this is init-db.
          // We only allow unauthenticated init-db if NO users exist.
          return res.status(401).json({ error: 'Authentication required' });
        }

        try {
          const user: any = jwt.verify(token, JWT_SECRET);
          if (user.role !== 'super_admin') {
            return res.status(403).json({ error: 'Super admin access required' });
          }
          req.user = user;
        } catch (err) {
          return res.status(403).json({ error: 'Invalid token' });
        }
      }

      const shouldReset = req.query.reset === 'true';

      if (shouldReset) {
        await sql`DROP TABLE IF EXISTS transactions CASCADE`;
        await sql`DROP TABLE IF EXISTS order_items CASCADE`;
        await sql`DROP TABLE IF EXISTS orders CASCADE`;
        await sql`DROP TABLE IF EXISTS products CASCADE`;
        await sql`DROP TABLE IF EXISTS departments CASCADE`;
        await sql`DROP TABLE IF EXISTS users CASCADE`;
      }
      
      await ensureDatabaseSchema();
      res.json({ success: true, message: 'Database initialized successfully' });
    } catch (error) {
      console.error('Init DB error:', error);
      res.status(500).json({ error: 'Failed to initialize database' });
    }
  });


  async function logActivity(userId: number, action: string, details?: any) {
    try {
      
      await sql`
        INSERT INTO activities (user_id, action, details)
        VALUES (${userId}, ${action}, ${details ? JSON.stringify(details) : null})
      `;
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  async function ensureDatabaseSchema() {
    try {
      
      
      await sql`
        CREATE TABLE IF NOT EXISTS departments (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL
        )
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS products (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          price DECIMAL(10, 2) NOT NULL,
          image_url TEXT,
          stock_quantity INTEGER DEFAULT 100,
          department_id BIGINT REFERENCES departments(id) ON DELETE CASCADE
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id BIGSERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'customer', -- 'super_admin', 'staff', 'customer', 'accountant', 'secretary'
          contact_info TEXT,
          address TEXT,
          profile_image_url TEXT,
          staff_id VARCHAR(50) UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS activities (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
          action TEXT NOT NULL,
          details JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS orders (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT REFERENCES users(id),
          staff_id BIGINT REFERENCES users(id),
          guest_name VARCHAR(255),
          guest_email VARCHAR(255),
          guest_contact VARCHAR(255),
          total_amount DECIMAL(10, 2) NOT NULL,
          status VARCHAR(50) DEFAULT 'PLACED', -- 'PLACED', 'PAID', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'
          order_type VARCHAR(50) DEFAULT 'pickup', -- 'pickup', 'in-store'
          payment_method VARCHAR(50) DEFAULT 'card',
          payment_reference VARCHAR(255),
          payment_status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      try {
        await sql`ALTER TABLE orders ADD COLUMN guest_name VARCHAR(255)`;
        await sql`ALTER TABLE orders ADD COLUMN guest_email VARCHAR(255)`;
        await sql`ALTER TABLE orders ADD COLUMN guest_contact VARCHAR(255)`;
        await sql`ALTER TABLE orders ADD COLUMN staff_id BIGINT REFERENCES users(id)`;
        await sql`ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'card'`;
        await sql`ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(255)`;
        await sql`ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending'`;
      } catch (e) {
        // Columns might already exist, ignore
      }

      await sql`
        CREATE TABLE IF NOT EXISTS order_items (
          id BIGSERIAL PRIMARY KEY,
          order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
          product_id BIGINT REFERENCES products(id),
          quantity INTEGER NOT NULL,
          price_at_purchase DECIMAL(10, 2) NOT NULL,
          customizations JSONB
        )
      `;

      try {
        await sql`ALTER TABLE order_items ADD COLUMN customizations JSONB`;
      } catch (e) {
        // Column might already exist, ignore
      }

      await sql`
        CREATE TABLE IF NOT EXISTS transactions (
          id BIGSERIAL PRIMARY KEY,
          order_id BIGINT REFERENCES orders(id),
          amount DECIMAL(10, 2) NOT NULL,
          payment_method VARCHAR(50) DEFAULT 'card',
          payment_reference VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS staff_departments (
          staff_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
          department_id BIGINT REFERENCES departments(id) ON DELETE CASCADE,
          PRIMARY KEY (staff_id, department_id)
        )
      `;

      // Add UNIQUE constraint to name if it doesn't exist
      try {
        await sql`ALTER TABLE products ADD CONSTRAINT products_name_key UNIQUE (name)`;
      } catch (e) {
        // Constraint might already exist
      }

      // Create or update initial super admin
      const superAdminEmail = 'harristotle84@gmail.com';
      const adminPassword = await bcrypt.hash('admin123', 10);
      
      // Create or update initial secretary
      const secretaryEmail = 'secretary@zenith.com';
      const secretaryPassword = await bcrypt.hash('secretary123', 10);

      const existingAdmin = await sql`SELECT * FROM users WHERE email = ${superAdminEmail}`;
      let adminId;
      if (existingAdmin.length === 0) {
        const result = await sql`
          INSERT INTO users (email, password_hash, name, role)
          VALUES (${superAdminEmail}, ${adminPassword}, 'Super Admin', 'super_admin')
          RETURNING id
        `;
        adminId = result[0].id;
      } else {
        await sql`
          UPDATE users 
          SET password_hash = ${adminPassword}, role = 'super_admin'
          WHERE email = ${superAdminEmail}
        `;
        adminId = existingAdmin[0].id;
      }

      const existingSecretary = await sql`SELECT * FROM users WHERE email = ${secretaryEmail}`;
      if (existingSecretary.length === 0) {
        await sql`
          INSERT INTO users (email, password_hash, name, role)
          VALUES (${secretaryEmail}, ${secretaryPassword}, 'Secretary', 'secretary')
        `;
      } else {
        await sql`
          UPDATE users 
          SET password_hash = ${secretaryPassword}, role = 'secretary'
          WHERE email = ${secretaryEmail}
        `;
      }

      // Seed departments
      const mockDepts = Object.keys(REAL_PRODUCTS);

      for (const deptName of mockDepts) {
        await sql`
          INSERT INTO departments (name)
          VALUES (${deptName})
          ON CONFLICT (name) DO NOTHING
        `;
      }

      // Seed products
      console.log('Seeding products...');
      
      for (const deptName of Object.keys(REAL_PRODUCTS)) {
        const deptRes = await sql`SELECT id FROM departments WHERE name = ${deptName}`;
        if (deptRes.length > 0) {
          const deptId = deptRes[0].id;
          const products = REAL_PRODUCTS[deptName];
          for (const product of products) {
            await sql`
              INSERT INTO products (name, price, image_url, stock_quantity, department_id)
              VALUES (${product.name}, ${product.price}, ${product.image}, 100, ${deptId})
              ON CONFLICT (name) DO NOTHING
            `;
          }
        }
      }
    } catch (error) {
      console.error('Failed to ensure database schema:', error);
    }
  }

  // Initialize DB schema
  await ensureDatabaseSchema();

  app.put('/api/auth/me', authenticateToken, async (req: any, res) => {
    console.log('PUT /api/auth/me called');
    try {
      const { name, contact_info, profile_image_url, address } = req.body;
      console.log('Request body:', req.body);
      const result = await sql`
        UPDATE users 
        SET name = COALESCE(${name}, name), 
            contact_info = COALESCE(${contact_info}, contact_info), 
            profile_image_url = COALESCE(${profile_image_url}, profile_image_url),
            address = COALESCE(${address}, address)
        WHERE id = ${req.user.id}
        RETURNING id, email, name, role, contact_info, address, profile_image_url, staff_id, created_at
      `;
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Log activity if the user is a staff member or admin
      if (['super_admin', 'staff', 'accountant', 'secretary'].includes(req.user.role)) {
        await logActivity(req.user.id, 'profile_updated', { updated_fields: Object.keys(req.body) });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  app.post('/api/auth/change-password', authenticateToken, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      
      const userRes = await sql`SELECT password_hash FROM users WHERE id = ${req.user.id}`;
      if (userRes.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (userRes[0].password_hash === 'google-auth-no-password') {
        return res.status(400).json({ error: 'Cannot change password for Google authenticated accounts' });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, userRes[0].password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect current password' });
      }
      
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await sql`UPDATE users SET password_hash = ${hashedNewPassword} WHERE id = ${req.user.id}`;
      
      await logActivity(req.user.id, 'password_changed');
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to update password' });
    }
  });

  app.get('/api/orders', authenticateToken, async (req: any, res) => {
    try {
      
      const orders = await sql`
        SELECT o.*, 
               json_agg(json_build_object(
                 'id', oi.id,
                 'product_name', p.name,
                 'quantity', oi.quantity,
                 'price', oi.price_at_purchase,
                 'image', p.image_url
               )) as items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = ${req.user.id}
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
      res.json(orders);
    } catch (error) {
      console.error('Fetch user orders error:', error);
      res.status(500).json({ error: 'Failed to fetch your orders' });
    }
  });

  // Settings
  app.get('/api/admin/settings', authenticateToken, authorizeRole(['super_admin']), async (req: any, res) => {
    try {
      const settings = await sql`SELECT * FROM settings`;
      const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
      res.json(settingsMap);
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ error: 'Failed to get settings' });
    }
  });

  app.put('/api/admin/settings', authenticateToken, authorizeRole(['super_admin']), async (req: any, res) => {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) return res.status(400).json({ error: 'Key and value are required' });
      
      await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = ${value}`;
      res.json({ success: true });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  app.get('/api/admin/accounts', authenticateToken, authorizeRole(['super_admin', 'staff', 'accountant', 'secretary']), async (req: any, res) => {
    try {
      
      const inflow = await sql`SELECT SUM(total_amount) as total FROM orders WHERE status = 'paid'`;
      const recentOrders = await sql`
        SELECT o.*, COALESCE(u.name, o.guest_name, 'Unknown Guest') as customer_name 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC 
        LIMIT 50
      `;
      
      await logActivity(req.user.id, 'Viewed Accounts Dashboard');
      res.json({ totalInflow: inflow[0].total || 0, recentOrders });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  });

  app.get('/api/admin/transactions', authenticateToken, authorizeRole(['super_admin', 'staff', 'accountant', 'secretary']), async (req: any, res) => {
    try {
      
      const transactions = await sql`
        SELECT t.*, o.order_type, 
               COALESCE(u.name, o.guest_name, 'Unknown Guest') as customer_name,
               COALESCE(u.email, o.guest_email) as customer_email,
               COALESCE(u.contact_info, o.guest_contact) as customer_contact,
               s.name as staff_name,
               (SELECT json_agg(json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'product_name', p.name,
                 'quantity', oi.quantity,
                 'price', oi.price_at_purchase
               )) FROM order_items oi 
               JOIN products p ON oi.product_id = p.id 
               WHERE oi.order_id = o.id) as items,
               (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as items_count
        FROM transactions t
        JOIN orders o ON t.order_id = o.id
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN users s ON o.staff_id = s.id
        ORDER BY t.created_at DESC
      `;
      
      await logActivity(req.user.id, 'Viewed Transactions');
      res.json(transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  app.get('/api/admin/staff', authenticateToken, authorizeRole(['super_admin']), async (req, res) => {
    try {
      
      const staff = await sql`
        SELECT u.id, u.email, u.name, u.role, u.contact_info, u.profile_image_url, u.staff_id,
               COALESCE(json_agg(d.name) FILTER (WHERE d.name IS NOT NULL), '[]') as departments
        FROM users u
        LEFT JOIN staff_departments sd ON u.id = sd.staff_id
        LEFT JOIN departments d ON sd.department_id = d.id
        WHERE u.role IN ('staff', 'super_admin', 'accountant', 'secretary')
        GROUP BY u.id
      `;
      res.json(staff);
    } catch (error) {
      console.error('Fetch staff error:', error);
      res.status(500).json({ error: 'Failed to fetch staff' });
    }
  });

  app.get('/api/admin/users', authenticateToken, authorizeRole(['super_admin']), async (req, res) => {
    try {
      
      const users = await sql`
        SELECT id, email, name, role, profile_image_url, created_at
        FROM users
        ORDER BY role, name
      `;
      res.json(users);
    } catch (error) {
      console.error('Fetch users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.get('/api/admin/activities', authenticateToken, authorizeRole(['super_admin']), async (req, res) => {
    try {
      
      const activities = await sql`
        SELECT a.*, u.name as user_name, u.email as user_email, u.role as user_role
        FROM activities a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC 
        LIMIT 200
      `;
      res.json(activities);
    } catch (error) {
      console.error('Fetch activities error:', error);
      res.status(500).json({ error: 'Failed to fetch all activities', details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get('/api/admin/orders', authenticateToken, authorizeRole(['super_admin', 'staff', 'accountant', 'secretary']), async (req: any, res) => {
    try {
      
      const userId = req.user.id;
      const userRole = req.user.role;

      let orders;
      if (userRole === 'super_admin' || userRole === 'accountant') {
        orders = await sql`
          SELECT o.*, 
                 json_agg(json_build_object(
                   'id', oi.id,
                   'product_name', p.name,
                   'quantity', oi.quantity,
                   'price', oi.price_at_purchase,
                   'department', d.name,
                   'customizations', oi.customizations
                 )) as items
          FROM orders o
          JOIN order_items oi ON o.id = oi.order_id
          JOIN products p ON oi.product_id = p.id
          JOIN departments d ON p.department_id = d.id
          GROUP BY o.id
          ORDER BY o.created_at DESC
        `;
      } else {
        orders = await sql`
          SELECT o.*, 
                 json_agg(json_build_object(
                   'id', oi.id,
                   'product_name', p.name,
                   'quantity', oi.quantity,
                   'price', oi.price_at_purchase,
                   'department', d.name,
                   'customizations', oi.customizations
                 )) as items
          FROM orders o
          JOIN order_items oi ON o.id = oi.order_id
          JOIN products p ON oi.product_id = p.id
          JOIN departments d ON p.department_id = d.id
          WHERE o.id IN (
            SELECT DISTINCT oi2.order_id
            FROM order_items oi2
            JOIN products p2 ON oi2.product_id = p2.id
            JOIN staff_departments sd ON p2.department_id = sd.department_id
            WHERE sd.staff_id = ${userId}
          )
          GROUP BY o.id
          ORDER BY o.created_at DESC
        `;
      }
      res.json(orders);
    } catch (error) {
      console.error('Fetch orders error:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.put('/api/admin/orders/:id/status', authenticateToken, authorizeRole(['super_admin', 'staff', 'accountant', 'secretary']), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['PLACED', 'PAID', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      await sql`
        UPDATE orders SET status = ${status} WHERE id = ${id}
      `;

      // Emit socket event for order status update
      const io = req.app.get('io');
      if (io) {
        io.emit('orderStatusUpdate', { orderId: id, status });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  app.post('/api/admin/orders/:id/complete', authenticateToken, authorizeRole(['super_admin', 'staff', 'accountant', 'secretary']), async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const userId = req.user.id;
      const userRole = req.user.role;

      if (userRole !== 'super_admin' && userRole !== 'accountant') {
        const hasPermission = await sql`
          SELECT 1 FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          JOIN staff_departments sd ON p.department_id = sd.department_id
          WHERE oi.order_id = ${id} AND sd.staff_id = ${userId}
          LIMIT 1
        `;
        if (hasPermission.length === 0) {
          return res.status(403).json({ error: 'You do not have permission to update this order' });
        }
      }

      await sql`
        UPDATE orders 
        SET payment_status = 'completed', status = 'completed'
        WHERE id = ${id}
      `;

      // Reduce stock for the items in the order
      const items = await sql`SELECT product_id, quantity FROM order_items WHERE order_id = ${id}`;
      for (const item of items) {
        await sql`UPDATE products SET stock_quantity = stock_quantity - ${item.quantity} WHERE id = ${item.product_id}`;
      }

      await logActivity(userId, 'Completed Order', { order_id: id });
      res.json({ success: true });
    } catch (error) {
      console.error('Complete order error:', error);
      res.status(500).json({ error: 'Failed to complete order' });
    }
  });

  app.delete('/api/admin/orders/:id', authenticateToken, authorizeRole(['super_admin', 'accountant']), async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Delete transactions first due to foreign key constraint
      await sql`DELETE FROM transactions WHERE order_id = ${id}`;
      
      // Restore stock for the items in the order
      const items = await sql`SELECT product_id, quantity FROM order_items WHERE order_id = ${id}`;
      for (const item of items) {
        await sql`UPDATE products SET stock_quantity = stock_quantity + ${item.quantity} WHERE id = ${item.product_id}`;
      }

      // order_items will be deleted automatically due to ON DELETE CASCADE
      await sql`DELETE FROM orders WHERE id = ${id}`;

      await logActivity(userId, 'Deleted Order', { order_id: id });
      res.json({ success: true });
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({ error: 'Failed to delete order' });
    }
  });

  app.get('/api/admin/staff/:id/activities', authenticateToken, authorizeRole(['super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      
      const activities = await sql`
        SELECT * FROM activities 
        WHERE user_id = ${id} 
        ORDER BY created_at DESC 
        LIMIT 100
      `;
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  });

  app.post('/api/admin/staff', authenticateToken, authorizeRole(['super_admin']), async (req: any, res) => {
    try {
      const { email, password, name, role, contact_info, profile_image_url, staff_id, department_ids } = req.body;
      console.log('Creating staff account for:', email);
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const userRes = await sql`
        INSERT INTO users (email, password_hash, name, role, contact_info, profile_image_url, staff_id)
        VALUES (${email}, ${hashedPassword}, ${name}, ${role || 'staff'}, ${contact_info}, ${profile_image_url}, ${staff_id})
        RETURNING id
      `;
      const newStaffId = userRes[0].id;

      if (department_ids && Array.isArray(department_ids) && department_ids.length > 0) {
        for (const deptName of department_ids) {
          const deptRes = await sql`SELECT id FROM departments WHERE name = ${deptName}`;
          if (deptRes.length > 0) {
            await sql`
              INSERT INTO staff_departments (staff_id, department_id)
              VALUES (${newStaffId}, ${deptRes[0].id})
            `;
          }
        }
      }

      await logActivity(req.user.id, 'Created Staff Profile', { staff_name: name, role });
      res.json({ success: true });
    } catch (error) {
      console.error('Create staff error:', error);
      res.status(500).json({ error: 'Failed to create staff account', details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put('/api/admin/staff/:id', authenticateToken, authorizeRole(['super_admin']), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { name, role, contact_info, profile_image_url, staff_id, department_ids } = req.body;
      
      
      // Prevent changing the role of the primary super_admin
      const userToUpdate = await sql`SELECT email FROM users WHERE id = ${id}`;
      if (userToUpdate.length > 0 && userToUpdate[0].email === 'harristotle84@gmail.com' && role !== 'super_admin') {
        return res.status(400).json({ error: 'Cannot change the role of the primary super_admin' });
      }

      // Update user basic info
      await sql`
        UPDATE users 
        SET name = ${name}, 
            role = ${role}, 
            contact_info = ${contact_info}, 
            profile_image_url = ${profile_image_url}, 
            staff_id = ${staff_id}
        WHERE id = ${id} AND role IN ('staff', 'super_admin', 'accountant', 'secretary')
      `;

      // Update departments
      // First, clear existing assignments
      await sql`DELETE FROM staff_departments WHERE staff_id = ${id}`;

      // Then, add new ones
      if (department_ids && Array.isArray(department_ids) && department_ids.length > 0) {
        for (const deptName of department_ids) {
          const deptRes = await sql`SELECT id FROM departments WHERE name = ${deptName}`;
          if (deptRes.length > 0) {
            await sql`
              INSERT INTO staff_departments (staff_id, department_id)
              VALUES (${id}, ${deptRes[0].id})
            `;
          }
        }
      }

      await logActivity(req.user.id, 'Updated Staff Profile', { staff_id: id, name, role });
      res.json({ success: true });
    } catch (error) {
      console.error('Update staff error:', error);
      res.status(500).json({ error: 'Failed to update staff account' });
    }
  });

  app.delete('/api/admin/staff/:id', authenticateToken, authorizeRole(['super_admin']), async (req: any, res) => {
    try {
      const { id } = req.params;
      
      
      // Prevent deleting the last super_admin or oneself
      if (req.user.id === parseInt(id)) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      // Prevent deleting the primary super_admin
      const userToDelete = await sql`SELECT email FROM users WHERE id = ${id}`;
      if (userToDelete.length > 0 && userToDelete[0].email === 'harristotle84@gmail.com') {
        return res.status(400).json({ error: 'Cannot delete the primary super_admin account' });
      }
      
      await sql`DELETE FROM users WHERE id = ${id} AND role IN ('staff', 'super_admin', 'accountant', 'secretary')`;
      await logActivity(req.user.id, 'Deleted Staff Profile', { staff_id: id });
      res.json({ success: true });
    } catch (error) {
      console.error('Delete staff error:', error);
      res.status(500).json({ error: 'Failed to delete staff account' });
    }
  });

  // Order Routes
  app.post('/api/orders', authenticateToken, async (req: any, res) => {
    try {
      const { items, total_amount, order_type, payment_method, payment_reference, payment_status, guest_name, guest_email, guest_contact } = req.body;
      
      
      // Check stock for all items first
      for (const item of items) {
        const product = await sql`SELECT stock_quantity, name FROM products WHERE id = ${item.id}`;
        if (product.length === 0) {
          return res.status(404).json({ error: `Product ${item.id} not found` });
        }
        if (product[0].stock_quantity < item.quantity) {
          return res.status(400).json({ error: `Insufficient stock for ${product[0].name}. Available: ${product[0].stock_quantity}` });
        }
      }

      const isStaff = ['super_admin', 'staff', 'accountant', 'secretary'].includes(req.user.role);
      const staffId = isStaff ? req.user.id : null;
      const userId = isStaff ? null : req.user.id;
      const initialStatus = payment_status === 'paid' ? 'PAID' : 'PLACED';

      const orderResult = await sql`
        INSERT INTO orders (user_id, staff_id, total_amount, order_type, payment_method, payment_reference, payment_status, guest_name, guest_email, guest_contact, status)
        VALUES (${userId}, ${staffId}, ${total_amount}, ${order_type}, ${payment_method || 'card'}, ${payment_reference || null}, ${payment_status || 'pending'}, ${guest_name || null}, ${guest_email || null}, ${guest_contact || null}, ${initialStatus})
        RETURNING id
      `;
      const orderId = orderResult[0].id;

      for (const item of items) {
        await sql`
          INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, customizations)
          VALUES (${orderId}, ${item.id}, ${item.quantity}, ${item.price}, ${item.customizations ? JSON.stringify(item.customizations) : null})
        `;
      }

      await sql`
        INSERT INTO transactions (order_id, amount, payment_reference, payment_method)
        VALUES (${orderId}, ${total_amount}, ${payment_reference || null}, ${payment_method || 'card'})
      `;

      // Emit socket event for new order
      const io = req.app.get('io');
      if (io) {
        io.emit('newOrder', { orderId, status: 'PLACED' });
      }

      res.json({ success: true, orderId });
    } catch (error) {
      console.error('Order error:', error);
      res.status(500).json({ error: 'Failed to place order' });
    }
  });

  app.post('/api/guest-orders', async (req: any, res) => {
    try {
      const { items, total_amount, order_type, guest_name, guest_email, guest_contact, payment_method, payment_reference, payment_status } = req.body;
      
      
      // Check stock for all items first
      for (const item of items) {
        const product = await sql`SELECT stock_quantity, name FROM products WHERE id = ${item.id}`;
        if (product.length === 0) {
          return res.status(404).json({ error: `Product ${item.id} not found` });
        }
        if (product[0].stock_quantity < item.quantity) {
          return res.status(400).json({ error: `Insufficient stock for ${product[0].name}. Available: ${product[0].stock_quantity}` });
        }
      }

      const initialStatus = payment_status === 'paid' ? 'PAID' : 'PLACED';

      const orderResult = await sql`
        INSERT INTO orders (guest_name, guest_email, guest_contact, total_amount, order_type, payment_method, payment_reference, payment_status, status)
        VALUES (${guest_name}, ${guest_email}, ${guest_contact}, ${total_amount}, ${order_type}, ${payment_method || 'card'}, ${payment_reference || null}, ${payment_status || 'pending'}, ${initialStatus})
        RETURNING id
      `;
      const orderId = orderResult[0].id;

      for (const item of items) {
        await sql`
          INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, customizations)
          VALUES (${orderId}, ${item.id}, ${item.quantity}, ${item.price}, ${item.customizations ? JSON.stringify(item.customizations) : null})
        `;
      }

      await sql`
        INSERT INTO transactions (order_id, amount, payment_reference, payment_method)
        VALUES (${orderId}, ${total_amount}, ${payment_reference || null}, ${payment_method || 'card'})
      `;

      // Emit socket event for new order
      const io = req.app.get('io');
      if (io) {
        io.emit('newOrder', { orderId, status: 'PLACED' });
      }

      res.json({ success: true, orderId });
    } catch (error) {
      console.error('Guest order error:', error);
      res.status(500).json({ error: 'Failed to place guest order' });
    }
  });

  app.post('/api/departments', authenticateToken, authorizeRole(['super_admin']), async (req: any, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Name is required' });

      console.log('Adding department:', name);
      
      const result = await sql`INSERT INTO departments (name) VALUES (${name}) RETURNING *`;
      await logActivity(req.user.id, 'Added Department', { department_name: name });
      res.json(result[0]);
    } catch (error) {
      console.error('Add department error:', error);
      res.status(500).json({ error: 'Failed to add department', details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete('/api/departments/:name', authenticateToken, authorizeRole(['super_admin']), async (req: any, res) => {
    try {
      const { name } = req.params;
      
      await sql`DELETE FROM departments WHERE name = ${name}`;
      await logActivity(req.user.id, 'Deleted Department', { department_name: name });
      res.json({ success: true });
    } catch (error) {
      console.error('Delete department error:', error);
      res.status(500).json({ error: 'Failed to delete department' });
    }
  });

  app.post('/api/products', authenticateToken, authorizeRole(['super_admin', 'staff', 'secretary']), async (req: any, res) => {
    try {
      const { name, price, image_url, department_name, stock_quantity } = req.body;
      console.log('Adding product:', name, 'to department:', department_name);
      if (!name || !price || !department_name) {
        return res.status(400).json({ error: 'Name, price, and department are required' });
      }

      
      const deptRes = await sql`SELECT id FROM departments WHERE name = ${department_name}`;
      if (deptRes.length === 0) {
        console.warn('Department not found:', department_name);
        return res.status(400).json({ error: 'Department not found' });
      }
      
      const department_id = deptRes[0].id;
      const finalStock = stock_quantity !== undefined ? stock_quantity : 100;
      
      const result = await sql`
        INSERT INTO products (name, price, image_url, stock_quantity, department_id) 
        VALUES (${name}, ${price}, ${image_url}, ${finalStock}, ${department_id}) 
        RETURNING *
      `;
      await logActivity(req.user.id, 'Added Product', { product_name: name, price });
      res.json(result[0]);
    } catch (error) {
      console.error('Add product error:', error);
      res.status(500).json({ error: 'Failed to add product', details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete('/api/products/:id', authenticateToken, authorizeRole(['super_admin', 'staff', 'secretary']), async (req: any, res) => {
    try {
      const { id } = req.params;
      
      await sql`DELETE FROM products WHERE id = ${id}`;
      await logActivity(req.user.id, 'Deleted Product', { product_id: id });
      res.json({ success: true });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  app.put('/api/products/:id', authenticateToken, authorizeRole(['super_admin', 'staff', 'secretary']), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { name, price, image_url, department_name, stock_quantity } = req.body;
      
      if (!name || !price || !department_name) {
        return res.status(400).json({ error: 'Name, price, and department are required' });
      }

      
      const deptRes = await sql`SELECT id FROM departments WHERE name = ${department_name}`;
      if (deptRes.length === 0) {
        return res.status(400).json({ error: 'Department not found' });
      }
      
      const department_id = deptRes[0].id;
      const finalStock = stock_quantity !== undefined ? stock_quantity : 100;
      
      const result = await sql`
        UPDATE products 
        SET name = ${name}, price = ${price}, image_url = ${image_url}, stock_quantity = ${finalStock}, department_id = ${department_id}
        WHERE id = ${id} 
        RETURNING *
      `;
      await logActivity(req.user.id, 'Updated Product', { product_name: name, product_id: id });
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  // Feedback Routes
  app.get('/api/feedback/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
      const feedback = await sql`
        SELECT f.*, u.name as user_name 
        FROM feedback f 
        LEFT JOIN users u ON f.user_id = u.id 
        WHERE f.product_id = ${productId} 
        ORDER BY f.created_at DESC
      `;
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  });

  app.post('/api/feedback', async (req: any, res) => {
    try {
      const { product_id, user_id, guest_name, rating, comment } = req.body;
      if (!product_id || !rating) {
        return res.status(400).json({ error: 'Product ID and rating are required' });
      }

      const result = await sql`
        INSERT INTO feedback (product_id, user_id, guest_name, rating, comment)
        VALUES (${product_id}, ${user_id || null}, ${guest_name || null}, ${rating}, ${comment})
        RETURNING *
      `;
      res.json(result[0]);
    } catch (error) {
      console.error('Feedback error:', error);
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  });

  app.put('/api/products/:id/stock', authenticateToken, authorizeRole(['super_admin', 'staff', 'secretary']), async (req, res) => {
    try {
      const { id } = req.params;
      const { stock_quantity } = req.body;
      
      if (stock_quantity === undefined) {
        return res.status(400).json({ error: 'Stock quantity is required' });
      }

      
      const result = await sql`
        UPDATE products 
        SET stock_quantity = ${stock_quantity} 
        WHERE id = ${id} 
        RETURNING *
      `;
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({ error: 'Failed to update stock' });
    }
  });

  app.post('/api/newsletter', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      
      await sql`INSERT INTO newsletter_subscribers (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING`;
      res.json({ success: true });
    } catch (error) {
      console.error('Newsletter error:', error);
      res.status(500).json({ error: 'Failed to subscribe' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    // Only serve static files if NOT on Vercel (Vercel handles static files itself)
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }

  // No return needed at top level

// No startServer() call needed at top level

export default app;
