import express from 'express';

const router = express.Router();

import {handleSignup,handleLogin,handleLogout,updateProfile,checkAuth} from "../controllers/authController.js" 

import {protectRoute} from "../middleware/authMiddleware.js"

router.post("/signup", handleSignup)
router.post("/login", handleLogin)
router.post("/logout" ,handleLogout)

router.put("/update-profile", protectRoute, updateProfile)
router.get("/check", protectRoute, checkAuth)
export default router