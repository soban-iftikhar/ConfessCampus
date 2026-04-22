import mongoose from 'mongoose';

const chatRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

// Prevent duplicate requests
chatRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });

export default mongoose.model('ChatRequest', chatRequestSchema);
