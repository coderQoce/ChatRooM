import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password
      });
    } catch (err) {
      setError('Registration failed. Please try again.');
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
        <Col xs={12} sm={10} md={8} lg={6} xl={5} className="p-0">
          <Card 
            className="border-0 shadow-lg mx-auto"
            style={{ 
              maxWidth: '550px',
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
              </div>
              <h3 className="fw-bold mb-2">Create Account</h3>
              <p className="mb-0 opacity-75" style={{ fontSize: '0.95rem' }}>
                Join our community and get started
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
                <Row>
                  {/* Email Field - Full Width */}
                  <Col xs={12}>
                    <Form.Group className="mb-4">
                      <Form.Label 
                        className="form-label fw-semibold mb-2"
                        style={{ fontSize: '0.875rem', color: '#4a5568' }}
                      >
                        Email Address
                      </Form.Label>
                      <div className="position-relative">
                        <div 
                          className="position-absolute d-flex align-items-center"
                          style={{
                            top: '0',
                            left: '0',
                            height: '100%',
                            paddingLeft: '16px',
                            pointerEvents: 'none',
                            zIndex: 4
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
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className="py-3 px-4 rounded-3 border-1"
                          style={{
                            borderColor: '#e2e8f0',
                            backgroundColor: '#f8fafc',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease',
                            paddingLeft: '45px'
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
                      </div>
                    </Form.Group>
                  </Col>

                  {/* Username - Full Width */}
                  <Col xs={12}>
                    <Form.Group className="mb-4">
                      <Form.Label 
                        className="form-label fw-semibold mb-2"
                        style={{ fontSize: '0.875rem', color: '#4a5568' }}
                      >
                        Username
                      </Form.Label>
                      <div className="position-relative">
                        <div 
                          className="position-absolute d-flex align-items-center"
                          style={{
                            top: '0',
                            left: '0',
                            height: '100%',
                            paddingLeft: '16px',
                            pointerEvents: 'none',
                            zIndex: 4
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
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <Form.Control
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Choose a username"
                          className="py-3 px-4 rounded-3 border-1"
                          style={{
                            borderColor: '#e2e8f0',
                            backgroundColor: '#f8fafc',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease',
                            paddingLeft: '45px'
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
                      </div>
                      <div className="mt-2">
                        <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                          This will be your public display name
                        </small>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Password Fields Side by Side */}
                <Row className="mb-4">
                  <Col xs={12} md={6} className="mb-3 mb-md-0">
                    <Form.Group>
                      <Form.Label 
                        className="form-label fw-semibold mb-2"
                        style={{ fontSize: '0.875rem', color: '#4a5568' }}
                      >
                        Password
                      </Form.Label>
                      <div className="position-relative">
                        <div 
                          className="position-absolute d-flex align-items-center"
                          style={{
                            top: '0',
                            left: '0',
                            height: '100%',
                            paddingLeft: '16px',
                            pointerEvents: 'none',
                            zIndex: 4
                          }}
                        >
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="#a0aec0" 
                            strokeWidth="2"
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Min 6 characters"
                          className="py-3 px-4 pe-5 rounded-3 border-1"
                          style={{
                            borderColor: '#e2e8f0',
                            backgroundColor: '#f8fafc',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease',
                            paddingLeft: '45px'
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
                        <Button
                          variant="link"
                          className="position-absolute p-0"
                          style={{
                            top: '50%',
                            right: '16px',
                            transform: 'translateY(-50%)',
                            color: '#a0aec0',
                            zIndex: 5
                          }}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label 
                        className="form-label fw-semibold mb-2"
                        style={{ fontSize: '0.875rem', color: '#4a5568' }}
                      >
                        Confirm Password
                      </Form.Label>
                      <div className="position-relative">
                        <div 
                          className="position-absolute d-flex align-items-center"
                          style={{
                            top: '0',
                            left: '0',
                            height: '100%',
                            paddingLeft: '16px',
                            pointerEvents: 'none',
                            zIndex: 4
                          }}
                        >
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="#a0aec0" 
                            strokeWidth="2"
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                        <Form.Control
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Re-enter password"
                          className="py-3 px-4 pe-5 rounded-3 border-1"
                          style={{
                            borderColor: '#e2e8f0',
                            backgroundColor: '#f8fafc',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s ease',
                            paddingLeft: '45px'
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
                        <Button
                          variant="link"
                          className="position-absolute p-0"
                          style={{
                            top: '50%',
                            right: '16px',
                            transform: 'translateY(-50%)',
                            color: '#a0aec0',
                            zIndex: 5
                          }}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Password Requirements */}
                <div className="mb-4 p-3 rounded-3" style={{ backgroundColor: '#f7fafc', border: '1px solid #e2e8f0' }}>
                  <Row>
                    <Col xs={12} md={6} className="mb-2 mb-md-0">
                      <div className="d-flex align-items-center">
                        <div 
                          className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${formData.password.length >= 6 ? 'bg-success' : 'bg-secondary'}`}
                          style={{ width: '20px', height: '20px', flexShrink: 0 }}
                        >
                          <svg 
                            width="12" 
                            height="12" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="white" 
                            strokeWidth="3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span 
                          className={`small ${formData.password.length >= 6 ? 'text-success fw-medium' : 'text-muted'}`}
                        >
                          At least 6 characters
                        </span>
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className="d-flex align-items-center">
                        <div 
                          className={`rounded-circle d-flex align-items-center justify-content-center me-2 ${formData.password === formData.confirmPassword && formData.password ? 'bg-success' : 'bg-secondary'}`}
                          style={{ width: '20px', height: '20px', flexShrink: 0 }}
                        >
                          <svg 
                            width="12" 
                            height="12" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="white" 
                            strokeWidth="3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span 
                          className={`small ${formData.password === formData.confirmPassword && formData.password ? 'text-success fw-medium' : 'text-muted'}`}
                        >
                          Passwords match
                        </span>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Register Button */}
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
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Form>

              {/* Divider with Login Option */}
              <div className="d-flex align-items-center my-4">
                <hr className="flex-grow-1" style={{ borderColor: '#e2e8f0' }} />
                <span 
                  className="px-3 text-muted"
                  style={{ fontSize: '0.875rem' }}
                >
                  Already have an account?
                </span>
                <hr className="flex-grow-1" style={{ borderColor: '#e2e8f0' }} />
              </div>

              {/* Login Link Button */}
              <div className="text-center">
                <Button 
                  variant="outline-primary" 
                  as={Link}
                  to="/login"
                  className="w-100 py-2 rounded-3"
                  style={{
                    borderColor: '#667eea',
                    color: '#667eea',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg 
                    width="18" 
                    height="18" 
                    className="me-2" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Sign in to existing account
                </Button>
              </div>

              {/* Terms and Conditions */}
              <Row className="mt-4">
                <Col xs={12}>
                  <p className="mb-0 text-center" style={{ fontSize: '0.8rem', color: '#718096' }}>
                    By creating an account, you agree to our{' '}
                    <a 
                      href="/terms" 
                      className="text-decoration-none fw-medium"
                      style={{ color: '#667eea' }}
                    >
                      Terms
                    </a>{' '}
                    and{' '}
                    <a 
                      href="/privacy" 
                      className="text-decoration-none fw-medium"
                      style={{ color: '#667eea' }}
                    >
                      Privacy
                    </a>
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Footer */}
          <div className="text-center mt-4">
            <p 
              className="text-white opacity-75 mb-0"
              style={{ fontSize: '0.85rem' }}
            >
              Need help? <a href="/support" className="text-white text-decoration-underline">Contact Support</a>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;