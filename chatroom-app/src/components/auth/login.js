import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    }
  };

  return (
    <Container 
      fluid
      className="d-flex align-items-center justify-content-center min-vh-100 p-0 m-0"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      <Row className="w-100 justify-content-center m-0">
        <Col xs={12} sm={10} md={8} lg={6} xl={4} className="p-0">
          <Card 
            className="border-0 shadow-lg mx-auto"
            style={{ 
              maxWidth: '420px',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            {/* Card Header with Gradient */}
            <div 
              className="py-4 px-4 text-center"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <div className="mb-3">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <svg 
                    width="28" 
                    height="28" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ color: 'white' }}
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
              <h3 className="fw-bold mb-2">Welcome Back</h3>
              <p className="mb-0 opacity-75" style={{ fontSize: '0.95rem' }}>
                Sign in to continue to your account
              </p>
            </div>

            {/* Card Body */}
            <Card.Body className="p-4 p-md-5">
              {error && (
                <Alert 
                  variant="danger" 
                  className="rounded-3 border-0 mb-4"
                  style={{
                    backgroundColor: '#fff5f5',
                    borderLeft: '4px solid #e53e3e',
                    fontSize: '0.875rem'
                  }}
                >
                  <div className="d-flex align-items-center">
                    <svg 
                      width="18" 
                      height="18" 
                      className="me-2" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#e53e3e" 
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Email Field */}
                <Form.Group className="mb-4">
                  <Form.Label 
                    className="form-label fw-semibold mb-2"
                    style={{ fontSize: '0.875rem', color: '#4a5568' }}
                  >
                    Email Address
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="py-3 px-4 rounded-3 border-1"
                      style={{
                        borderColor: '#e2e8f0',
                        backgroundColor: '#f8fafc',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.backgroundColor = 'white';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.backgroundColor = '#f8fafc';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                    <div 
                      className="position-absolute"
                      style={{
                        top: '50%',
                        left: '16px',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                      }}
                    >
                      <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="#a0aec0" 
                        strokeWidth="2"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                  </div>
                </Form.Group>

                {/* Password Field */}
                <Form.Group className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label 
                      className="form-label fw-semibold mb-0"
                      style={{ fontSize: '0.875rem', color: '#4a5568' }}
                    >
                      Password
                    </Form.Label>
                    <Link 
                      to="/forgot-password" 
                      className="text-decoration-none"
                      style={{ 
                        fontSize: '0.8rem', 
                        color: '#667eea',
                        fontWeight: '500'
                      }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="py-3 px-4 pe-5 rounded-3 border-1"
                      style={{
                        borderColor: '#e2e8f0',
                        backgroundColor: '#f8fafc',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.backgroundColor = 'white';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.backgroundColor = '#f8fafc';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                    <div 
                      className="position-absolute"
                      style={{
                        top: '50%',
                        left: '16px',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                      }}
                    >
                      <svg 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="#a0aec0" 
                        strokeWidth="2"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <Button
                      variant="link"
                      className="position-absolute p-0"
                      style={{
                        top: '50%',
                        right: '16px',
                        transform: 'translateY(-50%)',
                        color: '#a0aec0'
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </Button>
                  </div>
                </Form.Group>

                {/* Login Button */}
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-3 rounded-3 fw-semibold border-0 mb-4"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '1rem',
                    letterSpacing: '0.3px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 14px 0 rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 14px 0 rgba(102, 126, 234, 0.4)';
                  }}
                >
                  {loading ? (
                    <>
                      <span 
                        className="spinner-border spinner-border-sm me-2" 
                        role="status" 
                        aria-hidden="true"
                        style={{ width: '1rem', height: '1rem' }}
                      ></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign in to your account'
                  )}
                </Button>
              </Form>



              {/* Sign Up Link */}
              <div className="text-center pt-3 border-top" style={{ borderColor: '#e2e8f0' }}>
                <p className="mb-0" style={{ fontSize: '0.95rem', color: '#718096' }}>
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="fw-semibold text-decoration-none"
                    style={{ color: '#667eea' }}
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Footer */}
          <div className="text-center mt-4">
            <p 
              className="text-white opacity-75 mb-0"
              style={{ fontSize: '0.85rem' }}
            >
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;