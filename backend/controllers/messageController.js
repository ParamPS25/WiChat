import User from "../models/userSchema.js";
import Message from "../models/messageSchema.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        // Fetch all users except the currently logged-in user ie. the user making the request
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({
            _id: { $ne: loggedInUserId }
        }).select("-password");

        res.status(200).json({
            success: true,
            users: filteredUsers
        });
    } catch (err) {
        console.error("Error fetching users for sidebar:", err.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: "Failed to fetch users"
        });
    }
};

export const getMessages = async (req, res) => {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        // Get total count for pagination info
        const totalMessages = await Message.countDocuments({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        });

        const totalPages = Math.ceil(totalMessages / limit);
        const hasNextPage = page < totalPages;

        // Calculate skip from the END of messages (for reverse pagination)
        const skipFromEnd = (page - 1) * limit;
        const skipFromStart = Math.max(0, totalMessages - skipFromEnd - limit);
        const actualLimit = Math.min(limit, totalMessages - skipFromEnd);

        // Fetch messages with correct pagination logic
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })
            .sort({ createdAt: 1 }) // Always sort chronologically (oldest first)
            .skip(skipFromStart)
            .limit(actualLimit);

        res.status(200).json({
            success: true,
            messages,
            pagination: {
                currentPage: page,
                totalPages,
                totalMessages,
                hasNextPage,
                limit
            }
        });

    } catch (err) {
        console.error("Error fetching messages:", err.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: "Failed to fetch messages"
        });
    }
};


// message can be text or image
export const sendMessage = async (req, res) => {

    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url; // Get the secure URL of the uploaded image
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text: text || null,           // If text is empty, set it to null
            image: imageUrl || null      // If image is not provided, set it to null
        });

        await newMessage.save();

        const unreadMessagesCount = await Message.countDocuments({
            senderId,
            receiverId,
            status: { $ne: "read" },
        });


        // will emit newMessage to client with unread count
        const receiverSocketId = getReceiverSocketId(receiverId); // from params
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);

            io.to(receiverSocketId).emit("updateUnreadCount", {
                from: senderId,
                count: unreadMessagesCount,
            });

            console.log(`Sending updateUnreadCount to ${receiverSocketId}`, {
                from: senderId,
                count: unreadMessagesCount,
            });

        }

        res.status(200).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage
        });

    } catch (err) {
        console.error("Error sending message:", err.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: "Failed to send message"
        });
    }

}


// messages.controller.js
export const getUnreadMessageCounts = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        const messages = await Message.aggregate([
            { $match: { receiverId: currentUserId, status: { $ne: "read" } } },
            {
                $group: {
                    _id: "$senderId",
                    count: { $sum: 1 }
                }
            }
        ]);


        const result = {};
        messages.forEach(msg => {
            result[msg._id] = msg.count;
        });

        res.json({ success: true, counts: result });

    } catch (error) {
        console.error("Error in getUnreadMessageCounts:", error);
        res.status(500).json({ success: false, message: "Failed to fetch unread counts" });
    }
};


export const markMessagesAsRead = async (req, res) => {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    try {
        await Message.updateMany(
            {
                senderId,
                receiverId,
                status: { $ne: "read" },
            },
            { $set: { status: "read" } }
        );

        // notify sender that their unread count on receiver is now 0
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("updateUnreadCount", {
                from: receiverId,
                count: 0,
            });
        }

        res.status(200).json({
            success: true,
            message: "Messages marked as read"
        });
    } catch (err) {
        console.error("Error marking messages as read:", err.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
