import express from "express"
import protect from "../middleware/authMiddleware.js"
import postController from "../controllers/postController.js"

const router = express.Router()
router.post("/" , protect.forUser , postController.generateAndPost)
export default router