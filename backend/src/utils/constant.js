module.exports = {
  USER_STATUS: {
    ONLINE: 'online',
    OFFLINE: 'offline',
    AWAY: 'away',
    BUSY: 'busy'
  },
  
  FRIEND_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    BLOCKED: 'blocked'
  },
  
  MESSAGE_TYPES: {
    TEXT: 'text',
    IMAGE: 'image',
    FILE: 'file',
    VOICE: 'voice'
  },
  
  CALL_TYPES: {
    AUDIO: 'audio',
    VIDEO: 'video'
  },
  
  CALL_STATUS: {
    INITIATED: 'initiated',
    RINGING: 'ringing',
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    MISSED: 'missed',
    REJECTED: 'rejected'
  },
  
  NOTIFICATION_TYPES: {
    FRIEND_REQUEST: 'friend_request',
    FRIEND_ACCEPTED: 'friend_accepted',
    MESSAGE: 'message',
    CALL: 'call',
    SYSTEM: 'system'
  },
  
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MESSAGES_LIMIT: 50
  },
  
  SOCKET_EVENTS: {
    AUTHENTICATE: 'authenticate',
    NEW_MESSAGE: 'new_message',
    MESSAGE_SENT: 'message_sent',
    MESSAGES_READ: 'messages_read',
    USER_TYPING: 'user_typing',
    USER_STOP_TYPING: 'user_stop_typing',
    FRIEND_REQUEST: 'friend_request',
    FRIEND_ACCEPTED: 'friend_accepted',
    FRIEND_STATUS: 'friend_status',
    INCOMING_CALL: 'incoming_call',
    CALL_SIGNAL: 'call_signal',
    CALL_ACCEPTED: 'call_accepted',
    CALL_REJECTED: 'call_rejected',
    CALL_ENDED: 'call_ended',
    INCOMING_SIGNAL: 'incoming_signal'
  }
};