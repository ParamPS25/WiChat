import express from 'express';
import { protectRoute } from '../middleware/authMiddleware.js';

import { getMessages, getUsersForSidebar, sendMessage, getUnreadMessageCounts, markMessagesAsRead } from '../controllers/messageController.js';

const router = express.Router();

router.get('/unread-count',protectRoute,getUnreadMessageCounts);

router.get('/users', protectRoute , getUsersForSidebar);
router.get('/:id', protectRoute , getMessages);
router.post("/send/:id", protectRoute, sendMessage);


router.patch("/mark-read/:id", protectRoute, markMessagesAsRead);

export default router;