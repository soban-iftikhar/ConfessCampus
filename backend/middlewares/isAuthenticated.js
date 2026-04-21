import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        // Extracting the token we generated earlier
        const token = req.cookies.jwt; 
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
                errorCode: 401
            });
        }
        
        // Verifying against the secret key in your .env
        const decode = jwt.verify(token, process.env.JWT_SECRET); 
        
        if (!decode) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
                errorCode: 401 
            });
        }

        // Attaching only the user ID to the request object
        req.id = decode.userId;
        
        next();

    } catch (error) {
        // This catches expired tokens or tampered tokens safely
        console.log("JWT Error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Not authorized, token failed or expired",
            errorCode: 401
        });
    }
}

export default isAuthenticated;