import { React, useState } from 'react'

import { TiMessages } from "react-icons/ti";
import { LuUser } from "react-icons/lu";
import { AiOutlineMail } from "react-icons/ai";
import { LuEye } from "react-icons/lu";
import { LuEyeOff } from "react-icons/lu";

import { useAuthStore } from '../store/useAuthStore';
import Loader from '../components/ui/Loader';
import RightStyle from '../components/ui/Pattern';
import { Link } from 'react-router-dom';
import Pattern from '../components/ui/Pattern';
import toast from 'react-hot-toast';

const SignUpPage = () => {

  const { signup, isSigningUp } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const validateForm = () => {
    const { username, email, password } = formData;
    if (!username || !email || !password) {
      return { valid: false, message: "All fields are required" };
    }
    if (username.length < 3 || username.length > 20) {
      return { valid: false, message: "Username must be between 3 and 20 characters" };
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

    await signup(formData);
    setFormData({
      username: '',
      email: '',
      password: '',
    });
  }



  return (
    <div className='min-h-screen grid lg:grid-cols-2'>
      {/* Left side */}
      <div className='flex flex-col justify-center items-center p-6'>
        {/* logo */}
        <TiMessages className='text-6xl text-green-500 mb-4' />
        <div className='text-center max-w-md space-y-4'>
          <h1 className='text-2xl font-bold '>
            Create Account
          </h1>
          <p>Get started with your free account</p>
        </div>
        {/* form */}
        <form onSubmit={handleSubmit} className='w-full max-w-md mt-4'>

          <div className='mb-5'>
            <label className='block text-sm font-medium mb-2'>Username</label>
            <div className='relative'>
              <LuUser className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
              <input
                type='text'
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className='w-full p-2 border rounded bg-transparent pl-10'
                required
                placeholder='Jhon Doe'
              />
            </div>
          </div>

          <div className='mb-5'>
            <label className='block text-sm font-medium mb-2'>Email</label>
            <div className='relative'>
              <AiOutlineMail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
              <input
                type='email'
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className='w-full p-2 border rounded bg-transparent pl-10'
                placeholder='jhon@example.com'
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
                className='w-full p-2 border rounded bg-transparent'
                required
              />
              {showPassword ? <LuEye className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer'
                onClick={() => setShowPassword(!showPassword)}
              /> : <LuEyeOff className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer'
                onClick={() => setShowPassword(!showPassword)
                } />
              }
            </div>
          </div>

          <button
            type='submit'
            disabled={isSigningUp}
            className="w-full bg-blue-500 p-2 rounded font-semibold hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningUp ? (
              <Loader
                className='w-2 h-2 mx-auto'
              />) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Login if already exists */}
        <div className='mt-6 text-center'>
          <p className='text-base-content/60'>
            Already have an account? {" "}
            <Link to="/login" className='text-blue-500 hover:underline'>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className='hidden lg:flex pt-6 pr-6 justify-center items-center'>
        <Pattern
          title={"Welcome to WiChat !"}
          message={"Connect with friends and the world around you on WiChat."}
          className="w-full h-full bg-cover bg-center"
        />
      </div>

    </div>
  )
}

export default SignUpPage
