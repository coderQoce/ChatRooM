import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Footer from '../common/Footer';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#f43f5e', '#7c3aed'];
const getColor = (name) => COLORS[(name || '').charCodeAt(0) % COLORS.length];

const UserProfile = () => {
  const { user: currentUser } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [addFriendLoading, setAddFriendLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true); setError('');
      try {
        const token = currentUser?.token;
        if (!token) throw new Error('Not authenticated');
        const response = await axios.get(`${API_URL}/api/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        setProfile(response.data.user);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load user');
      } finally { setLoading(false); }
    };
    fetchUser();
  }, [API_URL, currentUser?.token, userId]);

  const addFriend = async () => {
    setError(''); setSuccess('');
    try {
      setAddFriendLoading(true);
      const token = currentUser?.token;
      if (!token) throw new Error('Not authenticated');
      await axios.post(`${API_URL}/api/friends/add/${userId}`, null, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Friend added successfully!');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to add friend');
    } finally { setAddFriendLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)', padding: '0 16px', height: 58, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 12px rgba(99,102,241,.2)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', borderRadius: 8, transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>User Profile</span>
      </div>

      <div style={{ flex: 1, maxWidth: 500, margin: '0 auto', padding: '32px 16px', width: '100%' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
          </div>
        )}

        {!loading && error && <div className="alert-cr alert-cr-danger">{error}</div>}
        {!loading && success && <div className="alert-cr alert-cr-success" style={{ marginBottom: 16 }}>{success}</div>}

        {!loading && !error && profile && (
          <div className="cr-card slide-up" style={{ overflow: 'hidden' }}>
            {/* Profile Header */}
            <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)', padding: '32px 24px', textAlign: 'center' }}>
              <div className="avatar avatar-xl" style={{ background: getColor(profile.username), margin: '0 auto 12px', border: '3px solid rgba(255,255,255,.3)' }}>
                {(profile.username || 'U').charAt(0).toUpperCase()}
              </div>
              <h3 style={{ color: '#fff', fontWeight: 700, margin: '0 0 4px' }}>{profile.username}</h3>
              <p style={{ color: 'rgba(255,255,255,.8)', margin: 0, fontSize: '.9rem' }}>{profile.email}</p>
            </div>

            {/* Details */}
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1, padding: '14px 16px', background: '#f8f9fa', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Friend Code</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', letterSpacing: 1 }}>{profile.uniqueCode}</div>
                </div>
                <div style={{ flex: 1, padding: '14px 16px', background: '#f8f9fa', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Status</div>
                  <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{profile.status || 'Active'}</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-cr btn-primary-cr" style={{ flex: 1 }} onClick={addFriend} disabled={addFriendLoading}>
                  {addFriendLoading ? 'Adding...' : 'Add Friend'}
                </button>
                <button className="btn-cr btn-outline-cr" style={{ flex: 1 }} onClick={() => navigate(`/chat/${userId}`)}>
                  Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default UserProfile;
