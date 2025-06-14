const logger = require("../utils/logger");
const {
	likePost,
	unlikePost,
	getPostLikes,
	getUserLikes,
	hasUserLikedPost,
} = require("../models/like");

// Like a post
const like = async (req, res) => {
	try {
		const { post_id } = req.body;
		const user_id = req.user.id;
		const liked = await likePost(post_id, user_id);
		if (!liked) return res.status(409).json({ error: "Already liked" });
		logger.verbose(`User ${user_id} liked post ${post_id}`);
		res.status(201).json({ message: "Post liked" });
	} catch (error) {
		logger.critical("Like post error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Unlike a post
const unlike = async (req, res) => {
	try {
		const { post_id } = req.params;
		const user_id = req.user.id;
		const unliked = await unlikePost(post_id, user_id);
		if (!unliked) return res.status(404).json({ error: "Like not found" });
		logger.verbose(`User ${user_id} unliked post ${post_id}`);
		res.json({ message: "Post unliked" });
	} catch (error) {
		logger.critical("Unlike post error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get likes for a post
const getForPost = async (req, res) => {
	try {
		const { post_id } = req.params;
		const likes = await getPostLikes(post_id);
		res.json({ likes });
	} catch (error) {
		logger.critical("Get post likes error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get posts liked by a user
const getForUser = async (req, res) => {
	try {
		const { user_id } = req.params;
		const likes = await getUserLikes(user_id);
		res.json({ likes });
	} catch (error) {
		logger.critical("Get user likes error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = {
	like,
	unlike,
	getForPost,
	getForUser,
};
