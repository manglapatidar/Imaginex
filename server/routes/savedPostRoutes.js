import express from "express"
import savePostController from "../controllers/savePostController.js"
import protect from "../middleware/authMiddleware.js"

const router = express.Router()


router.get("/", protect.forUser, savePostController.getSavePosts)
router.post("/:pid", protect.forUser, savePostController.toggleSavePost)
router.delete("/:pid", protect.forUser, savePostController.removedSavedPost)

export default router