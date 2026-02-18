import React from 'react';

const Footer = () => (
  <footer style={{
    background: 'var(--white)',
    borderTop: '1px solid var(--border)',
    padding: '20px 24px',
    textAlign: 'center',
    flexShrink: 0
  }}>
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        <span style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--text)' }}>ChatRooM</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 10 }}>
        <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Privacy</span>
        <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Terms</span>
        <span style={{ fontSize: '.8rem', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>Help</span>
      </div>
      <p style={{ margin: 0, fontSize: '.75rem', color: '#b0b5c0' }}>
        &copy; {new Date().getFullYear()} ChatRooM &middot; Built by <span style={{ color: 'var(--primary)', fontWeight: 600 }}>OnyxCodes</span>
      </p>
    </div>
  </footer>
);

export default Footer;
