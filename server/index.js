import Fastify from 'fastify';
import cors from '@fastify/cors';
import Database from 'better-sqlite3';

const db = new Database('quisin.db');
const fastify = Fastify({ logger: true });

// Enable CORS
await fastify.register(cors, {
  origin: true
});

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    currency TEXT NOT NULL,
    category TEXT NOT NULL,
    mealType TEXT NOT NULL,
    image TEXT,
    ingredients TEXT,
    allergens TEXT,
    condiments TEXT,
    available INTEGER DEFAULT 1,
    preparationTime TEXT,
    calories INTEGER,
    spicyLevel INTEGER,
    isVegetarian INTEGER,
    isVegan INTEGER,
    isGlutenFree INTEGER
  );

  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    shift_start TEXT,
    shift_end TEXT,
    shift_days TEXT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tables (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL,
    seats INTEGER NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    table_id TEXT NOT NULL,
    items TEXT NOT NULL,
    status TEXT NOT NULL,
    total REAL NOT NULL,
    tax REAL NOT NULL,
    subtotal REAL NOT NULL,
    waiter_id TEXT NOT NULL,
    waiter_name TEXT NOT NULL,
    estimated_time TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Menu Items Routes
fastify.get('/api/menu', async () => {
  const items = db.prepare('SELECT * FROM menu_items').all();
  return items.map(item => ({
    ...item,
    ingredients: JSON.parse(item.ingredients || '[]'),
    allergens: JSON.parse(item.allergens || '[]'),
    condiments: JSON.parse(item.condiments || '[]'),
    available: Boolean(item.available),
    isVegetarian: Boolean(item.isVegetarian),
    isVegan: Boolean(item.isVegan),
    isGlutenFree: Boolean(item.isGlutenFree)
  }));
});

fastify.post('/api/menu', async (request, reply) => {
  const item = request.body;
  const stmt = db.prepare(`
    INSERT INTO menu_items (
      name, description, price, currency, category, mealType,
      image, ingredients, allergens, condiments, available,
      preparationTime, calories, spicyLevel, isVegetarian,
      isVegan, isGlutenFree
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    item.name,
    item.description,
    item.price,
    item.currency,
    item.category,
    item.mealType,
    item.image,
    JSON.stringify(item.ingredients),
    JSON.stringify(item.allergens),
    JSON.stringify(item.condiments),
    Number(item.available),
    item.preparationTime,
    item.calories,
    item.spicyLevel,
    Number(item.isVegetarian),
    Number(item.isVegan),
    Number(item.isGlutenFree)
  );

  reply.code(201).send({ id: result.lastInsertRowid });
});

// Staff Routes
fastify.get('/api/staff', async () => {
  const staff = db.prepare('SELECT * FROM staff').all();
  return staff.map(s => ({
    ...s,
    shift: {
      start: s.shift_start,
      end: s.shift_end,
      days: JSON.parse(s.shift_days)
    }
  }));
});

fastify.post('/api/staff', async (request, reply) => {
  const staff = request.body;
  const stmt = db.prepare(`
    INSERT INTO staff (
      id, name, email, phone, shift_start, shift_end,
      shift_days, username, password, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    staff.id,
    staff.name,
    staff.email,
    staff.phone,
    staff.shift.start,
    staff.shift.end,
    JSON.stringify(staff.shift.days),
    staff.username,
    staff.password,
    staff.status
  );

  reply.code(201).send({ id: staff.id });
});

// Tables Routes
fastify.get('/api/tables', async () => {
  return db.prepare('SELECT * FROM tables').all();
});

fastify.post('/api/tables', async (request, reply) => {
  const table = request.body;
  const stmt = db.prepare(`
    INSERT INTO tables (id, number, seats, location, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    table.id,
    table.number,
    table.seats,
    table.location,
    table.status
  );

  reply.code(201).send({ id: table.id });
});

// Orders Routes
fastify.get('/api/orders', async () => {
  const orders = db.prepare('SELECT * FROM orders').all();
  return orders.map(order => ({
    ...order,
    items: JSON.parse(order.items)
  }));
});

fastify.post('/api/orders', async (request, reply) => {
  const order = request.body;
  const stmt = db.prepare(`
    INSERT INTO orders (
      id, table_id, items, status, total, tax,
      subtotal, waiter_id, waiter_name, estimated_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    order.id,
    order.tableId,
    JSON.stringify(order.items),
    order.status,
    order.total,
    order.tax,
    order.subtotal,
    order.waiterId,
    order.waiterName,
    order.estimatedTime
  );

  reply.code(201).send({ id: order.id });
});

// Authentication Route
fastify.post('/api/auth/login', async (request, reply) => {
  const { username, password } = request.body;
  
  if (username === 'admin' && password === 'admin123') {
    return { id: 'admin', name: 'Admin', role: 'admin' };
  }

  const staff = db.prepare(
    'SELECT * FROM staff WHERE username = ? AND password = ? AND status = ?'
  ).get(username, password, 'active');

  if (staff) {
    return { id: staff.id, name: staff.name, role: 'waiter' };
  }

  reply.code(401).send({ error: 'Invalid credentials' });
});

// Start server
try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}