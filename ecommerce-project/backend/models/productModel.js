const db = require('../db');

const Product = {
  async create({ name, description, price, category_id, stock_quantity, image_url }) {
    const query = `
      INSERT INTO Products (name, description, price, category_id, stock_quantity, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [name, description, price, category_id, stock_quantity, image_url];
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (err) {
      console.error('Error creating product:', err);
      // Check for foreign key violation if category_id is invalid
      if (err.code === '23503') { // PostgreSQL foreign key violation
        throw new Error('Invalid category_id. Category does not exist.');
      }
      throw err;
    }
  },

  async findAll({ categoryId, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' }) {
    let query = 'SELECT p.*, c.name as category_name FROM Products p LEFT JOIN Categories c ON p.category_id = c.id';
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (categoryId) {
      conditions.push(`p.category_id = $${paramCount++}`);
      values.push(categoryId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Basic validation for sortBy to prevent SQL injection if it were directly concatenated
    const validSortColumns = ['name', 'price', 'created_at', 'updated_at', 'stock_quantity'];
    const safeSortBy = validSortColumns.includes(sortBy.toLowerCase()) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY p.${safeSortBy} ${safeSortOrder}`;

    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++};`;
    values.push(limit, offset);

    try {
      const { rows } = await db.query(query, values);
      // Also fetch total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM Products';
      if (categoryId) {
        countQuery += ` WHERE category_id = $1`;
        const countResult = await db.query(countQuery, [categoryId]);
        return { products: rows, total: parseInt(countResult.rows[0].count, 10) };
      } else {
        const countResult = await db.query(countQuery);
        return { products: rows, total: parseInt(countResult.rows[0].count, 10) };
      }
    } catch (err) {
      console.error('Error finding all products:', err);
      throw err;
    }
  },

  async findById(id) {
    const query = `
      SELECT p.*, c.name as category_name
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.id
      WHERE p.id = $1;
    `;
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (err) {
      console.error(`Error finding product with id ${id}:`, err);
      throw err;
    }
  },

  async update(id, fields) {
    // Dynamically build the update query based on fields provided
    const fieldEntries = Object.entries(fields).filter(([key, value]) => value !== undefined);
    if (fieldEntries.length === 0) {
      return this.findById(id); // No fields to update, return current product
    }

    const setClauses = fieldEntries.map(([key], index) => `${key} = $${index + 1}`);
    const values = fieldEntries.map(([, value]) => value);

    const query = `
      UPDATE Products
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${fieldEntries.length + 1}
      RETURNING *;
    `;
    values.push(id);

    try {
      const { rows } = await db.query(query, values);
      if (rows.length === 0) return undefined; // Product not found

      // Fetch the updated product with category name
      return this.findById(rows[0].id);
    } catch (err) {
      console.error(`Error updating product with id ${id}:`, err);
      if (err.code === '23503' && err.constraint === 'products_category_id_fkey') {
        throw new Error('Invalid category_id. Category does not exist.');
      }
      throw err;
    }
  },

  async delete(id) {
    // Check if product is in any order_items. If so, prevent deletion or handle appropriately.
    // For now, schema has ON DELETE RESTRICT for product_id in Order_Items.
    const checkOrderItemsQuery = 'SELECT 1 FROM Order_Items WHERE product_id = $1 LIMIT 1;';
    try {
        const orderItemsResult = await db.query(checkOrderItemsQuery, [id]);
        if (orderItemsResult.rows.length > 0) {
            throw new Error('Cannot delete product as it is part of existing orders. Consider archiving the product instead.');
        }

        const query = 'DELETE FROM Products WHERE id = $1 RETURNING *;';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    } catch (err) {
        console.error(`Error deleting product with id ${id}:`, err);
        if (err.code === '23503') { // Foreign key violation (e.g. if schema changes from RESTRICT)
             throw new Error('Cannot delete product due to existing references.');
        }
        throw err; // Rethrow other errors or the custom one from above
    }
  }
};

module.exports = Product;
