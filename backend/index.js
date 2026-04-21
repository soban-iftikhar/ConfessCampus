import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './utils/db.js';
import { notFoundMiddleware, errorHandler } from './middlewares/errorMiddleware.js';
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js"; 
import postRoute from "./routes/post.route.js";
import categoryRoute from "./routes/category.route.js";

dotenv.config({});

const app = express();
const server = http.createServer(app);

// WebSockets Setup
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], 
        credentials: true
    }
});

app.use(helmet()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
    req.io = io;
    next();
});


app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/categories", categoryRoute);
// app.use("/api/chat", chatRoute); 

// Test Route
app.get('/', (req, res) => {
    res.send('ConfessCampus API is running...');
});

// Error Handling Middlewares
app.use(notFoundMiddleware);
app.use(errorHandler);

io.on('connection', (socket) => {
    console.log(`User connected to Chat WebSockets: ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000; 

server.listen(PORT, async () => {
    await connectDB();
    console.log(`Server running at port ${PORT}`);
});