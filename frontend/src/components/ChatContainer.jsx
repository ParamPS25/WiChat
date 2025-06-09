import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './skeletons/MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import formatMessageTime from '../lib/dateFormat.js';

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    isLoadingOlderMessages,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    loadOlderMessages,
    pagination,
  } = useChatStore();
  const { authUser } = useAuthStore();

  const messagesContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }

    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser]);

  // Scroll to bottom on new messages if near bottom
  useEffect(() => {
    if (isNearBottom && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Scroll handling for pagination + bottom tracking
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Top => Load older messages
      if (scrollTop === 0 && pagination?.hasNextPage && !isLoadingOlderMessages) {
        prevScrollHeightRef.current = scrollHeight;
        loadOlderMessages();
      }

      // Bottom tracking
      const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsNearBottom(nearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [pagination, isLoadingOlderMessages]);

  // After older messages load, maintain scroll position
  useEffect(() => {
    if (!isLoadingOlderMessages && prevScrollHeightRef.current) {
      const container = messagesContainerRef.current;
      const scrollDiff = container.scrollHeight - prevScrollHeightRef.current;
      container.scrollTop = scrollDiff;
      prevScrollHeightRef.current = 0;
    }
  }, [isLoadingOlderMessages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-auto p-4 space-y-4"
      >
        {isLoadingOlderMessages && (
          <div className="flex justify-center py-2">
            <span className="text-sm opacity-60">Loading older messages...</span>
          </div>
        )}

        {!pagination?.hasNextPage && messages.length > 0 && (
          <div className="flex justify-center py-2 text-sm opacity-40">
            You have reached the beginning of the chat
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message._id}
            ref={index === messages.length - 1 ? lastMessageRef : null}
            className={`chat ${message.senderId === authUser._id ? 'chat-end' : 'chat-start'}`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || '/default-avatar.jpeg'
                      : selectedUser.profilePic || '/default-avatar.jpeg'
                  }
                  alt="profile pic"
                />
              </div>
            </div>

            <div
              className={`chat-header mb-1 ${message.senderId === authUser._id ? 'mr-2' : 'ml-2'}`}
            >
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div
              className={`chat-bubble flex flex-col items-center justify-between text-primary-content
              ${message.senderId === authUser._id ? 'bg-primary' : 'bg-secondary'}`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
