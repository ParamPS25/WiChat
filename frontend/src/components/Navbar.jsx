import React from 'react'
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import { TiMessages } from "react-icons/ti";
import { IoSettings } from "react-icons/io5";
import { LuUser } from "react-icons/lu";
import { LuLogOut } from "react-icons/lu";


const Navbar = () => {

  const { authUser, logout } = useAuthStore();

  return (
    <header
      className='bg-base-100 border-b border-base-300 fixed w-full top-0 z-50
      backdrop-blur-lg bg-base-100/80 shadow-sm'
    >
      <div className='container mx-auto px-4 h-16'>
        <div className='flex justify-between items-center h-full w-full'>
          <div className='flex items-center gap-8'>
            <Link to='/' className='flex items-center gap-2 text-xl font-semibold'>
              <div className='size-9 rounded-full text-white flex justify-center items-center'>
                <TiMessages className='text-2xl text-green-500' />
              </div>
              <h1 className='text-lg font-bold'>WiChat</h1>
            </Link>
          </div>

          <div className='flex items-center gap-2'>
            <Link to='/settings'
              className='btn btn-sm gap-2 transition-colors'
            >
              <IoSettings className='text-lg' />
              <span className='hidden sm:inline'>Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to='/profile' className='btn btn-sm gap-2'>
                  <LuUser className='text-lg' />
                  <span className='hidden sm:inline'>Profile</span>
                </Link>

                <button
                  onClick={logout}
                  className='flex gap-2 items-center '
                >
                  <LuLogOut className='text-lg' />
                  <span className='hidden sm:inline'>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
