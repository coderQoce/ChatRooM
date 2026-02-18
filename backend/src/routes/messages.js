const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');
const { messageValidation, validate } = require('../middleware/validation');

router.post('/', auth, validate(messageValidation), messageController.sendMessage);
router.get('/chats', auth, messageController.getChats);
router.get('/conversation/:userId', auth, messageController.getConversation);
router.delete('/:messageId', auth, messageController.deleteMessage);
router.post('/read/:userId', auth, messageController.markAsRead);

module.exports = router;