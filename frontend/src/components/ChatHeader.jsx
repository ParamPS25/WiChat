import { React, useEffect } from 'react'
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { IoCloseSharp } from "react-icons/io5";


const ChatHeader = () => {

  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    console.log('selectedUser:', selectedUser);
  }, [selectedUser]);

  return (
    <div className='p-2.5 border-b border-base-300'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          {/* avatar */}
          <div className='avatar'>
            <div className='size-10 rounded-full relative'>
              <img src={selectedUser?.profilePic || '/default-avatar.jpeg'} alt="avatar" />
            </div>
          </div>

          {/* user info */}
          <div className=''>
            <h3 className='font-medium'>{selectedUser.fullName}</h3>
            <p className='text-sm text-base-content/70'>
              {onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {/* close button */}
        <div className='flex items-center'>
          <button
            className='btn btn-ghost btn-sm'
            onClick={() => setSelectedUser(null)}
          >
            <IoCloseSharp className='w-5 h-5 text-base-content/70 hover:text-base-content transition-colors' />
          </button>
        </div>

      </div>
    </div>
  )
}

export default ChatHeader
