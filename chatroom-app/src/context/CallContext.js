import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const CallContext = createContext();

export const useCall = () => useContext(CallContext);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

// Call states: idle | calling | ringing | connected
export const CallProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [callState, setCallState] = useState('idle');
  const [callType, setCallType] = useState(null); // 'audio' | 'video'
  const [remoteUser, setRemoteUser] = useState(null); // { id, username, profilePicture }
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);
  const ringtoneRef = useRef(null);

  // Cleanup streams and peer connection
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    remoteStreamRef.current = null;
    setCallDuration(0);
    setIsMuted(false);
    setIsCameraOff(false);
  }, []);

  // Start call timer
  const startTimer = useCallback(() => {
    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  // Get user media
  const getMedia = useCallback(async (type) => {
    const constraints = {
      audio: true,
      video: type === 'video' ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, []);

  // Create peer connection
  const createPeer = useCallback((stream) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);

    stream.getTracks().forEach(track => {
      peer.addTrack(track, stream);
    });

    peer.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate && socket && remoteUser) {
        socket.emit('call:ice-candidate', {
          to: remoteUser.id,
          candidate: event.candidate
        });
      }
    };

    peer.oniceconnectionstatechange = () => {
      if (peer.iceConnectionState === 'disconnected' || peer.iceConnectionState === 'failed') {
        endCall();
      }
    };

    peerRef.current = peer;
    return peer;
  }, [socket, remoteUser]);

  // Initiate a call (caller side)
  const startCall = useCallback(async (targetUser, type) => {
    if (callState !== 'idle' || !socket) return;

    try {
      setCallType(type);
      setRemoteUser(targetUser);
      setCallState('calling');

      const stream = await getMedia(type);
      const peer = createPeer(stream);

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit('call:offer', {
        to: targetUser.id,
        offer,
        callType: type,
        callerInfo: {
          id: user?.id,
          username: user?.username,
          profilePicture: user?.profilePicture
        }
      });
    } catch (err) {
      console.error('Failed to start call:', err);
      cleanup();
      setCallState('idle');
      setRemoteUser(null);
      setCallType(null);
    }
  }, [callState, socket, user, getMedia, createPeer, cleanup]);

  // Accept incoming call (receiver side)
  const acceptCall = useCallback(async (offer) => {
    if (!socket || !remoteUser) return;

    try {
      setCallState('connected');
      startTimer();

      const stream = await getMedia(callType);
      const peer = createPeer(stream);

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit('call:answer', {
        to: remoteUser.id,
        answer
      });
    } catch (err) {
      console.error('Failed to accept call:', err);
      endCall();
    }
  }, [socket, remoteUser, callType, getMedia, createPeer, startTimer]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    if (socket && remoteUser) {
      socket.emit('call:reject', { to: remoteUser.id });
    }
    cleanup();
    setCallState('idle');
    setRemoteUser(null);
    setCallType(null);
  }, [socket, remoteUser, cleanup]);

  // End ongoing call
  const endCall = useCallback(() => {
    if (socket && remoteUser) {
      socket.emit('call:end', { to: remoteUser.id });
    }
    cleanup();
    setCallState('idle');
    setRemoteUser(null);
    setCallType(null);
  }, [socket, remoteUser, cleanup]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  }, []);

  // Store pending offer for incoming calls
  const pendingOfferRef = useRef(null);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    // Incoming call
    const handleOffer = ({ from, offer, callType: type, callerInfo }) => {
      if (callState !== 'idle') {
        socket.emit('call:reject', { to: from });
        return;
      }
      pendingOfferRef.current = offer;
      setCallType(type);
      setRemoteUser({ id: from, ...callerInfo });
      setCallState('ringing');
    };

    // Call answered
    const handleAnswer = async ({ answer }) => {
      try {
        if (peerRef.current) {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setCallState('connected');
          startTimer();
        }
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    };

    // ICE candidate
    const handleIceCandidate = async ({ candidate }) => {
      try {
        if (peerRef.current && candidate) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    };

    // Call rejected
    const handleRejected = () => {
      cleanup();
      setCallState('idle');
      setRemoteUser(null);
      setCallType(null);
    };

    // Call ended
    const handleEnded = () => {
      cleanup();
      setCallState('idle');
      setRemoteUser(null);
      setCallType(null);
    };

    socket.on('call:offer', handleOffer);
    socket.on('call:answer', handleAnswer);
    socket.on('call:ice-candidate', handleIceCandidate);
    socket.on('call:rejected', handleRejected);
    socket.on('call:ended', handleEnded);

    return () => {
      socket.off('call:offer', handleOffer);
      socket.off('call:answer', handleAnswer);
      socket.off('call:ice-candidate', handleIceCandidate);
      socket.off('call:rejected', handleRejected);
      socket.off('call:ended', handleEnded);
    };
  }, [socket, callState, cleanup, startTimer]);

  // Accept with pending offer
  const acceptIncoming = useCallback(() => {
    if (pendingOfferRef.current) {
      acceptCall(pendingOfferRef.current);
      pendingOfferRef.current = null;
    }
  }, [acceptCall]);

  const value = {
    callState,
    callType,
    remoteUser,
    isMuted,
    isCameraOff,
    callDuration,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall: acceptIncoming,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
