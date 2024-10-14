import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Playlists from './Components/Playlists';
import Forum from './Components/Forum';
import Register from './Components/Register.js';
import Login from './Components/Login';
import Home from './Components/Home';
import HelpCenter from './Components/HelpCenter'; 
import '../src/Style/App.css';

const LoginRequiredMessage = ({ redirectPath, additionalMessage, setRedirectPath }) => (
  <div className="login-required-message">
    {additionalMessage && (
      <p className="additional-message">{additionalMessage}</p>
    )}
    <p className="login-prompt">You need to log in to view this content.</p>
    <Link 
      to="/login" 
      className="login-required-link" 
      onClick={() => setRedirectPath(redirectPath)}
    >
      Go to Login
    </Link>
  </div>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [redirectPath, setRedirectPath] = useState('/'); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); 
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
              <LoginRequiredMessage 
                redirectPath="/playlists" 
                additionalMessage="Unlock the full potential of your music experience in the Music Fan Zone! Here, you have the power to curate your own unique playlists tailored to your tastes. Discover new artists, dive deep into your favorite genres, and enjoy seamless access to music videos through integrated YouTube links. Whether you're throwing a party, winding down after a long day, or simply exploring new sounds, your personalized playlist is just a click away!" 
                setRedirectPath={setRedirectPath} 
              />
            )
          } 
        />
        <Route 
          path="/forum" 
          element={
            isLoggedIn ? (
              <Forum />
            ) : (
              <LoginRequiredMessage 
                redirectPath="/forum" 
                additionalMessage="Join the vibrant Music Fan Zone community! Our interactive forum is the perfect space for music lovers to connect, share insights, and discuss everything from the latest hits to hidden gems. Participate in lively debates, share your thoughts, and find recommendations from fellow enthusiasts. Together, we can celebrate our love for music and explore diverse opinions on artists, genres, and trends. Engage, inspire, and be inspired!" 
                setRedirectPath={setRedirectPath} 
              />
            )
          } 
        />
        <Route path="/register" element={<Register />} />

        {/* Add Help Center Route */}
        <Route path="/help" element={<HelpCenter />} />
      </Routes>

      {/* Display Login Message */}
      {loginMessage && (
        <div className="login-message">
          {loginMessage}
        </div>
      )}
    </Router>
  );
}

export default App;
