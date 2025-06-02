import {create} from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';

export const useChatStore = create((set)=> ({
    messages : [],
    users: [],
    selectedUsers: null,
    isUserLoading: false,
    isMessagesLoading: false,

    getUsers : async () => {
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
        try{
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

    setSelectedUsers: (users) => {
        set({ selectedUsers: users });
    },
}))