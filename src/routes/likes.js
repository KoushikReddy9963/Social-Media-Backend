const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const likesController = require("../controllers/likes");

const router = express.Router();

/**
 * Likes routes
 */
// POST /api/likes - Like a post
router.post("/", authenticateToken, likesController.like);
// DELETE /api/likes/:post_id - Unlike a post
router.delete("/:post_id", authenticateToken, likesController.unlike);
// GET /api/likes/post/:post_id - Get likes for a post
router.get("/post/:post_id", likesController.getForPost);
// GET /api/likes/user/:user_id - Get posts liked by a user
router.get("/user/:user_id", likesController.getForUser);

module.exports = router;
