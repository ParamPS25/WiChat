import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import {io} from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers : [],
    socket : null,
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check');
            set({ authUser: res.data?.user });

            get().connectSocket();
        } catch (error) {
            console.error('Error checking authentication:', error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post('/auth/signup', data);
            if (res.data.success) {
                toast.success('Account created successfully!');
                set({ authUser: res.data?.user });

                get().connectSocket();
            }
        } catch (error) {
            console.error('Error during signup:', error);
            toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null });
            toast.success('Logged out successfully!');

            get().disconnectSocket();
        } catch (error) {
            console.error('Error during logout:', error);
            toast.error(error.response?.data?.message || 'Logout failed. Please try again.');
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post('/auth/login', data);
            if (res.data.success) {
                toast.success('Logged in successfully!');
                set({ authUser: res.data?.user });

                get().connectSocket();
            }
        } catch (error) {
            console.error('Error during login:', error);
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            set({ isLoggingIn: false });
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put('/auth/update-profile', data);
            set({ authUser: res.data?.updatedUser });
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Profile update failed. Please try again.');
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket : () => {
        const { authUser } = get()
        if(!authUser || get().socket?.connected) return;

        // sending userId on handshake with backend
        const socket = io(BASE_URL, {
            transports: ["websocket"],
            withCredentials: true,
            query : {
                userId : authUser._id,
            }
        })
        socket.connect();

        // set up the socket variable
        set({ socket : socket});

        // listen for online users updates -> will receive userIds of online users
        socket.on("getOnlineUsers",(userIds) => {
            set({onlineUsers : userIds})
        })
    }, 
    disconnectSocket : () => {
        if(get().socket?.connected) {
            get().socket.disconnect()
        }
    }
}))
