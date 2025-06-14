const { query } = require("../utils/database");

/**
 * Follow model for managing user relationships
 */

const followUser = async (follower_id, following_id) => {
	const result = await query(
		`INSERT INTO follows (follower_id, following_id, created_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING RETURNING *`,
		[follower_id, following_id]
	);
	return result.rows[0];
};

const unfollowUser = async (follower_id, following_id) => {
	const result = await query(
		`DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
		[follower_id, following_id]
	);
	return result.rowCount > 0;
};

const getFollowing = async (user_id) => {
	const result = await query(
		`SELECT f.*, u.username, u.full_name FROM follows f JOIN users u ON f.following_id = u.id WHERE f.follower_id = $1`,
		[user_id]
	);
	return result.rows;
};

const getFollowers = async (user_id) => {
	const result = await query(
		`SELECT f.*, u.username, u.full_name FROM follows f JOIN users u ON f.follower_id = u.id WHERE f.following_id = $1`,
		[user_id]
	);
	return result.rows;
};

const getFollowCounts = async (user_id) => {
	const following = await query(
		`SELECT COUNT(*) FROM follows WHERE follower_id = $1`,
		[user_id]
	);
	const followers = await query(
		`SELECT COUNT(*) FROM follows WHERE following_id = $1`,
		[user_id]
	);
	return {
		following: parseInt(following.rows[0].count, 10),
		followers: parseInt(followers.rows[0].count, 10),
	};
};

module.exports = {
	followUser,
	unfollowUser,
	getFollowing,
	getFollowers,
	getFollowCounts,
};
