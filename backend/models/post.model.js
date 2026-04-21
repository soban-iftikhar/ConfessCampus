import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Post content is required'],
        maxlength: [300, 'Content cannot exceed 300 characters']
    },
    image: {
        type: String,
        default: null // Will store the Multer file path/URL
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['approved', 'pending', 'flagged'],
        default: 'approved' 
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

// Virtual property to dynamically calculate likesCount when requested
postSchema.virtual('likesCount').get(function() {
    return this.likes.length;
});

// Ensure virtuals are included when converting documents to JSON
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

export default mongoose.model('Post', postSchema);