const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const auth = require('../middleware/auth');

router.get('/', auth, friendController.getFriends);
router.post('/request/:userId', auth, friendController.sendRequest);
router.post('/accept/:requestId', auth, friendController.acceptRequest);
router.post('/reject/:requestId', auth, friendController.rejectRequest);
router.delete('/remove/:userId', auth, friendController.removeFriend);

module.exports = router;