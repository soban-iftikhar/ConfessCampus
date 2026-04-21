// middlewares/multer.js
import multer from "multer";

const storage = multer.memoryStorage();

export const singleUpload = multer({ 
    storage,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        // only image upload
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    }
}).single("avatar");