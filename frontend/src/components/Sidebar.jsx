import { React, useEffect, useState } from 'react'
import { useChatStore } from '../store/useChatStore';
import { SidebarSkeleton } from './skeletons/SidebarSkeleton';
import { LuUser } from "react-icons/lu";
import { useAuthStore } from '../store/useAuthStore';

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, unreadCounts } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2 mx-auto">
          <LuUser className="w-5 h-5" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-xs rounded-full"
            />
            <span className="text-sm">show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({(onlineUsers.length)} online)</span>
        </div>
      </div>

      {/* contacts list */}
      {filteredUsers.map((user) => {

        const unread = unreadCounts[user._id.toString()] || 0;

        return (

          <div
            className='flex items-center justify-end'
            key={user._id}
          >

            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
              w-full p-3 flex items-center justify-between gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
            >
              <div className='flex p-3 gap-2'>
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={user.profilePic || "/default-avatar.jpeg"}
                    alt={user.name}
                    className="size-12 object-cover rounded-full"
                  />

                  {/* online dot */}
                  {onlineUsers.includes(user._id) && (
                    <span
                      className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                    />
                  )}

                  {/* Unread badge on avatar (mobile only) */}
                  {unread > 0 && (
                    <span className="lg:hidden absolute -top-1 -right-1 badge badge-sm badge-primary">
                      {unread}
                    </span>
                  )}
                </div>

                {/* User info - only visible on larger screens */}
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>
              </div>


              <div className='hidden lg:min-w-8 lg:rounded-full lg:bg-red-500 p-1'>
                {unread && (
                  <span className="badge">{unread}</span>
                )}
              </div>

            </button>
          </div>
        )
      })}

      {filteredUsers.length === 0 && (
        <div className="text-center text-zinc-500 py-4">No online users</div>
      )}
    </aside>
  );
};
export default Sidebar;