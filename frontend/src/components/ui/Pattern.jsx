import React from 'react';

const Pattern = ({ title, message }) => {
  return (
    <div className='flex flex-col justify-center items-center bg-base-200 h-screen w-screen'>
      {/* Animated Grid (slow pulse animation row-wise) */}
      <div className='grid grid-cols-3 gap-2'>
        {/* Row 1 */}
        <div className='h-[130px] w-[130px] rounded-md mb-2 bg-white/10 border border-white/30 backdrop-blur-md shadow-md animate-pulse delay-[0ms]' style={{ animationDuration: '2s' }}></div>
        <div className='h-[130px] w-[130px] rounded-md mb-2 bg-white/10 border border-white/30 backdrop-blur-md shadow-md animate-pulse delay-[200ms]' style={{ animationDuration: '2s' }}></div>
        <div className='h-[130px] w-[130px] rounded-md mb-2 bg-white/10 border border-white/30 backdrop-blur-md shadow-md animate-pulse delay-[400ms]' style={{ animationDuration: '2s' }}></div>
        
        {/* Row 2 */}
        <div className='h-[130px] w-[130px] rounded-md mb-2 bg-white/10 border border-white/30 backdrop-blur-md shadow-md animate-pulse delay-[600ms]' style={{ animationDuration: '2s' }}></div>
        <div className='h-[130px] w-[130px] rounded-md mb-2 bg-white/10 border border-white/30 backdrop-blur-md shadow-md animate-pulse delay-[800ms]' style={{ animationDuration: '2s' }}></div>
        <div className='h-[130px] w-[130px] rounded-md mb-2 bg-white/10 border border-white/30 backdrop-blur-md shadow-md animate-pulse delay-[1000ms]' style={{ animationDuration: '2s' }}></div>
        
        {/* Row 3 */}
        <div className='h-[130px] w-[130px] rounded-md mb-2 bg-white/10 border border-white/30 backdrop-blur-md shadow-md animate-pulse delay-[1200ms]' style={{ animationDuration: '2s' }}></div>
        <div className='h-[130px] w-[130px] rounded-md mb-2 bg-white/10 border border-white/30 backdrop-blur-md shadow-md animate-pulse delay-[1400ms]' style={{ animationDuration: '2s' }}></div>
        <div className='h-[130px] w-[130px] rounded-md mb-2 bg-white/10 border border-white/30 backdrop-blur-md shadow-md animate-pulse delay-[1600ms]' style={{ animationDuration: '2s' }}></div>
      </div>

      {/* Title and Message */}
      <div className='text-center mt-8'>
        <h2 className='text-2xl text-green-600 font-bold mb-4'>{title}</h2>
        <p className='text-md text-blue-200'>{message}</p>
      </div>
    </div>
  );
};

export default Pattern;
