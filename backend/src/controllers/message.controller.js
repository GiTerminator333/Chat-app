import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { getUserSocketId, io } from "../lib/socket.js";

export const getContacts = async (req, res) => {
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id : {$ne : loggedInUserId}}).select("-password");
        return res.status(200).json(filteredUsers);
    }catch(error){
        console.log("error in getContacts controller", error.message);
        return res.status(500).json({message : "Internal server error"});
    }
}

export const getMessagesByUserId = async (req, res)=>{
    try{
        const {id: receiverId} = req.params;
        const loggedInUserId = req.user._id;

        const messages = await Message.find({
            $or : [
                {senderId : loggedInUserId, receiverId : receiverId},
                {senderId : receiverId, receiverId : loggedInUserId}
            ]
        });

        res.status(200).json(messages);
        
    }catch(error){
        console.log("error in getMessagesByUserId controller", error.message);
        return res.status(500).json({message : "Internal server error"});
    }
}

export const sendMessage = async (req, res)=>{
    try{
        const {text, image} = req.body;
        const {id : receiverId} = req.params;
        const senderId = req.user._id;

        if(!image && !text) return res.status(400).json({message : "Message is empty"});
        if(senderId.toString() === receiverId.toString()) return res.status(400).json({message : "You cannot send message to yourself"});

        const receiverExists = await User.exists({_id : receiverId});
        if(!receiverExists) return res.status(400).json({message : "Receiver does not exist"});
        
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const message = new Message({
            senderId : senderId,
            receiverId : receiverId,
            text : text,
            image : imageUrl
        })

        await message.save();

        const receiverSockerId = getUserSocketId(receiverId);
        if(receiverSockerId){
            io.to(receiverSockerId).emit("newMessage", message);
        }

        res.status(201).json(message);
    }catch(error){
        console.log("error in sendMessage controller", error.message);
        return res.status(500).json({message : "Internal server error"});
    }
}

export const getChatPartners = async (req, res) => {
    try{
        const loggedInUserId = req.user._id;

        const message = await Message.find({
            $or : [
                {senderId : loggedInUserId},
                {receiverId : loggedInUserId}
            ]
        });

        const chatPartnersIds = [...new Set(
            message.map((msg) => 
            msg.senderId.toString() === loggedInUserId.toString() ? 
            msg.receiverId.toString() : msg.senderId.toString())
        )];

        const chatPartners = await User.find({_id : {$in : chatPartnersIds}}).select("-password");

        res.status(200).json(chatPartners);

    }catch(error){
        console.log("error in getChatPartners controller", error.message);
        return res.status(500).json({message : "Internal server error"});
    }
}