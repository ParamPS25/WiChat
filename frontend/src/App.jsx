import React, { useEffect } from 'react'
import Navbar from './components/Navbar'
import { Routes, Route, Navigate } from 'react-router-dom'

import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import { useAuthStore } from './store/useAuthStore'
import { useThemeStore } from './store/useThemeStore'

import Loader from './components/ui/Loader'
import { Toaster } from 'react-hot-toast'
import { useChatStore } from './store/useChatStore'

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, socket } = useAuthStore();
  const { theme } = useThemeStore();
  const {
    getUnreadCounts,
    initializePersistentListeners,
    cleanupAllListeners
  } = useChatStore();
  

  useEffect(() => {
    // check auth only once on mount
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // initialize socket listeners when user is authenticated and socket is available
    if (authUser && socket) {

      // Get initial unread counts
      getUnreadCounts();

      // Set up persistent listeners (unread counts) - these should never be removed
      initializePersistentListeners();

      // Handle socket connection events
      const handleConnect = () => {
        // console.log("Socket reconnected - refreshing persistent listeners");
        getUnreadCounts();
        initializePersistentListeners();
      };

      const handleDisconnect = () => {
        console.log("Socket disconnected");
      };

      // Add connection event listeners
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);

      // If socket is already connected, initialize immediately
      if (socket.connected) {
        handleConnect();
      }

      // Cleanup function - only remove connection event listeners
      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, [authUser, socket, getUnreadCounts, initializePersistentListeners]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      cleanupAllListeners();
    };
  }, [cleanupAllListeners]);


  // console.log({ authUser, socketConnected: socket?.connected });


  if (isCheckingAuth && !authUser) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Loader />
      </div>
    )
  }

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App