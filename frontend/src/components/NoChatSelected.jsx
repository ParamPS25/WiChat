import React from 'react'
import { TiMessages } from "react-icons/ti";


const NoChatSelected = () => {
  return (
    <div className='w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50'>
      <div className='max-w-md text-center space-y-4'>

        {/* icon */}
        <div className='flex justify-center gap-4 '>
          <div className='realtive'>
            <div className='size-20 rounded-2xl bf-primary/10 flex items-center justify-center animate-bounce '>
              <TiMessages className='text-6xl text-green-600' />
            </div>
          </div>
        </div>

        {/* welcome text */}
        <h2 className='text-2xl font-bold'> Welcome to WiChat </h2>
        <p className='text-base-content/60'>
          Select a conversation from sidebar to start chatting.
        </p>
      </div>

    </div>
  )
}

export default NoChatSelected
