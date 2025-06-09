import React, { useState } from 'react';
import { TiMessages } from "react-icons/ti";
import { AiOutlineMail } from "react-icons/ai";
import { LuEye, LuEyeOff } from "react-icons/lu";

import { useAuthStore } from '../store/useAuthStore';
import Loader from '../components/ui/Loader';
import Pattern from '../components/ui/Pattern';

import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const { login, isLoggingIn } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const validateForm = () => {
    const { email, password } = formData;
    if (!email || !password) {
      return { valid: false, message: "All fields are required" };
    }
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return { valid: false, message: "Invalid email format" };
    }
    if (password.length < 6 || password.length > 20) {
      return { valid: false, message: "Password must be between 6 and 20 characters" };
    }
    return { valid: true };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    await login(formData);
    setFormData({ email: '', password: '' });
  }

  if (isLoggingIn) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Loader />
      </div>
    );
  }

  return (
    <div className='min-h-screen grid lg:grid-cols-2'>
      {/* Left Side */}
      <div className='flex flex-col justify-center items-center p-6'>
        <TiMessages className='text-6xl text-green-500 mb-4' />
        <div className='text-center max-w-md space-y-4'>
          <h1 className='text-2xl font-bold'>Login to Your Account</h1>
          <p>Welcome back! Please enter your credentials</p>
        </div>

        <form onSubmit={handleSubmit} className='w-full max-w-md mt-4'>
          <div className='mb-5'>
            <label className='block text-sm font-medium mb-2'>Email</label>
            <div className='relative'>
              <AiOutlineMail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
              <input
                type='email'
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className='w-full p-2 border rounded bg-transparent pl-10'
                placeholder='john@example.com'
                required
              />
            </div>
          </div>

          <div className='mb-8'>
            <label className='block text-sm font-medium mb-2'>Password</label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className='w-full p-2 border rounded bg-transparent pr-10'
                required
                placeholder='••••••••••'
              />
              {showPassword ? (
                <LuEye
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer'
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <LuEyeOff
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer'
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>
          </div>

          <button
            type='submit'
            disabled={isLoggingIn}
            className="w-full bg-blue-500 p-2 rounded font-semibold hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Log In
          </button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-base-content/60'>
            Don't have an account?{' '}
            <Link to="/signup" className='text-blue-500 hover:underline'>
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className='hidden lg:flex flex-col justify-center items-center px-6'>
        {/* <Pattern
          title={"Welcome Back to WiChat!"}
          message={"Connect again with your friends and the world around you."}
          className="w-full h-full bg-cover bg-center"
        /> */}
        <img
          src="/auth-pic.png"
          alt='auth picture'
          className='object-contain max-w-[500px] w-full h-auto mb-6'
        />
        <h2 className='text-2xl text-green-600 font-bold mb-2'>Welcome Back to WiChat!</h2>
        <p className='text-md text-blue-400 text-center max-w-sm'>
          Connect again with your friends and the world around you.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
