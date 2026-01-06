const { body, validationResult, param } = require('express-validator');

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3-20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const searchValidation = [
  param('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Code must be 6 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Code can only contain uppercase letters and numbers')
];

const messageValidation = [
  body('receiverId').isMongoId().withMessage('Invalid receiver ID'),
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters')
];

const callValidation = [
  body('receiverId').isMongoId().withMessage('Invalid receiver ID'),
  body('type').isIn(['audio', 'video']).withMessage('Call type must be audio or video')
];

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

module.exports = {
  registerValidation,
  loginValidation,
  searchValidation,
  messageValidation,
  callValidation,
  validate
};