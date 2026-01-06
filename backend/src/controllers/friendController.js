const { users, friendRequests } = require('../db/db');

// Send friend request
exports.sendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    // Check if trying to add self
    if (userId === currentUser.id) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot send friend request to yourself' 
      });
    }

    // Find target user
    const targetUser = await users.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if already friends
    if (currentUser.friends?.includes(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Already friends with this user' 
      });
    }

    // Check if request already exists
    const existingRequest = await friendRequests.findExisting(currentUser.id, userId);
    
    if (existingRequest) {
      return res.status(400).json({ 
        success: false,
        message: 'Friend request already sent' 
      });
    }

    // Create friend request
    const request = await friendRequests.create({
      senderId: currentUser.id,
      receiverId: userId,
      status: 'pending',
      senderName: currentUser.username,
      receiverName: targetUser.username
    });

    res.json({
      success: true,
      message: 'Friend request sent successfully',
      request
    });
  } catch (error) {
    console.error('Send request error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error sending friend request', 
      error: error.message 
    });
  }
};

// Accept friend request
exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUser = req.user;

    // Find request
    const requests = await friendRequests.findAll();
    const request = requests.find(req => req.id === requestId && req.receiverId === currentUser.id);
    
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Friend request not found' 
      });
    }

    // Update request status
    await friendRequests.update(requestId, { status: 'accepted' });

    // Add to each other's friend list
    const sender = await users.findById(request.senderId);
    const receiver = await users.findById(request.receiverId);

    if (sender && receiver) {
      // Add receiver to sender's friends
      const senderFriends = sender.friends || [];
      if (!senderFriends.includes(receiver.id)) {
        senderFriends.push(receiver.id);
        await users.update(sender.id, { friends: senderFriends });
      }

      // Add sender to receiver's friends
      const receiverFriends = receiver.friends || [];
      if (!receiverFriends.includes(sender.id)) {
        receiverFriends.push(sender.id);
        await users.update(receiver.id, { friends: receiverFriends });
      }
    }

    res.json({
      success: true,
      message: 'Friend request accepted successfully'
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error accepting friend request', 
      error: error.message 
    });
  }
};

// Reject friend request
exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUser = req.user;

    // Find request
    const requests = await friendRequests.findAll();
    const request = requests.find(req => req.id === requestId && req.receiverId === currentUser.id);
    
    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: 'Friend request not found' 
      });
    }

    // Update request status
    await friendRequests.update(requestId, { status: 'rejected' });

    res.json({
      success: true,
      message: 'Friend request rejected successfully'
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error rejecting friend request', 
      error: error.message 
    });
  }
};

// Get all friends and requests
exports.getFriends = async (req, res) => {
  try {
    const currentUser = req.user;
    const allUsers = await users.findAll();
    const allRequests = await friendRequests.findAll();

    // Get user's friends
    const friendIds = currentUser.friends || [];
    const friends = allUsers
      .filter(user => friendIds.includes(user.id))
      .map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });

    // Get pending requests received
    const pendingRequests = allRequests
      .filter(req => req.receiverId === currentUser.id && req.status === 'pending')
      .map(req => {
        const sender = allUsers.find(u => u.id === req.senderId);
        if (sender) {
          const { password, ...safeSender } = sender;
          return {
            ...req,
            sender: safeSender
          };
        }
        return req;
      })
      .filter(req => req.sender); // Remove requests where sender not found

    // Get sent requests
    const sentRequests = allRequests
      .filter(req => req.senderId === currentUser.id && req.status === 'pending')
      .map(req => {
        const receiver = allUsers.find(u => u.id === req.receiverId);
        if (receiver) {
          const { password, ...safeReceiver } = receiver;
          return {
            ...req,
            receiver: safeReceiver
          };
        }
        return req;
      })
      .filter(req => req.receiver); // Remove requests where receiver not found

    res.json({
      success: true,
      friends,
      pendingRequests,
      sentRequests
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching friends', 
      error: error.message 
    });
  }
};

// Remove friend
exports.removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    // Remove from current user's friends
    const currentFriends = currentUser.friends || [];
    const updatedCurrentFriends = currentFriends.filter(id => id !== userId);
    await users.update(currentUser.id, { friends: updatedCurrentFriends });

    // Remove from other user's friends
    const otherUser = await users.findById(userId);
    if (otherUser) {
      const otherFriends = otherUser.friends || [];
      const updatedOtherFriends = otherFriends.filter(id => id !== currentUser.id);
      await users.update(userId, { friends: updatedOtherFriends });
    }

    res.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error removing friend', 
      error: error.message 
    });
  }
};