import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Footer from '../common/Footer';

const Register = () => {
  const [formData, setFormData] = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) { setError('Please fill in all fields'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    try { await register(formData); }
    catch { setError('Registration failed. Please try again.'); }
  };

  const passOk = formData.password.length >= 6;
  const matchOk = formData.password && formData.password === formData.confirmPassword;

  const Check = ({ ok, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.85rem', color: ok ? 'var(--primary)' : 'var(--text-secondary)' }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: ok ? 'var(--primary)' : '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
      </div>
      {label}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="slide-up" style={{ width: '100%', maxWidth: 440 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <h2 style={{ margin: 0, fontWeight: 700, color: 'var(--text)' }}>Create account</h2>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '.95rem' }}>Join ChatRooM today</p>
          </div>

          {/* Card */}
          <div className="cr-card" style={{ padding: '32px 28px' }}>
            {error && <div className="alert-cr alert-cr-danger" style={{ marginBottom: 20 }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '.85rem', color: 'var(--text-secondary)' }}>Email</label>
                <input className="input-cr" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '.85rem', color: 'var(--text-secondary)' }}>Username</label>
                <input className="input-cr" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" required />
              </div>

              <div className="register-pw-grid">
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '.85rem', color: 'var(--text-secondary)' }}>Password</label>
                  <input className="input-cr" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 chars" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '.85rem', color: 'var(--text-secondary)' }}>Confirm</label>
                  <input className="input-cr" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter" required />
                </div>
              </div>

              {/* Requirements */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 24, padding: '10px 14px', background: '#f8f9fa', borderRadius: 'var(--radius-sm)' }}>
                <Check ok={passOk} label="6+ characters" />
                <Check ok={matchOk} label="Passwords match" />
              </div>

              <button type="submit" disabled={loading} className="btn-cr btn-primary-cr" style={{ width: '100%', padding: '13px 24px', fontSize: '.95rem' }}>
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite', display: 'inline-block' }} />
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '.9rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </div>
          </div>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;