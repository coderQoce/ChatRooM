const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { users } = require('../db/db');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Upload profile picture
router.post('/avatar', auth, (req, res) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    try {
      // Delete old avatar if exists
      const currentUser = await users.findById(req.user.id);
      if (currentUser?.profilePicture) {
        const oldPath = path.join(__dirname, '..', '..', currentUser.profilePicture);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const profilePicture = `/uploads/avatars/${req.file.filename}`;
      const updatedUser = await users.update(req.user.id, { profilePicture });

      const { password, ...safeUser } = updatedUser;
      res.json({ success: true, user: safeUser, profilePicture });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error uploading avatar', error: error.message });
    }
  });
});

// Remove profile picture
router.delete('/avatar', auth, async (req, res) => {
  try {
    const currentUser = await users.findById(req.user.id);
    if (currentUser?.profilePicture) {
      const oldPath = path.join(__dirname, '..', '..', currentUser.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    await users.update(req.user.id, { profilePicture: null });
    res.json({ success: true, message: 'Profile picture removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing avatar', error: error.message });
  }
});

module.exports = router;
