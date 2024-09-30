import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setIsLoggedIn, loginMessage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:4000/user/login', { email, password });

      if (response.data.status) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username); 
        setIsLoggedIn(true); 
        setErrorMessage('');
        navigate('/playlists'); 
      } else {
        setErrorMessage(response.data.msg);
      }
    } catch (error) {
      setErrorMessage('Login failed. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {/* Display the login message if it exists */}
      {loginMessage && (
        <p style={{ color: 'red', fontSize: 'smaller' }}>{loginMessage}</p>
      )}

      {location.state?.message && (
        <p className="login-message" style={{ color: 'red' }}>{location.state.message}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default Login;
