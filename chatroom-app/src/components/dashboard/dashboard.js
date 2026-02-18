import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../common/Footer';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#f43f5e', '#7c3aed'];
const getColor = (name) => COLORS[(name || '').charCodeAt(0) % COLORS.length];

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Avatar = ({ name, size = 44, picture }) => (
  picture ? (
    <img src={`${API_URL}${picture}`} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  ) : (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: getColor(name) }}>
      {(name || 'U').charAt(0).toUpperCase()}
    </div>
  )
);

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
    <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
  </div>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [toast, setToast] = useState('');
  const [showFindFriends, setShowFindFriends] = useState(false);
  const [friendCode, setFriendCode] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [addFriendLoading, setAddFriendLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState('');
  const [friends, setFriends] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState('');
  const [chats, setChats] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);

  const authHeaders = useMemo(() => {
    const token = user?.token;
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }, [user?.token]);

  const fetchFriends = async () => {
    setFriendsError('');
    try {
      setFriendsLoading(true);
      if (!authHeaders) throw new Error('Not authenticated');
      const response = await axios.get(`${API_URL}/api/friends`, { headers: authHeaders });
      setFriends(response.data.friends || []);
    } catch (err) {
      setFriendsError(err?.response?.data?.message || err?.message || 'Failed to load friends');
    } finally { setFriendsLoading(false); }
  };

  const fetchChats = async () => {
    setChatsError('');
    try {
      setChatsLoading(true);
      if (!authHeaders) throw new Error('Not authenticated');
      const response = await axios.get(`${API_URL}/api/messages/chats`, { headers: authHeaders });
      setChats(response.data.chats || []);
    } catch (err) {
      setChatsError(err?.response?.data?.message || err?.message || 'Failed to load chats');
    } finally { setChatsLoading(false); }
  };

  useEffect(() => {
    if (!user?.token) return;
    fetchFriends();
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(user?.uniqueCode || '');
      setToast('Code copied!');
      setTimeout(() => setToast(''), 2500);
    } catch { setToast('Failed to copy'); setTimeout(() => setToast(''), 2500); }
  };

  const handleAddFriend = async (targetUserId) => {
    setSearchError('');
    try {
      setAddFriendLoading(true);
      await axios.post(`${API_URL}/api/friends/add/${targetUserId}`, null, { headers: { Authorization: `Bearer ${user?.token}` } });
      setToast('Friend added!');
      setTimeout(() => setToast(''), 2500);
      await fetchFriends();
    } catch (err) {
      setSearchError(err?.response?.data?.message || err?.message || 'Failed to add friend');
    } finally { setAddFriendLoading(false); }
  };

  const openFindFriends = () => { setFriendCode(''); setSearchError(''); setSearchResult(null); setShowFindFriends(true); };

  const handleSearchFriend = async (e) => {
    e.preventDefault();
    setSearchError(''); setSearchResult(null);
    const code = friendCode.trim().toUpperCase();
    if (code.length !== 6) { setSearchError('Please enter a valid 6-character code'); return; }
    try {
      setSearchLoading(true);
      const token = user?.token;
      if (!token) throw new Error('Not authenticated');
      const response = await axios.get(`${API_URL}/api/user/search`, { params: { code }, headers: { Authorization: `Bearer ${token}` } });
      setSearchResult(response.data.user);
    } catch (err) {
      setSearchError(err?.response?.data?.message || err?.message || 'Search failed');
    } finally { setSearchLoading(false); }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      const now = new Date();
      const diff = now - d;
      if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
      <div className="fade-in" style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.4)' }} onClick={onClose}>
        <div className="slide-up cr-card modal-card" style={{ width: '100%', maxWidth: 440, maxHeight: '80vh', overflow: 'auto', padding: 0 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{title}</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.3rem', lineHeight: 1 }}>&times;</button>
          </div>
          <div style={{ padding: 20 }}>{children}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Toast */}
      {toast && (
        <div className="fade-in" style={{ position: 'fixed', top: 20, right: 20, zIndex: 2000, padding: '12px 20px', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '.9rem', boxShadow: 'var(--shadow-md)' }}>
          {toast}
        </div>
      )}

      {/* Find Friends Modal */}
      <Modal show={showFindFriends} onClose={() => setShowFindFriends(false)} title="Find Friends">
        <form onSubmit={handleSearchFriend}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '.85rem', color: 'var(--text-secondary)' }}>Friend Code</label>
          <input className="input-cr" value={friendCode} onChange={e => setFriendCode(e.target.value)} placeholder="Enter 6-character code" maxLength={6} autoFocus style={{ marginBottom: 12 }} />
          {searchError && <div className="alert-cr alert-cr-danger" style={{ marginBottom: 12 }}>{searchError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={searchLoading} className="btn-cr btn-primary-cr" style={{ flex: 1 }}>
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
            <button type="button" className="btn-cr btn-ghost-cr" onClick={() => setShowFindFriends(false)}>Cancel</button>
          </div>
        </form>
        {searchResult && (
          <div style={{ marginTop: 16, padding: 16, background: '#f8f9fa', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Avatar name={searchResult.username} size={44} picture={searchResult.profilePicture} />
              <div>
                <div style={{ fontWeight: 600 }}>{searchResult.username}</div>
                <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>{searchResult.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-cr btn-primary-cr" style={{ flex: 1, padding: '8px 12px', fontSize: '.85rem' }} disabled={addFriendLoading} onClick={() => handleAddFriend(searchResult.id)}>
                {addFriendLoading ? 'Adding...' : 'Add Friend'}
              </button>
              <button className="btn-cr btn-outline-cr" style={{ flex: 1, padding: '8px 12px', fontSize: '.85rem' }} onClick={() => { setShowFindFriends(false); navigate(`/chat/${searchResult.id}`); }}>
                Message
              </button>
              <button className="btn-cr btn-ghost-cr" style={{ padding: '8px 12px', fontSize: '.85rem' }} onClick={() => { setShowFindFriends(false); navigate(`/user/${searchResult.id}`); }}>
                Profile
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Friends List Modal */}
      <Modal show={showFriendsList} onClose={() => setShowFriendsList(false)} title={`Friends (${friends.length})`}>
        {friendsLoading && <Spinner />}
        {!friendsLoading && friendsError && <div className="alert-cr alert-cr-danger">{friendsError}</div>}
        {!friendsLoading && !friendsError && friends.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <p style={{ marginBottom: 16 }}>No friends yet</p>
            <button className="btn-cr btn-primary-cr" onClick={() => { setShowFriendsList(false); openFindFriends(); }}>Find Friends</button>
          </div>
        )}
        {!friendsLoading && !friendsError && friends.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {friends.map(f => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--radius-sm)', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f2f5'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Avatar name={f.username} size={42} picture={f.profilePicture} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '.93rem' }}>{f.username}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-cr btn-primary-cr" style={{ padding: '5px 10px', fontSize: '.78rem' }} onClick={() => { setShowFriendsList(false); navigate(`/chat/${f.id}`); }}>Chat</button>
                  <button className="btn-cr btn-ghost-cr" style={{ padding: '5px 10px', fontSize: '.78rem' }} onClick={() => { setShowFriendsList(false); navigate(`/user/${f.id}`); }}>Profile</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* New Chat Modal */}
      <Modal show={showNewChat} onClose={() => setShowNewChat(false)} title="New Chat">
        {friendsLoading && <Spinner />}
        {!friendsLoading && friendsError && <div className="alert-cr alert-cr-danger">{friendsError}</div>}
        {!friendsLoading && !friendsError && friends.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
            <p>No friends yet. Add a friend first!</p>
            <button className="btn-cr btn-primary-cr" onClick={() => { setShowNewChat(false); openFindFriends(); }}>Find Friends</button>
          </div>
        )}
        {!friendsLoading && !friendsError && friends.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {friends.map(f => (
              <div key={f.id} onClick={() => { setShowNewChat(false); navigate(`/chat/${f.id}`); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f2f5'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Avatar name={f.username} size={40} picture={f.profilePicture} />
                <span style={{ fontWeight: 500 }}>{f.username}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)', padding: '0 20px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(99,102,241,.2)' }}>
        <div className="dashboard-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.15rem' }}>ChatRooM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user?.profilePicture ? (
              <img src={`${API_URL}${user.profilePicture}`} alt={user?.username} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,.3)', cursor: 'pointer' }} onClick={() => navigate('/settings')} />
            ) : (
              <div className="avatar" style={{ width: 34, height: 34, fontSize: 14, background: getColor(user?.username), border: '2px solid rgba(255,255,255,.3)', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
                {(user?.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <button onClick={logout} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', borderRadius: 8, transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          {/* Profile Card */}
          <div className="cr-card slide-up" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <Avatar name={user?.username} size={56} picture={user?.profilePicture} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{user?.username || 'User'}</div>
                <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
              </div>
            </div>

            {/* Friend Code */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Your Friend Code</div>
              <div onClick={handleCopyCode} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#ddd6fe'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--primary-light)'}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-dark)', letterSpacing: 2 }}>{user?.uniqueCode || 'NOCODE'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              </div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>Click to copy</div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[{ label: 'Friends', value: friends.length }, { label: 'Chats', value: chats.length }].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '12px 8px', background: '#f8f9fa', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>{s.value}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="cr-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn-cr btn-primary-cr" style={{ width: '100%' }} onClick={openFindFriends}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              Find Friends
            </button>
            <button className="btn-cr btn-outline-cr" style={{ width: '100%' }} onClick={() => setShowFriendsList(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              View Friends
            </button>
            <button className="btn-cr btn-outline-cr" style={{ width: '100%' }} onClick={() => setShowNewChat(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              New Chat
            </button>
            <button className="btn-cr btn-ghost-cr" style={{ width: '100%' }} onClick={() => navigate('/settings')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.26.46.4.97.41 1.51" /></svg>
              Settings
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="dashboard-chatlist">
          <div className="cr-card slide-up" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Chats</h3>
              <button className="btn-cr btn-primary-cr" style={{ padding: '6px 14px', fontSize: '.85rem' }} onClick={() => setShowNewChat(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                New
              </button>
            </div>
            <div style={{ minHeight: 400 }}>
              {chatsLoading && <Spinner />}
              {!chatsLoading && chatsError && (
                <div style={{ padding: 20 }}><div className="alert-cr alert-cr-danger">{chatsError}</div></div>
              )}
              {!chatsLoading && !chatsError && chats.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  </div>
                  <h4 style={{ fontWeight: 700, marginBottom: 8 }}>No conversations yet</h4>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: 300, marginBottom: 20 }}>Find friends and start chatting!</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-cr btn-primary-cr" onClick={openFindFriends}>Find Friends</button>
                    <button className="btn-cr btn-outline-cr" onClick={() => setShowNewChat(true)}>New Chat</button>
                  </div>
                </div>
              )}
              {!chatsLoading && !chatsError && chats.length > 0 && chats.map(c => (
                <div key={c.user?.id} onClick={() => navigate(`/chat/${c.user.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'background .12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f2f5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Avatar name={c.user?.username} size={48} picture={c.user?.profilePicture} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: '.95rem' }}>{c.user?.username}</span>
                      <span style={{ fontSize: '.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{formatTime(c.lastMessage?.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: '.87rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.lastMessage?.content || 'Start a conversation'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Dashboard;