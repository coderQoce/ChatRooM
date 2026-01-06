const { getIO } = require('./index');

const notifyFriendRequest = (data) => {
  try {
    const io = getIO();
    const { to, from, requestId } = data;

    // Emit friend request notification
    io.to(`user_${to}`).emit('friend_request', {
      from,
      requestId,
      timestamp: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error in notifyFriendRequest socket handler:', error);
    throw error;
  }
};

const notifyFriendAccepted = (data) => {
  try {
    const io = getIO();
    const { to, from } = data;

    // Emit friend accepted notification
    io.to(`user_${to}`).emit('friend_accepted', {
      from,
      timestamp: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error in notifyFriendAccepted socket handler:', error);
    throw error;
  }
};

module.exports = { notifyFriendRequest, notifyFriendAccepted };