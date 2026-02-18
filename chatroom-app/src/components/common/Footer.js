import React from 'react';

const FooterLink = ({ children }) => (
  <span style={{ fontSize: '.8rem', color: 'rgba(165,163,200,.7)', cursor: 'pointer', transition: 'color .2s', letterSpacing: '.02em' }}
    onMouseEnter={e => e.currentTarget.style.color = '#a5b4fc'}
    onMouseLeave={e => e.currentTarget.style.color = 'rgba(165,163,200,.7)'}>
    {children}
  </span>
);

const Footer = () => (
  <footer style={{
    background: 'rgba(255,255,255,.03)',
    backdropFilter: 'blur(16px) saturate(1.2)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
    borderTop: '1px solid rgba(255,255,255,.07)',
    padding: '28px 24px 22px',
    textAlign: 'center',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Subtle top glow */}
    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 200, height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,.4), transparent)' }} />

    <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: '.95rem', background: 'linear-gradient(135deg, #c7d2fe, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ChatRooM</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
        {['Privacy', 'Terms', 'Help', 'Contact'].map((item, i) => (
          <React.Fragment key={item}>
            {i > 0 && <span style={{ color: 'rgba(255,255,255,.1)', fontSize: '.8rem' }}>&middot;</span>}
            <FooterLink>{item}</FooterLink>
          </React.Fragment>
        ))}
      </div>

      <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent)', margin: '0 auto 12px' }} />

      <p style={{ margin: 0, fontSize: '.74rem', color: 'rgba(165,163,200,.45)', letterSpacing: '.02em' }}>
        &copy; {new Date().getFullYear()} ChatRooM &middot; Built with
        <span style={{ display: 'inline-block', margin: '0 3px', animation: 'pulse 2s ease-in-out infinite' }}> &#10084;&#65039; </span>
        by <span style={{ background: 'linear-gradient(135deg, #a5b4fc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 600 }}>OnyxCodes</span>
      </p>
    </div>
  </footer>
);

export default Footer;
