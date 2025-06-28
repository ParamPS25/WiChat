import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';
import { getMessages, getUsersForSidebar, sendMessage, getUnreadMessageCounts, markMessagesAsRead } from '../controllers/messageController.js';

const router = express.Router();

// IMPORTANT: Specific routes MUST come before parameterized routes
// Otherwise /:id will try to match /unread-count and /users as parameters

// Specific routes first
router.get('/unread-count', protectRoute, getUnreadMessageCounts);
router.get('/users', protectRoute, getUsersForSidebar);

// Parameterized routes with actions
router.post('/send/:id', protectRoute, sendMessage);
router.patch('/mark-read/:id', protectRoute, markMessagesAsRead);

// Generic parameterized route LAST to avoid conflicts
router.get('/:id', protectRoute, getMessages);

export default router;