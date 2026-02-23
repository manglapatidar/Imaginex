import express from "express";
import profileController from "../controllers/profileController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router()

router.get("/followers", protect, profileController.getMyFollowers )
router.get("/followings", protect, profileController.getMyFollowings )

export default router