import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Comment cannot be empty'],
        maxlength: [150, 'Comment cannot exceed 150 characters']
    },
    isAnonymous: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);