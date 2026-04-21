
const blockedWords = [
    "hate", "kill", "murder", "abuse", "slut", "whore", "fag", 
    "retard", "bitch", "fuck", "shit", "asshole", "bastard"
];

export const moderateContent = (req, res, next) => {
    const { content } = req.body;

    if (!content) {
        return next(); 
    }

    const lowerCaseContent = content.toLowerCase();

    const containsProfanity = blockedWords.some(word => lowerCaseContent.includes(word));

    if (containsProfanity) {
        return res.status(400).json({
            success: false,
            message: "Your confession was flagged by our automated safety system for violating ethical guidelines.",
            errorCode: 400
        });
    }

    next();
};