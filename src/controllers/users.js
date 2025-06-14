const logger = require("../utils/logger");
const {
	followUser,
	unfollowUser,
	getFollowing,
	getFollowers,
	getFollowCounts,
} = require("../models/follow");

// Follow a user
const follow = async (req, res) => {
	try {
		const { user_id } = req.body;
		const follower_id = req.user.id;
		if (follower_id === user_id) return res.status(400).json({ error: "Cannot follow yourself" });
		const followed = await followUser(follower_id, user_id);
		if (!followed) return res.status(409).json({ error: "Already following" });
		logger.verbose(`User ${follower_id} followed user ${user_id}`);
		res.status(201).json({ message: "User followed" });
	} catch (error) {
		logger.critical("Follow user error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Unfollow a user
const unfollow = async (req, res) => {
	try {
		const { user_id } = req.body;
		const follower_id = req.user.id;
		const unfollowed = await unfollowUser(follower_id, user_id);
		if (!unfollowed) return res.status(404).json({ error: "Not following" });
		logger.verbose(`User ${follower_id} unfollowed user ${user_id}`);
		res.json({ message: "User unfollowed" });
	} catch (error) {
		logger.critical("Unfollow user error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get users that current user follows
const getMyFollowing = async (req, res) => {
	try {
		const user_id = req.user.id;
		const following = await getFollowing(user_id);
		res.json({ following });
	} catch (error) {
		logger.critical("Get following error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get users that follow current user
const getMyFollowers = async (req, res) => {
	try {
		const user_id = req.user.id;
		const followers = await getFollowers(user_id);
		res.json({ followers });
	} catch (error) {
		logger.critical("Get followers error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get follow stats for current user
const getStats = async (req, res) => {
	try {
		const user_id = req.user.id;
		const stats = await getFollowCounts(user_id);
		res.json({ stats });
	} catch (error) {
		logger.critical("Get follow stats error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = {
	follow,
	unfollow,
	getMyFollowing,
	getMyFollowers,
	getStats,
};
