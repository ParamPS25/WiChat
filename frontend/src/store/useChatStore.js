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
    isLoadingOlderMessages: false,
    unreadCounts: {},
    pagination: {
        currentPage: 1,
        hasNextPage: false,
        totalPages: 0,
        totalMessages: 0,
        limit: 20
    },

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

    getMessages: async (userId, page = 1, resetMessages = true) => {
        if (page === 1) {
            set({ isMessagesLoading: true });
        } else {
            set({ isLoadingOlderMessages: true });
        }

        try {
            const res = await axiosInstance.get(`/messages/${userId}?page=${page}&limit=20`);
            if (res.data.success) {
                const newMessages = res.data.messages;
                const paginationInfo = res.data.pagination;

                if (resetMessages || page === 1) {
                    // First load - replace all messages
                    set({
                        messages: newMessages,
                        pagination: paginationInfo
                    });
                } else {
                    // Loading older messages - merge and deduplicate
                    const currentMessages = get().messages;
                    const allMessages = [...newMessages, ...currentMessages];

                    // Remove duplicates based on message ID
                    const uniqueMessages = allMessages.filter((message, index, self) =>
                        index === self.findIndex(m => m._id === message._id)
                    );

                    // Sort all messages by createdAt to ensure proper chronological order
                    const sortedMessages = uniqueMessages.sort((a, b) =>
                        new Date(a.createdAt) - new Date(b.createdAt)
                    );

                    set({
                        messages: sortedMessages,
                        pagination: paginationInfo
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch messages.');
        } finally {
            set({
                isMessagesLoading: false,
                isLoadingOlderMessages: false
            });
        }
    },

    loadOlderMessages: async () => {
        const { selectedUser, pagination, isLoadingOlderMessages } = get();

        // console.log('loadOlderMessages called:', {
        //     hasSelectedUser: !!selectedUser,
        //     isLoading: isLoadingOlderMessages,
        //     hasNextPage: pagination?.hasNextPage,
        //     currentPage: pagination?.currentPage,
        //     totalPages: pagination?.totalPages
        // });

        if (!selectedUser || isLoadingOlderMessages || !pagination?.hasNextPage) {
            console.log('Skipping load - conditions not met');
            return;
        }

        const nextPage = pagination.currentPage + 1;
        // console.log('Loading page:', nextPage);
        await get().getMessages(selectedUser._id, nextPage, false);
    },


    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            if (res.data.success) {
                const newMessage = res.data.data;

                // Check if message already exists to prevent duplicates
                const messageExists = messages.some(msg => msg._id === newMessage._id);

                if (!messageExists) {
                    // Add new message and sort to maintain chronological order
                    const updatedMessages = [...messages, newMessage].sort((a, b) =>
                        new Date(a.createdAt) - new Date(b.createdAt)
                    );

                    set({ messages: updatedMessages });
                }
                toast.success('Message sent successfully!');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.response?.data?.message || 'Failed to send message.');
        }
    },


    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;

        if (!socket) {
            console.error("Socket not available");
            return;
        }

        // IMPORTANT: Only remove and re-add newMessage, keep others persistent
        socket.off("newMessage");

        // listen for new messages (this one changes based on selected user)
        socket.on("newMessage", (newMsg) => {
            const { selectedUser, messages } = get();

            if (selectedUser && selectedUser._id === newMsg.senderId) {                 // Only add message if it's from the currently selected user
                // Check if message already exists to prevent duplicates
                const messageExists = messages.some(msg => msg._id === newMsg._id);

                if (!messageExists) {
                    // Add new message and sort to maintain chronological order
                    const updatedMessages = [...messages, newMsg].sort((a, b) =>
                        new Date(a.createdAt) - new Date(b.createdAt)
                    );

                    set({ messages: updatedMessages });
                }

                get().markMessagesAsRead(newMsg.senderId);
            }
        });
    },

    // Separate function for persistent listeners that should never be removed
    initializePersistentListeners: () => {
        const socket = useAuthStore.getState().socket;

        if (!socket) {
            return;
        }

        // Remove existing persistent listeners first
        socket.off("initialUnreadCounts");
        socket.off("updateUnreadCount");

        // Listen for initial unread counts (when user connects) - PERSISTENT
        socket.on("initialUnreadCounts", (counts) => {
            set({ unreadCounts: counts });
        });

        // Listen for real-time unread count updates - PERSISTENT
        socket.on("updateUnreadCount", ({ from, count }) => {
            const { selectedUser } = get();
            const fromId = String(from);

            // ! IMP -> to skip update it user in active chat with that user
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
        });
    },


    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            // Only remove newMessage listener, keep persistent ones
            socket.off("newMessage");
        }
    },

    // complete cleanup for logout/unmount
    cleanupAllListeners: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
            socket.off("newMessage");
            socket.off("updateUnreadCount");
            socket.off("initialUnreadCounts");
        }
    },


    setSelectedUser: async (user) => {
        set({
            selectedUser: user,
            messages: [], // Clear messages when switching users
            pagination: {
                currentPage: 1,
                hasNextPage: false,
                totalPages: 0,
                totalMessages: 0,
                limit: 20
            }
        });

        if (user) {
            await get().markMessagesAsRead(user._id);       // mark messages as read -> when new selected user chat get opened
            get().subscribeToMessages();                    // then sub to msgs
        } else {
            setTimeout(() => {
                get().getUnreadCounts();
            }, 500);
        }
    },


    getUnreadCounts: async () => {
        try {
            const res = await axiosInstance.get("/messages/unread-count");
            if (res.data.success) {
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

            set((state) => ({
                unreadCounts: {
                    ...state.unreadCounts,
                    [senderId]: 0,
                },
            }));
        } catch (err) {
            console.error("Failed to mark messages as read:", err);
        }
    },
}));