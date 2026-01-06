const { verifyToken } = require('../utils/helpers');
const { users } = require('../db/db');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }

    const user = await users.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    
    req.user = userWithoutPassword;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: 'Please authenticate' 
    });
  }
};

module.exports = auth;