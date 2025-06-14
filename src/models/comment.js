const { query } = require("../utils/database");

/**
 * Comment model for managing post comments
 */

const createComment = async ({ post_id, user_id, content }) => {
	const result = await query(
		`INSERT INTO comments (post_id, user_id, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *`,
		[post_id, user_id, content]
	);
	return result.rows[0];
};

const updateComment = async (comment_id, user_id, content) => {
	const result = await query(
		`UPDATE comments SET content = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 AND is_deleted = FALSE RETURNING *`,
		[content, comment_id, user_id]
	);
	return result.rows[0];
};

const deleteComment = async (comment_id, user_id) => {
	const result = await query(
		`UPDATE comments SET is_deleted = TRUE WHERE id = $1 AND user_id = $2`,
		[comment_id, user_id]
	);
	return result.rowCount > 0;
};

const getPostComments = async (post_id, limit = 20, offset = 0) => {
	const result = await query(
		`SELECT c.*, u.username, u.full_name FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = $1 AND c.is_deleted = FALSE ORDER BY c.created_at ASC LIMIT $2 OFFSET $3`,
		[post_id, limit, offset]
	);
	return result.rows;
};

const getCommentById = async (comment_id) => {
	const result = await query(
		`SELECT * FROM comments WHERE id = $1 AND is_deleted = FALSE`,
		[comment_id]
	);
	return result.rows[0] || null;
};

module.exports = {
	createComment,
	updateComment,
	deleteComment,
	getPostComments,
	getCommentById,
};
