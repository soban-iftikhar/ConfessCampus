import express from 'express';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import postRoute from "./routes/postRoute.js";
import messageRoute from "./routes/messageRoute.js";

dotenv.config({});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes
app.use("/api/auth", authRoute);

// Protected routes
app.use("/api/users", authMiddleware, userRoute);
app.use("/api/posts", authMiddleware, postRoute);
app.use("/api/messages", authMiddleware, messageRoute);

app.get('/', (req, res) => {
    res.send('ConfessCampus API running');
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running on port ${PORT}`);
});

