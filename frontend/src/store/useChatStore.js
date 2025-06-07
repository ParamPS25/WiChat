import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading: false,
    unreadCounts: {},

    getUsers: async () => {
        set({ isUserLoading: true });
        try {
            const res = await axiosInstance.get('/messages/users');
            if (res.data.success) {
                set({ users: res.data.users });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch users.');
        } finally {
            set({ isUserLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            if (res.data.success) {
                set({ messages: res.data.messages });
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch messages.');
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            if (res.data.success) {
                const newMessage = res.data.data;
                set({ messages: [...messages, newMessage] });
                toast.success('Message sent successfully!');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.response?.data?.message || 'Failed to send message.');
        }
    },

    subscribeToMessages: () => {
        // console.log("Setting up socket listeners");
        const socket = useAuthStore.getState().socket;
        
        if (!socket) {
            console.error("Socket not available");
            return;
        }

        // IMPORTANT: Only remove and re-add newMessage, keep others persistent
        socket.off("newMessage");

        // listen for new messages (this one changes based on selected user)
        socket.on("newMessage", (newMsg) => {
            // console.log("Received newMessage:", newMsg);
            const { selectedUser } = get();
            
            // Only add message if it's from the currently selected user
            if (selectedUser && selectedUser._id === newMsg.senderId) {
                set({
                    messages: [...get().messages, newMsg],
                });
                
                // Auto-mark as read if chat is open
                get().markMessagesAsRead(newMsg.senderId);
            }
        });

        // console.log("Message listener set up successfully");
    },

    // Separate function for persistent listeners that should never be removed
    initializePersistentListeners: () => {
        // console.log("Setting up persistent socket listeners");
        const socket = useAuthStore.getState().socket;
        
        if (!socket) {
            // console.error("Socket not available for persistent listeners");
            return;
        }

        // Remove existing persistent listeners first
        socket.off("initialUnreadCounts");
        socket.off("updateUnreadCount");

        // Listen for initial unread counts (when user connects) - PERSISTENT
        socket.on("initialUnreadCounts", (counts) => {
            // console.log("Received initialUnreadCounts:", counts);
            set({ unreadCounts: counts });
        });

        // Listen for real-time unread count updates - PERSISTENT
        socket.on("updateUnreadCount", ({ from, count }) => {
            // console.log("Received updateUnreadCount:", { from, count });
            const { selectedUser } = get();
            
            // Convert ObjectId to string for comparison
            const fromId = String(from);
            
            // Don't update count if user is currently chatting with this person
            if (selectedUser && String(selectedUser._id) === fromId) {
                console.log("Skipping count update - user is in active chat with:", fromId);
                return;
            }

            set((state) => ({
                unreadCounts: {
                    ...state.unreadCounts,
                    [fromId]: count,
                },
            }));

            // console.log("Updated unread counts for user:", fromId, "count:", count);
        });

        // console.log("Persistent listeners set up successfully");
    },

    unsubscribeFromMessages: () => {
        //console.log("Unsubscribing from newMessage only");
        const socket = useAuthStore.getState().socket;
        if (socket) {
            // Only remove newMessage listener, keep persistent ones
            socket.off("newMessage");
        }
    },

    // Complete cleanup for logout/unmount
    cleanupAllListeners: () => {
        // console.log("Cleaning up all socket listeners");
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
            socket.off("updateUnreadCount");
            socket.off("initialUnreadCounts");
        }
    },

    setSelectedUser: async (user) => {
        // const previousUser = get().selectedUser;
        // console.log("Setting selected user:", user?._id || 'null');
        
        set({ selectedUser: user });
        
        if (user) {
            // Mark messages as read when opening chat
            await get().markMessagesAsRead(user._id);
            // Set up message listener for this specific user
            get().subscribeToMessages();
        } else {
            // User closed chat - refresh unread counts after a delay
            // console.log("User closed chat, refreshing unread counts");
            setTimeout(() => {
                get().getUnreadCounts();
            }, 500); // Increased delay to ensure backend updates are processed
        }
    },

    getUnreadCounts: async () => {
        try {
            // console.log("Fetching unread counts from API");
            const res = await axiosInstance.get("/messages/unread-count");
            if (res.data.success) {
                // console.log("Fetched unread counts:", res.data.counts);
                set({ unreadCounts: res.data.counts });
            }
        } catch (error) {
            console.error("Error fetching unread counts:", error);
            toast.error("Failed to fetch unread counts");
        }
    },

    markMessagesAsRead: async (senderId) => {
        try {
            await axiosInstance.patch(`/messages/mark-read/${senderId}`);
            
            // Clear unread count for that sender locally
            set((state) => ({
                unreadCounts: {
                    ...state.unreadCounts,
                    [senderId]: 0,
                },
            }));

            // console.log(`Marked messages as read for sender: ${senderId}`);
        } catch (err) {
            console.error("Failed to mark messages as read:", err);
        }
    },
}));