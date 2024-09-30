import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Playlists from './Components/Playlists';
import Forum from './Components/Forum';
import Register from './Components/Register.js';
import Login from './Components/Login';
import Home from './Components/Home';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route 
          path="/playlists" 
          element={isLoggedIn ? <Playlists /> : <Login setIsLoggedIn={setIsLoggedIn} loginMessage="Login is required to check the content of Playlists." />} 
        />
        <Route 
          path="/forum" 
          element={isLoggedIn ? <Forum /> : <Login setIsLoggedIn={setIsLoggedIn} loginMessage="Login is required to check the content of the Forum." />} 
        />
      </Routes>
    </Router>
  );
}

export default App;

