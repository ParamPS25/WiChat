import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';

import { getMessages, getUsersForSidebar, sendMessage, getUnreadMessageCounts, markMessagesAsRead } from '../controllers/messageController.js';

const router = express.Router();

// Specific first
router.get('/unread-count', protectRoute, getUnreadMessageCounts);
router.get('/users', protectRoute , getUsersForSidebar);
router.post("/send/:id", protectRoute, sendMessage);
router.patch("/mark-read/:id", protectRoute, markMessagesAsRead);

// Placing this last to avoid conflicts
router.get('/:id', protectRoute , getMessages);

// Why this fixes the crash
// path-to-regexp tries to parse /unread-count as if it’s the :id parameter (because /:id was defined first), and fails to compile the route.

export default router;