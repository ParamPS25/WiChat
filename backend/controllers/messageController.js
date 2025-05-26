import User from "../models/userSchema.js";
import Message from "../models/messageSchema.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        // Fetch all users except the currently logged-in user ie. the user making the request
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({
            _id: { $ne: loggedInUserId }.select("-password")
        });

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
    const { id: userToChatId } = req.params; // id is the receiverId
    const myId = req.user._id;

    try {
        // Fetch messages between the sender and receiver
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 }); // Sort by creation time

        res.status(200).json({
            success: true,
            messages
        });

    } catch (err) {
        console.error("Error fetching messages:", err.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: "Failed to fetch messages"
        });
    }
}

// message can be text or image
export const sendMessage = async (req, res) => {

    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
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

        // todo : realtime msg using socket.io !!!

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