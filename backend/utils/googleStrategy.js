import User from '../models/User.js';

export const googleCallback = async (accessToken, refreshToken, profile, done) => {
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
