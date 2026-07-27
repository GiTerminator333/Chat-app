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
        }).populate("replyTo", "text image senderId");
        // ^ Populate replyTo so quoted replies include the original message content

        res.status(200).json(messages);
        
    }catch(error){
        console.log("error in getMessagesByUserId controller", error.message);
        return res.status(500).json({message : "Internal server error"});
    }
}

export const sendMessage = async (req, res)=>{
    try{
        const {text, image, voice, replyTo} = req.body;
        const {id : receiverId} = req.params;
        const senderId = req.user._id;

        if(!image && !text && !voice) return res.status(400).json({message : "Message is empty"});
        if(senderId.toString() === receiverId.toString()) return res.status(400).json({message : "You cannot send message to yourself"});

        const receiverExists = await User.exists({_id : receiverId});
        if(!receiverExists) return res.status(400).json({message : "Receiver does not exist"});

        // If replying to a message, validate the referenced message exists
        if(replyTo){
            const parentMessage = await Message.exists({_id : replyTo});
            if(!parentMessage) return res.status(400).json({message : "Replied message does not exist"});
        }
        
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        // Upload voice note to Cloudinary with resource_type "raw" so it
        // is stored as-is without any transcoding (avoids distorted playback)
        let voiceUrl;
        if(voice){
            const uploadResponse = await cloudinary.uploader.upload(voice, {
                resource_type : "raw",
                folder : "voice_notes",
                format : "webm"
            });
            voiceUrl = uploadResponse.secure_url;
        }

        const message = new Message({
            senderId : senderId,
            receiverId : receiverId,
            text : text,
            image : imageUrl,
            voice : voiceUrl,
            replyTo : replyTo || null,
            status : "sent"
        })

        await message.save();

        // Populate replyTo so the client receives the quoted content immediately
        await message.populate("replyTo", "text image senderId");

        // If receiver is online, deliver the message via Socket.IO
        const receiverSocketId = getUserSocketId(receiverId);
        if(receiverSocketId){
            // Update status to "delivered" since receiver will receive it in real-time
            message.status = "delivered";
            await message.save();

            io.to(receiverSocketId).emit("newMessage", message);
        }

        res.status(201).json(message);
    }catch(error){
        console.log("error in sendMessage controller", error.message);
        return res.status(500).json({message : "Internal server error"});
    }
}

/**
 * Mark all messages FROM a specific sender TO the logged-in user as "read".
 * Called when the logged-in user opens a conversation with that sender.
 */
export const markMessagesAsRead = async (req, res) => {
    try{
        const { id: senderId } = req.params;
        const loggedInUserId = req.user._id;

        // Bulk-update all unread messages from this sender to "read"
        await Message.updateMany(
            {
                senderId : senderId,
                receiverId : loggedInUserId,
                status : { $ne : "read" }
            },
            { status : "read" }
        );

        // Notify the sender in real-time so their checkmarks update instantly
        const senderSocketId = getUserSocketId(senderId);
        if(senderSocketId){
            io.to(senderSocketId).emit("messagesRead", { readBy: loggedInUserId.toString() });
        }

        res.status(200).json({ message : "Messages marked as read" });
    }catch(error){
        console.log("error in markMessagesAsRead controller", error.message);
        return res.status(500).json({ message : "Internal server error" });
    }
}

// --- Emoji Reactions ---

/**
 * Add or update a user's emoji reaction on a message.
 * If the user already has a reaction, it replaces their emoji.
 * Emits "messageReaction" socket event to both sender and receiver.
 */
export const addReaction = async (req, res) => {
    try{
        const { id: messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        if(!emoji) return res.status(400).json({ message : "Emoji is required" });

        const message = await Message.findById(messageId);
        if(!message) return res.status(404).json({ message : "Message not found" });

        // Check if user already reacted — replace their emoji, or add new
        const existingReactionIndex = message.reactions.findIndex(
            (r) => r.userId.toString() === userId.toString()
        );

        if(existingReactionIndex !== -1){
            // User already reacted — update their emoji
            message.reactions[existingReactionIndex].emoji = emoji;
        } else {
            // New reaction from this user
            message.reactions.push({ userId, emoji });
        }

        await message.save();

        // Build the reaction update payload
        const reactionPayload = {
            messageId : message._id.toString(),
            reactions : message.reactions
        };

        // Notify both sender and receiver in real-time
        const senderSocketId = getUserSocketId(message.senderId.toString());
        const receiverSocketId = getUserSocketId(message.receiverId.toString());

        if(senderSocketId) io.to(senderSocketId).emit("messageReaction", reactionPayload);
        if(receiverSocketId) io.to(receiverSocketId).emit("messageReaction", reactionPayload);

        res.status(200).json(message);
    }catch(error){
        console.log("error in addReaction controller", error.message);
        return res.status(500).json({ message : "Internal server error" });
    }
}

/**
 * Remove the logged-in user's reaction from a message.
 * Emits "messageReaction" socket event to both sender and receiver.
 */
export const removeReaction = async (req, res) => {
    try{
        const { id: messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if(!message) return res.status(404).json({ message : "Message not found" });

        // Remove this user's reaction
        message.reactions = message.reactions.filter(
            (r) => r.userId.toString() !== userId.toString()
        );

        await message.save();

        // Build the reaction update payload
        const reactionPayload = {
            messageId : message._id.toString(),
            reactions : message.reactions
        };

        // Notify both sender and receiver in real-time
        const senderSocketId = getUserSocketId(message.senderId.toString());
        const receiverSocketId = getUserSocketId(message.receiverId.toString());

        if(senderSocketId) io.to(senderSocketId).emit("messageReaction", reactionPayload);
        if(receiverSocketId) io.to(receiverSocketId).emit("messageReaction", reactionPayload);

        res.status(200).json(message);
    }catch(error){
        console.log("error in removeReaction controller", error.message);
        return res.status(500).json({ message : "Internal server error" });
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