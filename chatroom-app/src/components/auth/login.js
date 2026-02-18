import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Footer from '../common/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    try { await login(email, password); }
    catch { setError('Invalid email or password.'); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <div className="slide-up" style={{ width: '100%', maxWidth: 420 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            <h2 style={{ margin: 0, fontWeight: 800, color: '#fff', fontSize: '1.6rem', letterSpacing: '-0.02em' }}>Welcome back</h2>
            <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '.95rem' }}>Sign in to ChatRooM</p>
          </div>

          {/* Card */}
          <div className="glass-card" style={{ padding: '36px 32px' }}>
            {error && <div className="alert-cr alert-cr-danger" style={{ marginBottom: 20 }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '.85rem', color: 'var(--text-secondary)' }}>Email</label>
                <input className="input-cr" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: '.85rem', color: 'var(--text-secondary)' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input-cr" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" style={{ paddingRight: 44 }} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, transition: 'color .15s' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      {showPassword && <line x1="1" y1="1" x2="23" y2="23" />}
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-cr btn-primary-cr" style={{ width: '100%', padding: '14px 24px', fontSize: '.95rem', borderRadius: 'var(--radius-md)' }}>
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite', display: 'inline-block' }} />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 28, color: 'var(--text-secondary)', fontSize: '.9rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', transition: 'color .15s' }}>Create one</Link>
            </div>
          </div>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
      <Footer transparent />
    </div>
  );
};

export default Login;