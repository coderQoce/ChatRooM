import React from 'react';

const Footer = ({ transparent }) => (
  <footer style={{
    background: transparent ? 'transparent' : 'var(--white)',
    borderTop: transparent ? 'none' : '1px solid var(--border)',
    padding: '20px 24px',
    textAlign: 'center',
    flexShrink: 0,
    position: 'relative',
    zIndex: 1
  }}>
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={transparent ? 'rgba(255,255,255,.5)' : 'var(--primary)'} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        <span style={{ fontWeight: 700, fontSize: '.85rem', color: transparent ? 'rgba(255,255,255,.6)' : 'var(--text-secondary)' }}>ChatRooM</span>
      </div>
      <p style={{ margin: 0, fontSize: '.75rem', color: transparent ? 'rgba(255,255,255,.4)' : '#b0b5c0' }}>
        &copy; {new Date().getFullYear()} ChatRooM &middot; Built by <span style={{ color: transparent ? 'rgba(255,255,255,.6)' : 'var(--primary)', fontWeight: 600 }}>OnyxCodes</span>
      </p>
    </div>
  </footer>
);

export default Footer;
