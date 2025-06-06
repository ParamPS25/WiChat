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
                set({ messages: [...messages, newMessage] });   // keep previous messages and add the new one
                toast.success('Message sent successfully!');    
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.response?.data?.message || 'Failed to send message.');
        }
    },


    // (fixed) bug :- when a is sending to b and b has opened d than a msg will reflected from d due to loose checking of selectedUser from sidebar
    subscribeToMessages : () => {
        const {selectedUser} = get()
        if(!selectedUser){
            return;
        }

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMsg) => {
            const isMessageSentFromSelectedUser = selectedUser._id === newMsg.senderId;
            if(!isMessageSentFromSelectedUser){
                return;
            }
            
            set({
                messages : [...get().messages , newMsg]     // append new msgs to prev ones
            })
        })
    },

    unsubscribeFromMessages : () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage")
    },

    setSelectedUser: (users) => {
        // console.log("Setting selected user:", users);
        set({ selectedUser: users });
    },
}))