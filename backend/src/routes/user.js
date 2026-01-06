const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/search', auth, userController.searchByCode);
router.get('/:userId', auth, userController.getUserById);
router.put('/profile', auth, userController.updateProfile);
router.get('/', auth, userController.getAllUsers); // Debug route

module.exports = router;