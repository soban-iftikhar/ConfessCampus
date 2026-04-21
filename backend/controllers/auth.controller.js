import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // 1. Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                errorCode: 400
            });
        }

        // 2. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
                errorCode: 409
            });
        }

        // 3. Hash the password manually
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create the user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // 5. Generate token and send response
        if (user) {
            generateToken(res, user._id);

            res.status(201).json({
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar
                }
            });
        }
    } catch (error) {
        next(error); // Passes to your global error handler
    }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
                errorCode: 400
            });
        }

        // 1. Find user by email (we explicitly select +password because we hid it in the model)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
                errorCode: 401
            });
        }

        // 2. Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // 3. Generate token and set cookie
            generateToken(res, user._id);

            res.status(200).json({
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
                errorCode: 401
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
export const logoutUser = async (req, res, next) => {
    try {
        // Overwrite the 'jwt' cookie with a blank token that expires immediately
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0)
        });

        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (error) {
        next(error);
    }
};