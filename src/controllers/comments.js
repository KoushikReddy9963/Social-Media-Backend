const logger = require("../utils/logger");
const {
	createComment,
	updateComment,
	deleteComment,
	getPostComments,
	getCommentById,
} = require("../models/comment");

// Create a comment on a post
const create = async (req, res) => {
	try {
		const { post_id, content } = req.body;
		const user_id = req.user.id;
		const comment = await createComment({ post_id, user_id, content });
		logger.verbose(`User ${user_id} commented on post ${post_id}`);
		res.status(201).json({ message: "Comment created", comment });
	} catch (error) {
		logger.critical("Create comment error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Edit user's own comment
const update = async (req, res) => {
	try {
		const { comment_id } = req.params;
		const { content } = req.body;
		const user_id = req.user.id;
		const updated = await updateComment(comment_id, user_id, content);
		if (!updated) return res.status(404).json({ error: "Comment not found or not owned by user" });
		res.json({ message: "Comment updated", comment: updated });
	} catch (error) {
		logger.critical("Update comment error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Delete user's own comment
const remove = async (req, res) => {
	try {
		const { comment_id } = req.params;
		const user_id = req.user.id;
		const deleted = await deleteComment(comment_id, user_id);
		if (!deleted) return res.status(404).json({ error: "Comment not found or not owned by user" });
		res.json({ message: "Comment deleted" });
	} catch (error) {
		logger.critical("Delete comment error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get comments for a post (with pagination)
const getForPost = async (req, res) => {
	try {
		const { post_id } = req.params;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const offset = (page - 1) * limit;
		const comments = await getPostComments(post_id, limit, offset);
		res.json({ comments, pagination: { page, limit, hasMore: comments.length === limit } });
	} catch (error) {
		logger.critical("Get post comments error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = {
	create,
	update,
	remove,
	getForPost,
};
