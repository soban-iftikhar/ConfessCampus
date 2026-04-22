import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    lastMessageTime: {
        type: Date
    }
}, { timestamps: true });

// Ensure users are sorted to prevent duplicate chats between same users
chatSchema.index({ user1: 1, user2: 1 }, { unique: true });

export default mongoose.model('Chat', chatSchema);
