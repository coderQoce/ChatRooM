const { getIO } = require('./index');

const initiateCall = (callData) => {
  try {
    const io = getIO();
    const { to, from, callId, type } = callData;

    // Emit incoming call to receiver
    io.to(`user_${to}`).emit('incoming_call', {
      from,
      callId,
      type,
      timestamp: new Date()
    });

    return true;
  } catch (error) {
    console.error('Error in initiateCall socket handler:', error);
    throw error;
  }
};

const endCall = (callData) => {
  try {
    const io = getIO();
    const { to, callId } = callData;

    // Emit call ended to receiver
    if (to) {
      io.to(`user_${to}`).emit('call_ended', { callId });
    }

    return true;
  } catch (error) {
    console.error('Error in endCall socket handler:', error);
    throw error;
  }
};

module.exports = { initiateCall, endCall };