import React, {useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore';

import { IoCloseSharp } from "react-icons/io5";
import { BsFillImageFill, BsSend } from "react-icons/bs";
import { BsFillSendFill } from "react-icons/bs";
import toast from 'react-hot-toast';
const MessageInput = () => {
    const [text, setText] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const { sendMessage } = useChatStore();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if(!file.type.startsWith("image/")){
            toast.error("please select any image file");
            return
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    }

    const removeImage = () => {
        setImagePreview(null);

        if(fileInputRef.current){
            fileInputRef.current.value = "";
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if(!text.trim() && !imagePreview){
            return;
        }

        try{
            // send msg data
            await sendMessage({
                text : text.trim(),
                image : imagePreview,
            });

            // clear form
            setText("");
            setImagePreview("");
            if(fileInputRef.current){
                fileInputRef.current.value = "";
            }
        } catch(error){
            console.error("failed to send message: ", error);
        }
    }

    return (
        <div className='p-4 w-full'>
            {imagePreview && (
                <div className='mb-3 flex items-center gap-2'>
                    <div className='relative'>
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className='w-20 h-20 object-cover rounded-lg border-zinc-700'
                        />
                        <button
                            onClick={removeImage}
                            className='absolute top-0 right-0 bg-red-500 text-white rounded-full p-1'
                        >
                            <IoCloseSharp className='size-4' />
                        </button>
                    </div>
                </div>
            )}

            {/* form to handle text input */}
            <form onSubmit={handleSendMessage} className='flex items-center gap-2 bg-base-100'>
                <div className='flex-1 flex gap-2'>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder='Type a message...'
                        className='input input-bordered w-full rounded-lg input-sm sm:input-md'
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className='hidden'
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}   // Open file dialog
                        className=  {`hidden sm:flex btn btn-circle btn-secondary
                            ${imagePreview ? 'text-emerald-500' : 'text-zinc-500'}`} 
                    >
                        <BsFillImageFill className='size-5' />
                    </button>

                </div>

                <button
                    className='btn btn-circle btn-primary '
                    type='submit'
                    disabled={!text.trim() && !imagePreview}
                >
                    <BsSend className='sm:size-5 size-3'/>
                </button>
            </form>
        </div>
    )
}

export default MessageInput
