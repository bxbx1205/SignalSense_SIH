import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [currentMode, setCurrentMode] = useState('Operator');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  };

  const toggleMode = () => {
    setCurrentMode(currentMode === 'Operator' ? 'Viewer' : 'Operator');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Left side - Logo */}
        <div className="navbar-left">
          <div className="logo-container">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="logo-text">
              <span className="brand-name">RailOptima</span>
              <span className="brand-subtitle">AI powered traffic management</span>
            </div>
          </div>
        </div>

        

        {/* Right side - Mode Toggle */}
        <div className="navbar-right">
          <div className="mode-toggle-container">
            <div className="mode-toggle" onClick={toggleMode}>
              <div className={`toggle-option ${currentMode === 'Operator' ? 'active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7C14.1 6.1 13.1 5.4 12 5.4S9.9 6.1 9 7L3 7V9H5V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V9H21Z"
                    fill="currentColor"
                  />
                </svg>
                <span>Operator</span>
              </div>
              <div className={`toggle-option ${currentMode === 'Viewer' ? 'active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12S9.24 7 12 7S17 9.24 17 12S14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z"
                    fill="currentColor"
                  />
                </svg>
                <span>Viewer</span>
              </div>
              <div className={`toggle-slider ${currentMode === 'Viewer' ? 'slide-right' : ''}`}></div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;