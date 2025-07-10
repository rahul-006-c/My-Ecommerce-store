const db = require('../db');
const bcrypt = require('bcryptjs');

const User = {
  async create({ username, email, password, full_name, address }) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO Users (username, email, password_hash, full_name, address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, full_name, address, created_at;
    `;
    const values = [username, email, password_hash, full_name, address];
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (err) {
      console.error('Error creating user:', err);
      if (err.code === '23505') { // Unique constraint violation
        if (err.constraint === 'users_username_key') {
          throw new Error('Username already exists.');
        }
        if (err.constraint === 'users_email_key') {
          throw new Error('Email already registered.');
        }
      }
      throw err;
    }
  },

  async findByEmail(email) {
    const query = 'SELECT * FROM Users WHERE email = $1;';
    try {
      const { rows } = await db.query(query, [email]);
      return rows[0];
    } catch (err) {
      console.error(`Error finding user by email ${email}:`, err);
      throw err;
    }
  },

  async findByUsername(username) {
    const query = 'SELECT * FROM Users WHERE username = $1;';
    try {
      const { rows } = await db.query(query, [username]);
      return rows[0];
    } catch (err) {
      console.error(`Error finding user by username ${username}:`, err);
      throw err;
    }
  },

  async findById(id) {
    const query = 'SELECT id, username, email, full_name, address, created_at FROM Users WHERE id = $1;';
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0]; // Return user without password_hash
    } catch (err) {
      console.error(`Error finding user by id ${id}:`, err);
      throw err;
    }
  },

  async comparePassword(candidatePassword, passwordHash) {
    return bcrypt.compare(candidatePassword, passwordHash);
  },

  // Update user profile (excluding password)
  async updateProfile(id, { full_name, address, email, username }) {
    // Build query dynamically based on provided fields
    const fieldsToUpdate = {};
    if (full_name !== undefined) fieldsToUpdate.full_name = full_name;
    if (address !== undefined) fieldsToUpdate.address = address;
    if (email !== undefined) fieldsToUpdate.email = email; // Add email update
    if (username !== undefined) fieldsToUpdate.username = username; // Add username update

    if (Object.keys(fieldsToUpdate).length === 0) {
        // If only id is passed or no updatable fields, fetch and return current user data
        return this.findById(id);
    }

    const setClauses = Object.keys(fieldsToUpdate).map((key, index) => `${key} = $${index + 1}`);
    const values = Object.values(fieldsToUpdate);

    const query = `
        UPDATE Users
        SET ${setClauses.join(', ')}
        WHERE id = $${values.length + 1}
        RETURNING id, username, email, full_name, address, created_at;
    `;
    values.push(id);

    try {
        const { rows } = await db.query(query, values);
        if (rows.length === 0) return undefined; // User not found
        return rows[0];
    } catch (err) {
        console.error(`Error updating user profile for id ${id}:`, err);
        if (err.code === '23505') { // Unique constraint violation
            if (err.constraint === 'users_username_key') {
              throw new Error('Username already exists.');
            }
            if (err.constraint === 'users_email_key') {
              throw new Error('Email already registered by another user.');
            }
        }
        throw err;
    }
  }
  // TODO: Add method for password change if needed (would involve hashing new password)
};

module.exports = User;
