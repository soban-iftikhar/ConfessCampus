import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true
    },
    bio: {
        type: String,
        default: '',
        maxlength: [200, 'Bio cannot exceed 200 characters']
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    refreshTokens: [{
        type: String,
        default: null
    }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);