import { neon } from '@neondatabase/serverless';

async function test() {
  try {
    const sql = neon('postgresql://neondb_owner:npg_7CR1YVwcemiX@ep-frosty-wildflower-a4c65g6a-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
    const rows = await sql`SELECT 1 as val`;
    console.log('Connection successful:', rows);
  } catch (e) {
    console.error('Connection failed:', e);
  }
}
test();
