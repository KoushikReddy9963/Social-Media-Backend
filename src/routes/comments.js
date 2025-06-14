const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const commentsController = require("../controllers/comments");

const router = express.Router();

/**
 * Comments routes
 */
// POST /api/comments - Create a comment on a post
router.post("/", authenticateToken, commentsController.create);
// PUT /api/comments/:comment_id - Update a comment
router.put("/:comment_id", authenticateToken, commentsController.update);
// DELETE /api/comments/:comment_id - Delete a comment
router.delete("/:comment_id", authenticateToken, commentsController.remove);
// GET /api/comments/post/:post_id - Get comments for a post
router.get("/post/:post_id", commentsController.getForPost);

module.exports = router;
