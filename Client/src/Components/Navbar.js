import React from 'react';
import { Link } from 'react-router-dom';
import {jwtDecode} from "jwt-decode";

const Navbar = ({ isLoggedIn, handleLogout }) => {
  const token = localStorage.getItem("token");
  let decodedToken
  if(token){
    decodedToken= jwtDecode(token);
  }
  
  
  let username = "";

  // Decode token and extract username if token exists
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      username = decodedToken.username; // Extract username from token
    } catch (error) {
      console.error("Token decoding error:", error);
    }
  }

  return (
    <div>
      {/* Show welcome message when user is logged in */}
      {isLoggedIn && username && (
        <h3 style={{ textAlign: 'left', color: 'black', margin: '10px' }}>
          Welcome, {decodedToken && decodedToken.username}!
        </h3>
      )}

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
      </nav>
    </div>
  );
};

export default Navbar;
