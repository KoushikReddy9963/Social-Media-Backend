const { query } = require("../utils/database");
const bcrypt = require("bcryptjs");

/**
 * User model for database operations
 */

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const createUser = async ({ username, email, password, full_name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, username, email, full_name, created_at`,
    [username, email, hashedPassword, full_name],
  );

  return result.rows[0];
};

/**
 * Find user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object or null
 */
const getUserByUsername = async (username) => {
  const result = await query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null
 */
const getUserById = async (id) => {
  const result = await query(
    "SELECT id, username, email, full_name, created_at FROM users WHERE id = $1",
    [id],
  );

  return result.rows[0] || null;
};

/**
 * Verify user password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} Password match result
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Find users by (partial) name with pagination
 * @param {string} name - Partial name to search
 * @param {number} limit - Max results
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of users
 */
const findUsersByName = async (name, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT id, username, email, full_name, created_at FROM users WHERE full_name ILIKE $1 OR username ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [`%${name}%`, limit, offset]
  );
  return result.rows;
};

/**
 * Get user profile with follower/following counts
 * @param {number} userId
 * @returns {Promise<Object|null>} User profile with stats
 */
const getUserProfile = async (userId) => {
  const userResult = await query(
    `SELECT id, username, email, full_name, created_at FROM users WHERE id = $1`,
    [userId]
  );
  if (!userResult.rows[0]) return null;
  const user = userResult.rows[0];
  // Get follower/following counts
  const followCounts = await query(
    `SELECT 
      (SELECT COUNT(*) FROM follows WHERE follower_id = $1) AS following,
      (SELECT COUNT(*) FROM follows WHERE following_id = $1) AS followers`,
    [userId]
  );
  return {
    ...user,
    following: parseInt(followCounts.rows[0].following, 10),
    followers: parseInt(followCounts.rows[0].followers, 10),
  };
};

/**
 * Update user profile (full_name, email, password)
 * @param {number} userId
 * @param {Object} updates - { full_name, email, password }
 * @returns {Promise<Object|null>} Updated user
 */
const updateUserProfile = async (userId, updates) => {
  let setClauses = [];
  let values = [];
  let idx = 1;
  if (updates.full_name) {
    setClauses.push(`full_name = $${idx++}`);
    values.push(updates.full_name);
  }
  if (updates.email) {
    setClauses.push(`email = $${idx++}`);
    values.push(updates.email);
  }
  if (updates.password) {
    const hashed = await bcrypt.hash(updates.password, 10);
    setClauses.push(`password_hash = $${idx++}`);
    values.push(hashed);
  }
  if (setClauses.length === 0) return null;
  values.push(userId);
  const result = await query(
    `UPDATE users SET ${setClauses.join(", ")}, updated_at = NOW() WHERE id = $${idx} RETURNING id, username, email, full_name, created_at`,
    values
  );
  return result.rows[0] || null;
};

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  verifyPassword,
  findUsersByName,
  getUserProfile,
  updateUserProfile,
};
