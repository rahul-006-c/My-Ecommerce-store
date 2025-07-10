const db = require('../db');

const Category = {
  async create({ name, description }) {
    const query = `
      INSERT INTO Categories (name, description)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [name, description];
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  },

  async findAll() {
    const query = 'SELECT * FROM Categories ORDER BY name ASC;';
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (err) {
      console.error('Error finding all categories:', err);
      throw err;
    }
  },

  async findById(id) {
    const query = 'SELECT * FROM Categories WHERE id = $1;';
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (err) {
      console.error(`Error finding category with id ${id}:`, err);
      throw err;
    }
  },

  async update(id, { name, description }) {
    const query = `
      UPDATE Categories
      SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;
    // Note: schema.sql does not have updated_at for Categories.
    // I will adjust the query or recommend updating the schema.
    // For now, removing updated_at from this model query.
    // TODO: Add updated_at to Categories table in schema.sql if desired.
    const updateQuery = `
      UPDATE Categories
      SET name = $1, description = $2
      WHERE id = $3
      RETURNING *;
    `;
    const values = [name, description, id];
    try {
      const { rows } = await db.query(updateQuery, values);
      return rows[0];
    } catch (err) {
      console.error(`Error updating category with id ${id}:`, err);
      throw err;
    }
  },

  async delete(id) {
    const query = 'DELETE FROM Categories WHERE id = $1 RETURNING *;';
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0]; // Returns the deleted category, or undefined if not found
    } catch (err) {
      console.error(`Error deleting category with id ${id}:`, err);
      // Handle foreign key constraint errors, e.g., if products are using this category
      if (err.code === '23503') { // PostgreSQL foreign key violation
        throw new Error('Cannot delete category as it is currently associated with products.');
      }
      throw err;
    }
  }
};

module.exports = Category;
