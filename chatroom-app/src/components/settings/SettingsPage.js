import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Footer from '../common/Footer';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#f43f5e', '#7c3aed'];
const getColor = (name) => COLORS[(name || '').charCodeAt(0) % COLORS.length];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const headers = { Authorization: `Bearer ${user?.token}` };

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [toast, setToast] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  // Update localStorage user data helper
  const updateStoredUser = (updates) => {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    const updated = { ...stored, ...updates };
    localStorage.setItem('user', JSON.stringify(updated));
    window.location.reload();
  };

  // Edit profile
  const handleEditProfile = async (e) => {
    e.preventDefault();
    setEditError('');
    const trimmed = editUsername.trim();
    if (!trimmed) { setEditError('Username is required'); return; }
    if (trimmed === user?.username) { setShowEditProfile(false); return; }
    try {
      setEditLoading(true);
      await axios.put(`${API_URL}/api/user/profile`, { username: trimmed }, { headers });
      updateStoredUser({ username: trimmed });
    } catch (err) {
      setEditError(err?.response?.data?.message || 'Failed to update profile');
    } finally { setEditLoading(false); }
  };

  // Upload avatar
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      setAvatarUploading(true);
      const res = await axios.post(`${API_URL}/api/upload/avatar`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
      });
      updateStoredUser({ profilePicture: res.data.profilePicture });
    } catch (err) {
      showToast(err?.response?.data?.message || 'Upload failed');
    } finally { setAvatarUploading(false); }
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    try {
      setAvatarUploading(true);
      await axios.delete(`${API_URL}/api/upload/avatar`, { headers });
      updateStoredUser({ profilePicture: null });
    } catch (err) {
      showToast('Failed to remove picture');
    } finally { setAvatarUploading(false); }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      setDeleteLoading(true);
      await axios.delete(`${API_URL}/api/user/account`, { headers });
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete account');
    } finally { setDeleteLoading(false); }
  };

  const avatarUrl = user?.profilePicture ? `${API_URL}${user.profilePicture}` : null;

  const Section = ({ title, children }) => (
    <div className="cr-card" style={{ padding: 24, marginBottom: 16 }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--primary)' }}>{title}</h3>
      {children}
    </div>
  );

  const Row = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: '.9rem' }}>{value}</span>
    </div>
  );

  const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
      <div className="fade-in" style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.4)' }} onClick={onClose}>
        <div className="slide-up cr-card modal-card" style={{ width: '100%', maxWidth: 420, maxHeight: '80vh', overflow: 'auto', padding: 0 }} onClick={e => e.stopPropagation()}>
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

      {/* Edit Profile Modal */}
      <Modal show={showEditProfile} onClose={() => setShowEditProfile(false)} title="Edit Profile">
        <form onSubmit={handleEditProfile}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '.85rem', color: 'var(--text-secondary)' }}>Username</label>
          <input className="input-cr" value={editUsername} onChange={e => setEditUsername(e.target.value)} placeholder="Enter new username" autoFocus style={{ marginBottom: 12 }} />
          {editError && <div className="alert-cr alert-cr-danger" style={{ marginBottom: 12 }}>{editError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={editLoading} className="btn-cr btn-primary-cr" style={{ flex: 1 }}>
              {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn-cr btn-ghost-cr" onClick={() => setShowEditProfile(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal show={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }} title="Delete Account">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </div>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>This action is permanent</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.88rem' }}>All your messages, friends, and data will be permanently deleted.</p>
        </div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '.85rem', color: 'var(--text-secondary)' }}>Type DELETE to confirm</label>
        <input className="input-cr" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="DELETE" style={{ marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button disabled={deleteConfirmText !== 'DELETE' || deleteLoading} className="btn-cr btn-danger-cr" style={{ flex: 1 }} onClick={handleDeleteAccount}>
            {deleteLoading ? 'Deleting...' : 'Delete My Account'}
          </button>
          <button className="btn-cr btn-ghost-cr" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}>Cancel</button>
        </div>
      </Modal>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)', padding: '0 16px', height: 58, display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 12px rgba(99,102,241,.2)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', borderRadius: 8, transition: 'background .15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>Settings</span>
      </div>

      <div style={{ flex: 1, maxWidth: 560, margin: '0 auto', padding: '24px 16px', width: '100%' }}>
        {/* Profile Section with Avatar Upload */}
        <div className="cr-card slide-up" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }} />
              ) : (
                <div className="avatar avatar-lg" style={{ background: getColor(user?.username) }}>
                  {(user?.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <button onClick={() => fileInputRef.current?.click()} disabled={avatarUploading}
                style={{ position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--white)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform .15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.username}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>{user?.email}</div>
            </div>
            <button className="btn-cr btn-ghost-cr" style={{ padding: '6px 14px', fontSize: '.85rem' }} onClick={() => { setEditUsername(user?.username || ''); setEditError(''); setShowEditProfile(true); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
          </div>
          {avatarUrl && (
            <button className="btn-cr btn-ghost-cr" style={{ width: '100%', fontSize: '.83rem', padding: '6px 12px' }} onClick={handleRemoveAvatar} disabled={avatarUploading}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              Remove Picture
            </button>
          )}
          {avatarUploading && <div style={{ textAlign: 'center', marginTop: 8, fontSize: '.85rem', color: 'var(--text-secondary)' }}>Uploading...</div>}
        </div>

        {/* Account */}
        <Section title="Account">
          <Row label="Username" value={user?.username || '-'} />
          <Row label="Email" value={user?.email || '-'} />
          <Row label="Friend Code" value={
            <span style={{ fontFamily: 'monospace', letterSpacing: 1, color: 'var(--primary)', fontWeight: 700 }}>{user?.uniqueCode || '-'}</span>
          } />
          <Row label="Status" value={
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Active</span>
          } />
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <Row label="Theme" value="Light" />
          <Row label="Notifications" value="Enabled" />
          <Row label="Language" value="English" />
        </Section>

        {/* Logout */}
        <button className="btn-cr btn-outline-cr" style={{ width: '100%', marginBottom: 12 }} onClick={logout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          Logout
        </button>

        {/* Delete Account */}
        <button className="btn-cr btn-danger-cr" style={{ width: '100%', marginBottom: 16 }} onClick={() => setShowDeleteConfirm(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
          Delete Account
        </button>

      </div>
      <Footer />
    </div>
  );
};

export default SettingsPage;
