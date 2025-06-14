const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const usersController = require("../controllers/users");

const router = express.Router();

/**
 * User-related routes
 */
// POST /api/users/follow - Follow a user
router.post("/follow", authenticateToken, usersController.follow);
// DELETE /api/users/unfollow - Unfollow a user
router.delete("/unfollow", authenticateToken, usersController.unfollow);
// GET /api/users/following - Get users that current user follows
router.get("/following", authenticateToken, usersController.getMyFollowing);
// GET /api/users/followers - Get users that follow current user
router.get("/followers", authenticateToken, usersController.getMyFollowers);
// GET /api/users/stats - Get follow stats for current user
router.get("/stats", authenticateToken, usersController.getStats);

module.exports = router;
