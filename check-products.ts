import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

async function checkProducts() {
  const sql = neon(process.env.DB_URL!);
  const products = await sql`SELECT * FROM products LIMIT 5`;
  console.log(JSON.stringify(products, null, 2));
}

checkProducts().catch(console.error);
