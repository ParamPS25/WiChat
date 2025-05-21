import express from 'express';

const router = express.Router();

import {handleSignup,handleLogin,handleLogout} from "../controllers/authController.js" 

router.post("/signup", handleSignup)
router.post("/login", handleLogin)
router.post("/logout" ,handleLogout)

export default router