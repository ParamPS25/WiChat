import {React,useState} from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { MdPhotoCamera } from "react-icons/md";
import { LuUser } from "react-icons/lu";
import { AiOutlineMail } from "react-icons/ai";

import toast from 'react-hot-toast';


const ProfilePage = () => {

  const [selectedImage, setSelectedImage] = useState(null);
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) { 
      return toast.error("Please upload a valid image file.");
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File size exceeds 5MB limit.");
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image); 
      await updateProfile({ profilePic: base64Image });
    }
  }

  return (
    <div className='min-h-screen pt-20'>
      <div className='max-w-2xl mx-auto p-4 py-8'>
        <div className='bg-base-300 rounded-xl p-6 space-y-8'>
          <div className='text-center'>
            <h1 className='text-2xl font-semibold'>Profile</h1>
            <p className='text-sm mt-2'>Your profile information</p>
          </div>

          {/* avatar section -> can edit */}
          <div className='flex flex-col items-center gap-4'>
            <div className='relative '>
              <img
                src={selectedImage || authUser?.profilePic || '/default-avatar.jpeg'}
                alt="Profile Avatar"
                className='size-32 rounded-full object-cover border-4 border-green-800'
              />
              {/* icon of camera and input under same label so -> input hidden */}
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content rounded-full 
                cursor-pointer hover:bg-base-200 transition-all duration-200
                ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
              `}
              >
                <MdPhotoCamera className='text-2xl bg-base-300 rounded-full' />
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className='hidden'
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className='text-sm text-zinx-500'>
              {isUpdatingProfile ? "Updating..." : "Click to change profile picture"}
            </p>
          </div>

          <div className='space-y-4'>
            <div className='space-y-1.5'>
              <div className='text-sm text-zinc-500 flex items-center gap-2 ml-2'>
                <LuUser className='text-md' />
                Full Name
              </div>
              <p className='px-4 py-2.5 bg-base-200 rounded-lg border'>{authUser?.fullName}</p>
            </div>

            <div className='space-y-1.5'>
              <div className='text-sm text-zinc-500 flex items-center gap-2 ml-2'>
                <AiOutlineMail className='text-md' />
                Email
              </div>
              <p className='px-4 py-2.5 bg-base-200 rounded-lg border'>{authUser?.email}</p>
            </div>
          </div>

          <div className='mt-4 bg-base-300 rounded-xl p-6'>
            <h2 className='text-lg font-medium mb-4'>Account Information</h2>
            <div className='space-y-3 text-sm'>
              <div className='flex items-center justify-between py-2 border-b border-zinc-700'>
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className='flex items-center justify-between py-2'>
                <span>Account status</span>
                <span className='text-green-500'>Active</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProfilePage;
