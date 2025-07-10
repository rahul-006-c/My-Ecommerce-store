require('dotenv').config();
const express = require('express');
const db = require('./db'); // To initialize pool and test connection

const app = express();
const PORT = process.env.PORT || 3001; // Fallback port

app.use(express.json()); // Middleware to parse JSON bodies

// Simple route to test server
app.get('/', (req, res) => {
  res.send('E-commerce Backend is running!');
});

// TODO: Add routes for products, categories, users, orders, payments
// Example:
// const productRoutes = require('./routes/productRoutes');
// app.use('/api/products', productRoutes);

// Import category routes
const categoryRoutes = require('./routes/categoryRoutes');

// Mount category routes
app.use('/api/categories', categoryRoutes);

// Import product routes
const productRoutes = require('./routes/productRoutes');

// Mount product routes
app.use('/api/products', productRoutes);

// Test database connection on startup by making a simple query
async function testDbConnection() {
  try {
    // Attempt to get a client from the pool and release it immediately
    const client = await db.pool.connect();
    console.log('Successfully acquired a client from the pool.');
    const now = await client.query('SELECT NOW()');
    console.log('Database query successful:', now.rows[0]);
    client.release();
  } catch (err) {
    console.error('Failed to connect to the database or execute query:', err);
    // Note: In a real app, you might want to prevent the app from starting
    // or implement a retry mechanism if the DB is essential.
  }
}

app.listen(PORT, async () => {
  console.log(`Server is listening on port ${PORT}`);
  await testDbConnection(); // Test DB connection after server starts
});
