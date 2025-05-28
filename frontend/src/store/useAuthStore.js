import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,

    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get('/auth/check');
            set({ authUser: res.data?.user });

        } catch (error) {
            console.error('Error checking authentication:', error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup : async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post('/auth/signup', data);
            if (res.data.success) {
                toast.success('Account created successfully!');
                set({ authUser: res.data?.user });
            }
        } catch (error) {
            console.error('Error during signup:', error);
            toast.error('Signup failed. Please try again.');
        } finally {
            set({ isSigningUp: false });
        }
    }
}))