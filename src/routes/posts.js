const express = require("express");
const { validateRequest, createPostSchema } = require("../utils/validation");
const {
	create,
	getById,
	getUserPosts,
	getMyPosts,
	remove,
	getFeed,
	update,
	search,
} = require("../controllers/posts");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const commentsRoutes = require("./comments");
const likesRoutes = require("./likes");

const router = express.Router();

/**
 * Posts routes
 */

// POST /api/posts - Create a new post
router.post("/", authenticateToken, validateRequest(createPostSchema), create);

// GET /api/posts/my - Get current user's posts
router.get("/my", authenticateToken, getMyPosts);

// GET /api/posts/feed - Get feed posts (from users the current user follows)
router.get("/feed", authenticateToken, getFeed);

// GET /api/posts/search - Search posts by content
router.get("/search", optionalAuth, search);

// PUT /api/posts/:post_id - Update a post
router.put("/:post_id", authenticateToken, update);

// GET /api/posts/:post_id - Get a single post by ID
router.get("/:post_id", optionalAuth, getById);

// GET /api/posts/user/:user_id - Get posts by a specific user
router.get("/user/:user_id", optionalAuth, getUserPosts);

// DELETE /api/posts/:post_id - Delete a post
router.delete("/:post_id", authenticateToken, remove);

// Mount comments and likes as subroutes for posts
router.use("/:post_id/comments", commentsRoutes);
router.use("/:post_id/likes", likesRoutes);

module.exports = router;
