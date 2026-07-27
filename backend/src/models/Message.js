import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
    senderId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    receiverId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    text : {
        type : String,
        trim : true,
        maxLength : 2000
    },
    image : {
        type : String,
    },
    // Cloudinary URL for voice note audio (.webm)
    voice : {
        type : String,
    },
    // Emoji reactions — each entry is { userId, emoji }
    // One reaction per user (enforced in controller logic)
    reactions : [{
        userId : { type : mongoose.Schema.Types.ObjectId, ref : "User" },
        emoji  : { type : String }
    }],
    // Quoted reply — optional reference to the parent message
    replyTo : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Message",
        default : null
    },
    // Read receipt status: "sent" → "delivered" → "read"
    status : {
        type : String,
        enum : ["sent", "delivered", "read"],
        default : "sent"
    }
}, {timestamps : true});

const Message = mongoose.model("Message", messageSchema);

export default Message;