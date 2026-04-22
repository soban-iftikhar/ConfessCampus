import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// Initialize Google strategy with environment variables
const initializeGoogleStrategy = () => {
    const googleCallback = async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists with this google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
                return done(null, user);
            }

            // Check if email already exists
            user = await User.findOne({ email: profile.emails?.[0]?.value });

            if (user) {
                // Link Google account to existing user
                user.googleId = profile.id;
                await user.save();
                return done(null, user);
            }

            // Create new user from Google profile
            const newUser = new User({
                googleId: profile.id,
                name: profile.displayName || profile.name?.givenName || 'User',
                email: profile.emails?.[0]?.value,
                username: profile.emails?.[0]?.value?.split('@')[0] + '_' + Date.now()
            });

            await newUser.save();
            return done(null, newUser);
        } catch (error) {
            return done(error, null);
        }
    };

    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        googleCallback
    ));
};

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export { initializeGoogleStrategy };
export default passport;
