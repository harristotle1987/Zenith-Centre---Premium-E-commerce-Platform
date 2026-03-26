import fetch from 'node-fetch';

async function seed() {
  console.log('Initializing DB...');
  await fetch('http://localhost:3000/api/init-db', { method: 'POST' });
  
  console.log('Seeding DB...');
  const res = await fetch('http://localhost:3000/api/seed-db', { method: 'POST' });
  const data = await res.json();
  console.log(data);
}

seed();
