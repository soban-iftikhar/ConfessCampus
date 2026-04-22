import express from 'express';
import {
    sendChatRequest,
    acceptChatRequest,
    rejectChatRequest,
    getPendingRequests,
    sendMessage,
    getMessages,
    getChats,
    deleteMessage
} from '../controllers/messageController.js';

const router = express.Router();

// Chat requests
router.route('/requests')
    .post(sendChatRequest)
    .get(getPendingRequests);

router.route('/requests/:requestId/accept')
    .post(acceptChatRequest);

router.route('/requests/:requestId/reject')
    .post(rejectChatRequest);

// Chats
router.route('/')
    .get(getChats);

// Messages
router.route('/:chatId/messages')
    .get(getMessages)
    .post(sendMessage);

router.route('/messages/:messageId')
    .delete(deleteMessage);

export default router;
