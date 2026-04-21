import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: {
        type: String,
        required: true,
        maxlength: [300, 'Comment cannot exceed 300 characters']
    },
    isAnonymous: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);