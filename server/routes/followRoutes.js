import express from "express";
import followController from "../controllers/followController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router()
router.put("/:uid" , protect , followController.followUserRequest)



export default router


