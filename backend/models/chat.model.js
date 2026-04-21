// models/chat.model.js
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true // Keeps context of why they are chatting
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message' // Helps with showing a preview in the chat inbox
    }
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);