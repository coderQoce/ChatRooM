import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#f43f5e', '#7c3aed'];
const getColor = (name) => COLORS[(name || '').charCodeAt(0) % COLORS.length];

const ChatPage = () => {
  const { user: currentUser } = useAuth();
  const { startCall } = useCall();
  const { userId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = currentUser?.token;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const [contextMenuMsgId, setContextMenuMsgId] = useState(null);

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const fetchOtherUser = async () => {
    try {
      if (!token) return;
      const response = await axios.get(`${API_URL}/api/user/${userId}`, { headers });
      setOtherUserProfile(response.data.user);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  const loadConversation = async () => {
    setLoading(true);
    setError('');
    try {
      if (!token) throw new Error('Not authenticated');
      const response = await axios.get(`${API_URL}/api/messages/conversation/${userId}`, { headers });
      setMessages(response.data.messages || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load conversation');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchOtherUser();
    loadConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, token]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const content = messageText.trim();
    if (!content) return;
    try {
      setSending(true);
      const response = await axios.post(`${API_URL}/api/messages`, { receiverId: userId, content }, { headers });
      setMessages(prev => [...prev, response.data.message]);
      setMessageText('');
      inputRef.current?.focus();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to send message');
    } finally { setSending(false); }
  };

  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${API_URL}/api/messages/${messageId}`, { headers });
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setContextMenuMsgId(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const formatTime = (d) => {
    try { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  const formatDateLabel = (d) => {
    try {
      const date = new Date(d);
      const now = new Date();
      const diff = Math.floor((now - date) / 86400000);
      if (diff === 0) return 'Today';
      if (diff === 1) return 'Yesterday';
      return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
  };

  const otherName = otherUserProfile?.username
    || messages.find(m => m.senderId !== currentUser?.id)?.sender?.username
    || messages.find(m => m.receiverId !== currentUser?.id)?.receiver?.username
    || 'Chat';
  const hasText = messageText.trim().length > 0;

  const groupedMessages = [];
  let lastDateLabel = '';
  messages.forEach((m, i) => {
    const label = formatDateLabel(m.createdAt);
    if (label && label !== lastDateLabel) {
      groupedMessages.push({ type: 'date', label, key: `date-${i}` });
      lastDateLabel = label;
    }
    groupedMessages.push({ type: 'msg', msg: m, key: m.id || `msg-${i}` });
  });

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* ===== Header ===== */}
      <div style={{
        background: 'rgba(255,255,255,.04)',
        backdropFilter: 'blur(24px) saturate(1.4)', WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        padding: '0 12px', height: 62, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        boxShadow: '0 4px 24px rgba(0,0,0,.15)'
      }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', borderRadius: 8, transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
        </button>

        {otherUserProfile?.profilePicture ? (
          <img src={`${API_URL}${otherUserProfile.profilePicture}`} alt={otherName} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,.3)', flexShrink: 0 }} />
        ) : (
          <div className="avatar" style={{ width: 42, height: 42, fontSize: 17, background: getColor(otherName), border: '2px solid rgba(255,255,255,.3)' }}>
            {otherName.charAt(0).toUpperCase()}
          </div>
        )}

        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>{otherName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: otherUserProfile?.status === 'online' ? '#22c55e' : '#94a3b8' }} />
            <span style={{ color: 'rgba(255,255,255,.65)', fontSize: '.76rem' }}>
              {otherUserProfile?.status === 'online' ? 'online' : otherUserProfile?.lastSeen ? `last seen ${new Date(otherUserProfile.lastSeen).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : 'offline'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {/* Audio Call */}
          <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.8)', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            onClick={() => startCall({ id: userId, username: otherName, profilePicture: otherUserProfile?.profilePicture }, 'audio')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
          </button>
          {/* Video Call */}
          <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.8)', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            onClick={() => startCall({ id: userId, username: otherName, profilePicture: otherUserProfile?.profilePicture }, 'video')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
          </button>
          {/* Profile */}
          <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.8)', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            onClick={() => navigate(`/user/${userId}`)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </button>
          {/* Refresh */}
          <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.8)', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            onClick={loadConversation}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
          </button>
        </div>
      </div>

      {/* ===== Messages ===== */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '12px 0',
        background: `var(--bg-chat) url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.02'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2l4 3.5-4 3zM0 20.5V18h20v-2H0v-2l-4 3.5 4 3z'/%3E%3C/g%3E%3C/svg%3E")`,
      }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 10px' }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
            </div>
          )}

          {!loading && error && <div className="alert-cr alert-cr-danger" style={{ margin: '20px 0' }}>{error}</div>}

          {!loading && !error && messages.length === 0 && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </div>
              <h3 style={{ fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>Start the conversation</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', maxWidth: 280 }}>Send your first message to {otherName}</p>
            </div>
          )}

          {!loading && !error && groupedMessages.map(item => {
            if (item.type === 'date') {
              return (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 10px' }}>
                  <span style={{ background: 'rgba(99,102,241,.1)', color: 'var(--primary-dark)', fontSize: '.75rem', fontWeight: 600, padding: '4px 14px', borderRadius: 20 }}>
                    {item.label}
                  </span>
                </div>
              );
            }
            const m = item.msg;
            const isMine = m.senderId === currentUser?.id;
            return (
              <div key={item.key} className="fade-in" style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 3, padding: '0 4px', position: 'relative' }}
                onMouseLeave={() => contextMenuMsgId === m.id && setContextMenuMsgId(null)}>
                <div style={{
                  maxWidth: '70%', padding: '9px 12px 6px', borderRadius: 12,
                  background: isMine ? 'linear-gradient(135deg, rgba(99,102,241,.2) 0%, rgba(139,92,246,.15) 100%)' : 'rgba(255,255,255,.06)',
                  boxShadow: isMine ? '0 2px 8px rgba(99,102,241,.1)' : '0 2px 8px rgba(0,0,0,.1)',
                  border: isMine ? '1px solid rgba(99,102,241,.15)' : '1px solid rgba(255,255,255,.06)',
                  borderTopRightRadius: isMine ? 2 : 12,
                  borderTopLeftRadius: isMine ? 12 : 2,
                  position: 'relative', cursor: 'pointer'
                }}
                  onClick={() => setContextMenuMsgId(contextMenuMsgId === m.id ? null : m.id)}>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: '.93rem', lineHeight: 1.45, color: 'var(--text)' }}>{m.content}</div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 3 }}>
                    <span style={{ fontSize: '.7rem', color: 'var(--text-secondary)' }}>{formatTime(m.createdAt)}</span>
                    {isMine && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </div>
                </div>
                {contextMenuMsgId === m.id && (
                  <div className="fade-in" style={{
                    position: 'absolute', top: -6, [isMine ? 'right' : 'left']: 0, zIndex: 10,
                    background: 'rgba(30,25,60,.95)', backdropFilter: 'blur(20px)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)',
                    border: '1px solid rgba(255,255,255,.1)', overflow: 'hidden', transform: 'translateY(-100%)'
                  }}>
                    <button onClick={(e) => { e.stopPropagation(); deleteMessage(m.id); }} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', border: 'none',
                      background: 'none', color: 'var(--danger)', fontSize: '.85rem', fontWeight: 600,
                      cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background .12s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ===== Composer ===== */}
      <div style={{ background: 'rgba(255,255,255,.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '8px 10px 10px', borderTop: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                ref={inputRef}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a message..."
                disabled={sending}
                rows={1}
                style={{
                  width: '100%', resize: 'none', border: '1.5px solid var(--border)', borderRadius: 22,
                  padding: '11px 18px', fontSize: '.93rem', fontFamily: 'inherit', color: 'var(--text)',
                  background: 'var(--bg)', outline: 'none', transition: 'border-color .15s, box-shadow .15s',
                  maxHeight: 120, overflowY: 'auto', lineHeight: 1.4
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <button type="submit" disabled={sending || !hasText} style={{
              width: 46, height: 46, borderRadius: '50%', border: 'none', flexShrink: 0,
              background: hasText ? 'linear-gradient(135deg, var(--primary) 0%, var(--accent, #8b5cf6) 100%)' : 'rgba(255,255,255,.08)',
              color: '#fff', cursor: hasText ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .2s ease', boxShadow: hasText ? '0 4px 14px rgba(99,102,241,.3)' : 'none',
              transform: hasText ? 'scale(1)' : 'scale(.95)'
            }}
              onMouseEnter={e => { if (hasText) e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = hasText ? 'scale(1)' : 'scale(.95)'; }}>
              {sending ? (
                <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
              )}
            </button>
          </form>
          <div className="chat-hint" style={{ textAlign: 'center', marginTop: 6 }}>
            <span style={{ fontSize: '.72rem', color: '#b0b5c0' }}>Press Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ChatPage;
