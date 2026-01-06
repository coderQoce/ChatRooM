import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Toast, ToastContainer } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(user?.uniqueCode || '');
      setToastMessage('Code copied to clipboard!');
      setShowToast(true);
    } catch (err) {
      setToastMessage('Failed to copy code');
      setShowToast(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Just now';
    }
  };

  // Handle mouse enter/leave events with better performance
  const handleMouseEnter = (e, scale = 1.04, shadow = true) => {
    e.currentTarget.style.transform = `scale(${scale}) translateY(-4px)`;
    if (shadow) {
      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
    }
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'scale(1) translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)';
  };

  const handleButtonMouseEnter = (e, shadowColor) => {
    e.target.style.transform = 'translateY(-2px)';
    if (shadowColor) {
      e.target.style.boxShadow = `0 6px 20px ${shadowColor}`;
    }
  };

  const handleButtonMouseLeave = (e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <>
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide
          bg="success"
        >
          <Toast.Header closeButton={false}>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Container 
        fluid 
        className="min-vh-100 p-0 m-0"
        style={{
          background: '#f8fafc',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}
      >
        {/* Navigation Header */}
        <div 
          className="py-3 px-4 shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
          }}
        >
          <Container fluid>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <svg 
                    width="32" 
                    height="32" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h2 className="text-white mb-0 fw-bold">ChatRoom</h2>
              </div>
              <div className="d-flex align-items-center">
                <div className="text-white me-4 d-none d-md-block">
                  <span className="opacity-75 me-2">Welcome,</span>
                  <span className="fw-semibold">{user?.username || 'User'}!</span>
                </div>
                <Button 
                  variant="outline-light" 
                  onClick={logout}
                  className="rounded-pill px-3 px-md-4"
                  style={{
                    borderWidth: '2px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => handleButtonMouseEnter(e)}
                  onMouseLeave={handleButtonMouseLeave}
                >
                  Logout
                </Button>
              </div>
            </div>
          </Container>
        </div>

        {/* Main Content */}
        <Container className="py-4">
          <Row className="g-4">
            {/* Left Column */}
            <Col lg={4}>
              {/* Profile Card */}
              <Card 
                className="border-0 shadow-lg rounded-4 overflow-hidden"
                style={{ 
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
                }}
                onMouseEnter={(e) => handleMouseEnter(e, 1.02)}
                onMouseLeave={handleMouseLeave}
              >
                <div 
                  className="py-4 text-center"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}
                >
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: '100px',
                      height: '100px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                      fontSize: '2.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <h4 className="fw-bold mb-1">{user?.username || 'User'}</h4>
                  <p className="mb-0 opacity-75">{user?.email || 'No email provided'}</p>
                </div>
                
                <Card.Body className="p-4">
                  <h5 className="fw-semibold mb-4" style={{ color: '#4a5568' }}>
                    Your Profile
                  </h5>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold small mb-2" style={{ color: '#718096' }}>
                      Unique Friend Code
                    </label>
                    <div className="position-relative">
                      <div 
                        className="rounded-3 p-3 text-center"
                        style={{
                          background: 'linear-gradient(135deg, #f6f9fc 0%, #edf2f7 100%)',
                          border: '1px solid #e2e8f0',
                          fontFamily: 'monospace',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#2d3748',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          userSelect: 'none'
                        }}
                        onClick={handleCopyCode}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #f6f9fc 0%, #edf2f7 100%)';
                        }}
                      >
                        {user?.uniqueCode || 'NOCODE'}
                      </div>
                      <Button
                        variant="link"
                        className="position-absolute p-0"
                        style={{
                          top: '50%',
                          right: '12px',
                          transform: 'translateY(-50%)',
                          color: '#667eea',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={handleCopyCode}
                        title="Copy to clipboard"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </Button>
                    </div>
                    <small className="text-muted d-block mt-2" style={{ fontSize: '0.8rem' }}>
                      Click the code or icon to copy
                    </small>
                  </div>

                  <div className="mt-4 pt-3 border-top">
                    <h6 className="fw-semibold mb-3" style={{ color: '#4a5568' }}>
                      Account Details
                    </h6>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span style={{ color: '#718096', fontSize: '0.9rem' }}>Member Since</span>
                      <span className="fw-medium" style={{ color: '#4a5568' }}>
                        {formatDate(user?.createdAt)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ color: '#718096', fontSize: '0.9rem' }}>Status</span>
                      <span 
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                          color: 'white',
                          fontSize: '0.8rem'
                        }}
                      >
                        Active
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Quick Actions Card */}
              <Card 
                className="border-0 shadow-lg rounded-4 mt-4"
                style={{ 
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
                }}
                onMouseEnter={(e) => handleMouseEnter(e, 1.02)}
                onMouseLeave={handleMouseLeave}
              >
                <Card.Body className="p-4">
                  <h5 className="fw-semibold mb-4" style={{ color: '#4a5568' }}>
                    Quick Actions
                  </h5>
                  <div className="d-grid gap-3">
                    <Button 
                      variant="primary" 
                      className="py-3 rounded-3 fw-semibold border-0"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => handleButtonMouseEnter(e, 'rgba(102, 126, 234, 0.4)')}
                      onMouseLeave={handleButtonMouseLeave}
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        className="me-2" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      Find Friends
                    </Button>
                    
                    <Button 
                      variant="outline-primary" 
                      className="py-3 rounded-3 fw-semibold"
                      style={{
                        borderColor: '#667eea',
                        color: '#667eea',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        handleButtonMouseEnter(e);
                        e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        handleButtonMouseLeave(e);
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        className="me-2" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      View All Friends
                    </Button>
                    
                    <Button 
                      variant="outline-secondary" 
                      className="py-3 rounded-3 fw-semibold"
                      style={{
                        borderColor: '#e2e8f0',
                        color: '#4a5568',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        handleButtonMouseEnter(e);
                        e.target.style.backgroundColor = '#f7fafc';
                      }}
                      onMouseLeave={(e) => {
                        handleButtonMouseLeave(e);
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        className="me-2" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      Settings
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Right Column */}
            <Col lg={8}>
              {/* Friends & Chats Card */}
              <Card 
                className="border-0 shadow-lg rounded-4 h-100"
                style={{ 
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
                }}
                onMouseEnter={(e) => handleMouseEnter(e, 1.02)}
                onMouseLeave={handleMouseLeave}
              >
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-semibold mb-0" style={{ color: '#4a5568' }}>
                      Friends & Chats
                    </h5>
                    <Button 
                      variant="success"
                      className="rounded-pill px-3 px-md-4 fw-semibold"
                      style={{
                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                        border: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => handleButtonMouseEnter(e, 'rgba(72, 187, 120, 0.4)')}
                      onMouseLeave={handleButtonMouseLeave}
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        className="me-2" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      New Chat
                    </Button>
                  </div>
                  
                  <div 
                    className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-4 p-md-5 rounded-4"
                    style={{
                      background: 'linear-gradient(135deg, #f6f9fc 0%, #edf2f7 100%)',
                      border: '2px dashed #e2e8f0',
                      minHeight: '300px'
                    }}
                  >
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center mb-4"
                      style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <svg 
                        width="40" 
                        height="40" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="2"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <h5 className="fw-semibold mb-3 text-center" style={{ color: '#4a5568' }}>
                      No Friends Yet
                    </h5>
                    <p className="text-center mb-4" style={{ color: '#718096', maxWidth: '400px' }}>
                      Start by adding friends using your unique code or search for friends using their codes
                    </p>
                    <Button 
                      variant="primary"
                      className="px-4 py-2 rounded-3 fw-semibold"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => handleButtonMouseEnter(e, 'rgba(102, 126, 234, 0.4)')}
                      onMouseLeave={handleButtonMouseLeave}
                    >
                      Add Your First Friend
                    </Button>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-4 pt-3 border-top">
                    <h6 className="fw-semibold mb-3" style={{ color: '#4a5568' }}>
                      Quick Stats
                    </h6>
                    <Row>
                      {[
                        { label: 'Friends', value: 0 },
                        { label: 'Chats', value: 0 },
                        { label: 'Groups', value: 0 },
                        { label: 'Online', value: 0 }
                      ].map((stat, index) => (
                        <Col xs={6} md={3} className="text-center mb-3" key={index}>
                          <div 
                            className="p-3 rounded-3 h-100"
                            style={{ 
                              background: '#f7fafc',
                              transition: 'all 0.2s ease',
                              cursor: 'default'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#edf2f7';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f7fafc';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <div className="fw-bold fs-4" style={{ color: '#667eea' }}>
                              {stat.value}
                            </div>
                            <div className="small" style={{ color: '#718096' }}>
                              {stat.label}
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Card.Body>
              </Card>

              {/* How It Works Card */}
              <Card 
                className="border-0 shadow-lg rounded-4 mt-4"
                style={{ 
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
                }}
                onMouseEnter={(e) => handleMouseEnter(e, 1.02, false)}
                onMouseLeave={handleMouseLeave}
              >
                <Card.Body className="p-4">
                  <h5 className="fw-semibold mb-4" style={{ color: '#4a5568' }}>
                    How It Works
                  </h5>
                  <Row>
                    {[
                      { icon: '🔗', title: 'Share Code', desc: 'Share your unique code with friends' },
                      { icon: '🔍', title: 'Find Friends', desc: 'Search for friends using their unique code' },
                      { icon: '📨', title: 'Send Requests', desc: 'Send friend requests to connect' },
                      { icon: '💬', title: 'Start Chatting', desc: 'Begin conversations once they accept' },
                      { icon: '📞', title: 'Make Calls', desc: 'Audio/video call your friends anytime' },
                      { icon: '⚙️', title: 'Manage Settings', desc: 'Customize your chat preferences' }
                    ].map((step, index) => (
                      <Col xs={12} md={6} lg={4} key={index} className="mb-3">
                        <div 
                          className="p-3 rounded-3 h-100"
                          style={{ 
                            background: '#f7fafc', 
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#edf2f7';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f7fafc';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div className="d-flex align-items-center mb-2">
                            <div className="me-2 fs-4">{step.icon}</div>
                            <h6 className="fw-semibold mb-0" style={{ color: '#4a5568' }}>
                              {step.title}
                            </h6>
                          </div>
                          <p className="mb-0 small" style={{ color: '#718096' }}>
                            {step.desc}
                          </p>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </Container>
    </>
  );
};

export default Dashboard;