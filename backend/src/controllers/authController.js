const { users } = require('../db/db');
const { generateUniqueCode, hashPassword, comparePassword, generateToken } = require('../utils/helpers');

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Check if user already exists
    const existingUserByEmail = await users.findByEmail(email);
    const existingUserByUsername = await users.findByUsername(username);

    if (existingUserByEmail || existingUserByUsername) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email or username already exists' 
      });
    }

    // Generate unique code
    let uniqueCode;
    let isUnique = false;
    
    while (!isUnique) {
      uniqueCode = generateUniqueCode();
      const existingCode = await users.findByCode(uniqueCode);
      if (!existingCode) {
        isUnique = true;
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await users.create({
      email: email.toLowerCase(),
      username,
      password: hashedPassword,
      uniqueCode,
      profilePicture: null,
      status: 'online',
      lastSeen: new Date().toISOString(),
      friends: []
    });

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating account', 
      error: error.message 
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await users.findByEmail(email.toLowerCase());
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Update user status
    await users.update(user.id, {
      status: 'online',
      lastSeen: new Date().toISOString()
    });

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error logging in', 
      error: error.message 
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // Update user status
    await users.update(req.user.id, {
      status: 'offline',
      lastSeen: new Date().toISOString()
    });

    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error logging out', 
      error: error.message 
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching profile', 
      error: error.message 
    });
  }
};

// Verify token
exports.verifyToken = async (req, res) => {
  try {
    const user = await users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error verifying token', 
      error: error.message 
    });
  }
};