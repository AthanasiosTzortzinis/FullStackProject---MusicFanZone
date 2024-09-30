import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isLoggedIn, handleLogout }) => {
  const username = localStorage.getItem('username'); 

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
      <ul style={{ listStyleType: 'none', display: 'flex', gap: '20px' }}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/playlists">Playlists</Link></li>
        <li><Link to="/forum">Forum</Link></li>
        {!isLoggedIn ? (
          <>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
          </>
        ) : (
          <li><button onClick={handleLogout}>Logout</button></li>
        )}
      </ul>

      {/* Show welcome message when user is logged in */}
      {isLoggedIn && username && (
        <div style={{ color: 'white', marginRight: '20px' }}>
          Welcome, {username}!
        </div>
      )}
    </nav>
  );
};

export default Navbar;
