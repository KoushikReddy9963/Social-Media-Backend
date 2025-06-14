const { query } = require("../utils/database");

/**
 * Post model for database operations
 */

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created post
 */
const createPost = async ({
  user_id,
  content,
  media_url,
  comments_enabled = true,
}) => {
  const result = await query(
    `INSERT INTO posts (user_id, content, media_url, comments_enabled, created_at, is_deleted)
     VALUES ($1, $2, $3, $4, NOW(), true)
     RETURNING id, user_id, content, media_url, comments_enabled, created_at`,
    [user_id, content, media_url, comments_enabled],
  );

  return result.rows[0];
};

/**
 * Get post by ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object|null>} Post object or null
 */
const getPostById = async (postId) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [postId],
  );

  return result.rows[0] || null;
};

/**
 * Get posts by user ID
 * @param {number} userId - User ID
 * @param {number} limit - Number of posts to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of posts
 */
const getPostsByUserId = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );

  return result.rows;
};

/**
 * Delete a post
 * @param {number} postId - Post ID
 * @param {number} userId - User ID (for ownership verification)
 * @returns {Promise<boolean>} Success status
 */
const deletePost = async (postId, userId) => {
  const result = await query(
    "UPDATE posts SET is_deleted = TRUE WHERE id = $1 AND user_id = $2",
    [postId, userId],
  );

  return result.rowCount > 0;
};

/**
 * Get feed posts from users followed by the given user
 * @param {number} userId
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Array>} Feed posts
 */
const getFeedPosts = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1)
       AND p.is_deleted = FALSE
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
};

/**
 * Update a post (content, media_url, comments_enabled)
 * @param {number} postId
 * @param {number} userId
 * @param {Object} updates
 * @returns {Promise<Object|null>} Updated post
 */
const updatePost = async (postId, userId, updates) => {
  let setClauses = [];
  let values = [];
  let idx = 1;
  if (updates.content) {
    setClauses.push(`content = $${idx++}`);
    values.push(updates.content);
  }
  if (updates.media_url) {
    setClauses.push(`media_url = $${idx++}`);
    values.push(updates.media_url);
  }
  if (typeof updates.comments_enabled === "boolean") {
    setClauses.push(`comments_enabled = $${idx++}`);
    values.push(updates.comments_enabled);
  }
  if (setClauses.length === 0) return null;
  values.push(postId);
  values.push(userId);
  const result = await query(
    `UPDATE posts SET ${setClauses.join(", ")}, updated_at = NOW() WHERE id = $${idx++} AND user_id = $${idx} AND is_deleted = FALSE RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

/**
 * Search posts by content (case-insensitive, partial match)
 * @param {string} queryStr
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Array>} Array of posts
 */
const searchPosts = async (queryStr, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.content ILIKE $1 AND p.is_deleted = FALSE
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [`%${queryStr}%`, limit, offset]
  );
  return result.rows;
};

module.exports = {
  createPost,
  getPostById,
  getPostsByUserId,
  deletePost,
  getFeedPosts,
  updatePost,
  searchPosts,
};
