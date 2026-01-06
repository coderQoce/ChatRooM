const Call = require('../models/call');
const User = require('../models/user');
const Notification = require('../models/notification');
const { v4: uuidv4 } = require('uuid');

// Initiate a call
exports.initiateCall = async (req, res) => {
  try {
    const { receiverId, type } = req.body;
    const initiatorId = req.user._id;

    // Check if receiver is a friend
    const initiator = await User.findById(initiatorId);
    const isFriend = initiator.friends.find(f => 
      f.user.toString() === receiverId && f.status === 'accepted'
    );

    if (!isFriend) {
      return res.status(403).json({
        message: 'You can only call friends'
      });
    }

    // Check if receiver is online
    const receiver = await User.findById(receiverId);
    if (!receiver || receiver.status !== 'online') {
      return res.status(400).json({
        message: 'User is not online'
      });
    }

    // Create call record
    const call = new Call({
      participants: [
        { user: initiatorId },
        { user: receiverId }
      ],
      initiator: initiatorId,
      type,
      status: 'ringing',
      callId: uuidv4()
    });

    await call.save();

    // Create notification for receiver
    await Notification.create({
      user: receiverId,
      type: 'call',
      title: 'Incoming Call',
      message: `${initiator.username} is calling you`,
      relatedUser: initiatorId,
      relatedId: call._id,
      data: {
        callId: call.callId,
        type,
        initiator: {
          id: initiator._id,
          username: initiator.username,
          profilePicture: initiator.profilePicture
        }
      }
    });

    res.json({
      success: true,
      call,
      message: 'Call initiated successfully'
    });
  } catch (error) {
    console.error('Initiate call error:', error);
    res.status(500).json({
      message: 'Error initiating call',
      error: error.message
    });
  }
};

// Accept call
exports.acceptCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;

    const call = await Call.findOne({ callId });

    if (!call) {
      return res.status(404).json({
        message: 'Call not found'
      });
    }

    // Check if user is part of the call
    const isParticipant = call.participants.some(p => 
      p.user.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: 'You are not part of this call'
      });
    }

    // Update call status
    call.status = 'ongoing';
    call.startTime = new Date();

    // Update participant's joined time
    const participant = call.participants.find(p => 
      p.user.toString() === userId.toString()
    );
    if (participant) {
      participant.joinedAt = new Date();
    }

    await call.save();

    res.json({
      success: true,
      call,
      message: 'Call accepted'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error accepting call',
      error: error.message
    });
  }
};

// End call
exports.endCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;

    const call = await Call.findOne({ callId });

    if (!call) {
      return res.status(404).json({
        message: 'Call not found'
      });
    }

    // Check if user is part of the call
    const isParticipant = call.participants.some(p => 
      p.user.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: 'You are not part of this call'
      });
    }

    // Update participant's left time
    const participant = call.participants.find(p => 
      p.user.toString() === userId.toString()
    );
    if (participant) {
      participant.leftAt = new Date();
    }

    // Check if all participants have left
    const allLeft = call.participants.every(p => p.leftAt);
    if (allLeft) {
      call.endCall();
    }

    await call.save();

    res.json({
      success: true,
      call,
      message: 'Call ended'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error ending call',
      error: error.message
    });
  }
};

// Get call history
exports.getCallHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const calls = await Call.find({
      'participants.user': userId,
      status: { $in: ['completed', 'missed', 'rejected'] }
    })
      .populate('participants.user', 'username profilePicture')
      .populate('initiator', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Call.countDocuments({
      'participants.user': userId,
      status: { $in: ['completed', 'missed', 'rejected'] }
    });

    res.json({
      success: true,
      calls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get call history error:', error);
    res.status(500).json({
      message: 'Error fetching call history',
      error: error.message
    });
  }
};

// Reject call
exports.rejectCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;

    const call = await Call.findOne({ callId });

    if (!call) {
      return res.status(404).json({
        message: 'Call not found'
      });
    }

    // Check if user is part of the call
    const isParticipant = call.participants.some(p => 
      p.user.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        message: 'You are not part of this call'
      });
    }

    call.status = 'rejected';
    await call.save();

    res.json({
      success: true,
      message: 'Call rejected'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error rejecting call',
      error: error.message
    });
  }
};