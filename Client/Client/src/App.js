import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Playlists from './Components/Playlists';
import Forum from './Components/Forum';
import Register from './Components/Register.js';
import Login from './Components/Login';
import Home from './Components/Home';
import '../src/Style/App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [redirectPath, setRedirectPath] = useState('/'); // Default redirect path

  useEffect(() => {
    // Check for a token in localStorage to set login state
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Update isLoggedIn based on token presence
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setLoginMessage("You have logged out successfully.");

    setTimeout(() => {
      setLoginMessage("");
    }, 5000); 
  };

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route 
          path="/login" 
          element={<Login setIsLoggedIn={setIsLoggedIn} setLoginMessage={setLoginMessage} redirectPath={redirectPath} />} 
        />
        <Route 
  path="/playlists" 
  element={
    isLoggedIn ? (
      <Playlists />
    ) : (
      <div className="login-required-message">
        <p>You need to log in to view Playlists.</p>
        <Link to="/login" className="login-required-link" onClick={() => setRedirectPath('/playlists')}>Go to Login</Link>
      </div>
    )
  } 
/>
<Route 
  path="/forum" 
  element={
    isLoggedIn ? (
      <Forum />
    ) : (
      <div className="login-required-message">
        <p>You need to log in to view the Forum.</p>
        <Link to="/login" className="login-required-link" onClick={() => setRedirectPath('/forum')}>Go to Login</Link>
      </div>
    )
  } 
/>

        <Route path="/register" element={<Register />} />
      </Routes>

      {/* Display Login Message */}
      {loginMessage && <div className="login-message">{loginMessage}</div>}
    </Router>
  );
}

export default App;
