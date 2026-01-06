const mongoose = require('mongoose');

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

const isValidUniqueCode = (code) => {
  const codeRegex = /^[A-Z0-9]{6}$/;
  return codeRegex.test(code);
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  isValidUsername,
  isValidUniqueCode
};