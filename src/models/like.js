const { query } = require("../utils/database");

/**
 * Like model for managing post likes
 */

const likePost = async (post_id, user_id) => {
	const result = await query(
		`INSERT INTO likes (post_id, user_id, created_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING RETURNING *`,
		[post_id, user_id]
	);
	return result.rows[0];
};

const unlikePost = async (post_id, user_id) => {
	const result = await query(
		`DELETE FROM likes WHERE post_id = $1 AND user_id = $2`,
		[post_id, user_id]
	);
	return result.rowCount > 0;
};

const getPostLikes = async (post_id) => {
	const result = await query(
		`SELECT l.*, u.username, u.full_name FROM likes l JOIN users u ON l.user_id = u.id WHERE l.post_id = $1`,
		[post_id]
	);
	return result.rows;
};

const getUserLikes = async (user_id) => {
	const result = await query(
		`SELECT l.*, p.content, p.media_url FROM likes l JOIN posts p ON l.post_id = p.id WHERE l.user_id = $1`,
		[user_id]
	);
	return result.rows;
};

const hasUserLikedPost = async (post_id, user_id) => {
	const result = await query(
		`SELECT 1 FROM likes WHERE post_id = $1 AND user_id = $2`,
		[post_id, user_id]
	);
	return result.rowCount > 0;
};

module.exports = {
	likePost,
	unlikePost,
	getPostLikes,
	getUserLikes,
	hasUserLikedPost,
};
