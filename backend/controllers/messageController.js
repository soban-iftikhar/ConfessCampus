import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import ChatRequest from '../models/ChatRequest.js';
import User from '../models/User.js';

// Send a chat request
const sendChatRequest = async (req, res) => {
    try {
        const { recipientId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        if (!recipientId) {
            return res.status(400).json({ message: 'Recipient ID is required' });
        }

        if (userId === recipientId) {
            return res.status(400).json({ message: 'Cannot send request to yourself' });
        }

        // Check if recipient exists
        const recipientUser = await User.findById(recipientId);
        if (!recipientUser) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        // Check if request already exists
        const existingRequest = await ChatRequest.findOne({
            $or: [
                { sender: userId, recipient: recipientId },
                { sender: recipientId, recipient: userId }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Chat request already exists' });
        }

        const chatRequest = new ChatRequest({
            sender: userId,
            recipient: recipientId,
            status: 'pending'
        });

        const savedRequest = await chatRequest.save();
        const populatedRequest = await savedRequest.populate('sender', 'name').populate('recipient', 'name');

        res.status(201).json({
            message: 'Chat request sent successfully',
            chatRequest: populatedRequest
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// Accept a chat request
const acceptChatRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        const chatRequest = await ChatRequest.findById(requestId);
        if (!chatRequest) {
            return res.status(404).json({ message: 'Chat request not found' });
        }

        // Only recipient can accept
        if (chatRequest.recipient.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized - Only recipient can accept' });
        }

        if (chatRequest.status !== 'pending') {
            return res.status(400).json({ message: `Chat request already ${chatRequest.status}` });
        }

        chatRequest.status = 'accepted';
        await chatRequest.save();

        // Create a chat between the two users
        const [user1, user2] = [chatRequest.sender, chatRequest.recipient].sort();

        const existingChat = await Chat.findOne({
            $or: [
                { user1, user2 },
                { user1: user2, user2: user1 }
            ]
        });

        if (!existingChat) {
            const newChat = new Chat({
                user1,
                user2
            });
            await newChat.save();
        }

        const populatedRequest = await chatRequest.populate('sender', 'name').populate('recipient', 'name');

        res.status(200).json({
            message: 'Chat request accepted',
            chatRequest: populatedRequest
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// Reject a chat request
const rejectChatRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        const chatRequest = await ChatRequest.findById(requestId);
        if (!chatRequest) {
            return res.status(404).json({ message: 'Chat request not found' });
        }

        // Only recipient can reject
        if (chatRequest.recipient.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized - Only recipient can reject' });
        }

        if (chatRequest.status !== 'pending') {
            return res.status(400).json({ message: `Chat request already ${chatRequest.status}` });
        }

        chatRequest.status = 'rejected';
        await chatRequest.save();

        res.status(200).json({
            message: 'Chat request rejected'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// Get pending chat requests for a user
const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        const requests = await ChatRequest.find({
            recipient: userId,
            status: 'pending'
        })
            .populate('sender', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// Send a message
const sendMessage = async (req, res) => {
    try {
        const { chatId, content } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        if (!chatId || !content) {
            return res.status(400).json({ message: 'Chat ID and content are required' });
        }

        if (content.length > 1000) {
            return res.status(400).json({ message: 'Message cannot exceed 1000 characters' });
        }

        // Verify user is part of this chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        if (chat.user1.toString() !== userId && chat.user2.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized - You are not part of this chat' });
        }

        const message = new Message({
            chatId,
            sender: userId,
            content
        });

        const savedMessage = await message.save();

        // Update chat with last message
        chat.lastMessage = savedMessage._id;
        chat.lastMessageTime = new Date();
        chat.messages.push(savedMessage._id);
        await chat.save();

        const populatedMessage = await savedMessage.populate('sender', 'name');

        res.status(201).json({
            message: 'Message sent successfully',
            data: populatedMessage
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// Get messages for a chat
const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        // Verify user is part of this chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        if (chat.user1.toString() !== userId && chat.user2.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized - You are not part of this chat' });
        }

        const messages = await Message.find({ chatId })
            .populate('sender', 'name')
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// Get all active chats for a user
const getChats = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        const chats = await Chat.find({
            $or: [
                { user1: userId },
                { user2: userId }
            ]
        })
            .populate('user1', 'name')
            .populate('user2', 'name')
            .populate('lastMessage')
            .sort({ lastMessageTime: -1 });

        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// Delete a message (if needed before 24hr TTL)
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        if (message.sender.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized - Can only delete your own messages' });
        }

        await Message.findByIdAndDelete(messageId);

        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

export {
    sendChatRequest,
    acceptChatRequest,
    rejectChatRequest,
    getPendingRequests,
    sendMessage,
    getMessages,
    getChats,
    deleteMessage
};