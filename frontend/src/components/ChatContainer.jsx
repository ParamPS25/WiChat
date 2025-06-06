import React, { useEffect, useRef } from 'react'
import { useChatStore } from '../store/useChatStore'
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './skeletons/MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import formatMessageTime from '../lib/dateFormat.js'

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);

  useEffect(() => {
    // console.log('selectedUser:', selectedUser);
    // console.log("auth user from chat container: ", authUser)

    getMessages(selectedUser?._id);

    subscribeToMessages();

    // cleanup
    return () => {
      unsubscribeFromMessages();
    }
  }, [selectedUser, getMessages, authUser, subscribeToMessages, unsubscribeFromMessages]);

  // whenever new message scroll to that msg
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({behavior: "smooth"});
    }

  }, [messages])

  if (isMessagesLoading) {
    return (
      <div className='flex-1 flex flex-col overflow-auto'>
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    )
  }
  return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <ChatHeader />

      {/* message content */}
      <div className='flex-1 overflow-auto p-4 space-y-4'>
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            {/* chat profile pic */}
            <div className='chat-image avatar'>
              <div className='size-10 rounded-full border'>
                <img
                  src={`${message.senderId === authUser._id ? authUser.profilePic || "/default-avatar.jpeg"
                    : selectedUser.profilePic || "/default-avatar.jpeg"}`}
                  alt='profile pic'
                />
              </div>
            </div>

            {/* chat header - time */}
            <div className={`chat-header mb-1 ${message.senderId === authUser._id ? "mr-2 " : "ml-2"}`}>
              <time className='text-xs opacity-50 ml-1'>
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            {/* chat bubble - text || && image */}
            <div className={`chat-bubble flex flex-col items-center justify-between text-primary-content
              ${message.senderId === authUser._id ? "bg-primary " : "bg-secondary"}`}>
              {message.image && (
                <img
                  src={message.image}
                  alt='attachment'
                  className='sm:max-w-[200px] rounded-md mb-2'
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div >
  )
}

export default ChatContainer
