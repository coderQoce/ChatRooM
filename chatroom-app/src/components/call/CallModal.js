import React, { useEffect, useState } from 'react';
import { useCall } from '../../context/CallContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#f43f5e', '#7c3aed'];
const getColor = (name) => COLORS[(name || '').charCodeAt(0) % COLORS.length];

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const CallModal = () => {
  const {
    callState, callType, remoteUser,
    isMuted, isCameraOff, callDuration,
    localVideoRef, remoteVideoRef,
    acceptCall, rejectCall, endCall,
    toggleMute, toggleCamera
  } = useCall();

  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    if (callState === 'calling' || callState === 'ringing') {
      const interval = setInterval(() => setPulse(p => !p), 1000);
      return () => clearInterval(interval);
    }
  }, [callState]);

  if (callState === 'idle') return null;

  const isVideo = callType === 'video';
  const isConnected = callState === 'connected';
  const isRinging = callState === 'ringing';
  const isCalling = callState === 'calling';

  const avatar = remoteUser?.profilePicture
    ? <img src={`${API_URL}${remoteUser.profilePicture}`} alt={remoteUser?.username} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,.2)' }} />
    : <div style={{ width: 96, height: 96, borderRadius: '50%', background: getColor(remoteUser?.username), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 700, color: '#fff', border: '3px solid rgba(255,255,255,.2)' }}>
        {(remoteUser?.username || 'U').charAt(0).toUpperCase()}
      </div>;

  // Control button component
  const ControlBtn = ({ onClick, bg, children, label, active }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <button onClick={onClick} style={{
        width: 56, height: 56, borderRadius: '50%', border: 'none',
        background: bg || 'rgba(255,255,255,.12)',
        color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .2s', boxShadow: active ? 'none' : '0 4px 16px rgba(0,0,0,.2)',
        opacity: active ? 0.7 : 1
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        {children}
      </button>
      {label && <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.6)' }}>{label}</span>}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: isConnected && isVideo ? '#000' : 'rgba(10,8,30,.92)',
      backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn .3s ease-out'
    }}>

      {/* Video streams (only when connected + video) */}
      {isConnected && isVideo && (
        <>
          {/* Remote video (full screen) */}
          <video ref={remoteVideoRef} autoPlay playsInline style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'
          }} />
          {/* Local video (picture-in-picture) */}
          <video ref={localVideoRef} autoPlay playsInline muted style={{
            position: 'absolute', top: 20, right: 20, width: 140, height: 105,
            borderRadius: 14, objectFit: 'cover', border: '2px solid rgba(255,255,255,.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,.4)', zIndex: 2
          }} />
        </>
      )}

      {/* Audio-only local video (hidden but needed for ref) */}
      {isConnected && !isVideo && (
        <>
          <video ref={localVideoRef} autoPlay playsInline muted style={{ display: 'none' }} />
          <video ref={remoteVideoRef} autoPlay playsInline style={{ display: 'none' }} />
          <audio ref={remoteVideoRef} autoPlay />
        </>
      )}

      {/* Calling / Ringing preview video */}
      {!isConnected && isVideo && (
        <video ref={localVideoRef} autoPlay playsInline muted style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3
        }} />
      )}

      {/* Call info overlay */}
      <div style={{
        position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 16, textAlign: 'center',
        ...(isConnected && isVideo ? { position: 'absolute', top: 40 } : {})
      }}>
        {/* Avatar with pulse ring */}
        {!(isConnected && isVideo) && (
          <div style={{ position: 'relative' }}>
            {(isCalling || isRinging) && (
              <div style={{
                position: 'absolute', inset: -12, borderRadius: '50%',
                border: '2px solid rgba(99,102,241,.4)',
                animation: 'pulse 2s ease-in-out infinite',
                opacity: pulse ? 1 : 0.3, transition: 'opacity .5s'
              }} />
            )}
            {avatar}
          </div>
        )}

        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.3)' }}>
            {remoteUser?.username || 'Unknown'}
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '.9rem', color: 'rgba(255,255,255,.6)' }}>
            {isCalling && (isVideo ? 'Video calling...' : 'Audio calling...')}
            {isRinging && (isVideo ? 'Incoming video call' : 'Incoming audio call')}
            {isConnected && formatDuration(callDuration)}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        position: isConnected && isVideo ? 'absolute' : 'relative',
        bottom: isConnected && isVideo ? 50 : 'auto',
        marginTop: isConnected && isVideo ? 0 : 48,
        zIndex: 3, display: 'flex', gap: 20, alignItems: 'flex-end'
      }}>
        {/* Ringing: Accept + Reject */}
        {isRinging && (
          <>
            <ControlBtn onClick={rejectCall} bg="linear-gradient(135deg, #f43f5e, #e11d48)" label="Decline">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </ControlBtn>
            <ControlBtn onClick={acceptCall} bg="linear-gradient(135deg, #10b981, #059669)" label="Accept">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </ControlBtn>
          </>
        )}

        {/* Calling: only hang up */}
        {isCalling && (
          <ControlBtn onClick={endCall} bg="linear-gradient(135deg, #f43f5e, #e11d48)" label="Cancel">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </ControlBtn>
        )}

        {/* Connected: mute, camera, hang up */}
        {isConnected && (
          <>
            <ControlBtn onClick={toggleMute} active={isMuted} label={isMuted ? 'Unmute' : 'Mute'}
              bg={isMuted ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.12)'}>
              {isMuted ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" />
                  <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </ControlBtn>

            {isVideo && (
              <ControlBtn onClick={toggleCamera} active={isCameraOff} label={isCameraOff ? 'Camera On' : 'Camera Off'}
                bg={isCameraOff ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.12)'}>
                {isCameraOff ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M16.5 9.4l-2-3.4H7.5l-2 3.4H3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2.5" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                )}
              </ControlBtn>
            )}

            <ControlBtn onClick={endCall} bg="linear-gradient(135deg, #f43f5e, #e11d48)" label="End">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </ControlBtn>
          </>
        )}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default CallModal;
