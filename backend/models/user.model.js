import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // prevent pass to send to frontend
    },
    bio: {
        type: String,
        maxlength: [150, 'Bio cannot exceed 150 characters'],
        default: ''
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);