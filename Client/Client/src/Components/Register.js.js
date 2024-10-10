import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import '../Style/Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false); 
  const navigate = useNavigate(); 

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{5,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email) || !validatePassword(password) || !username) {
      setMessage('Please enter a valid username, email, and password!');
      setSuccess(false); 
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/user/register', {
        username,
        email,
        password,
      });

      setMessage(response.data.msg);
      setSuccess(true); 

      if (response.status === 201) {
        setUsername('');
        setEmail('');
        setPassword('');

        setTimeout(() => {
          navigate('/login');
        }, 2000); 
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(error.response?.data.msg || 'Registration failed');
      setSuccess(false); 
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p style={{ color: validateEmail(email) ? 'green' : 'red' }}>
            {validateEmail(email) ? 'Valid email address' : 'Please enter a valid email address'}
          </p>
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
          <ul className="password-requirements">
            <li style={{ color: password.length >= 5 ? 'green' : 'red' }}>
              At least 5 characters
            </li>
            <li style={{ color: /[A-Z]/.test(password) ? 'green' : 'red' }}>
              At least one capital letter
            </li>
            <li style={{ color: /\d/.test(password) ? 'green' : 'red' }}>
              At least one number
            </li>
          </ul>
        </div>
        <button type="submit">Register</button>
      </form>
      
      {/* Only show the message when it's a success */}
      {success && <p style={{ color: 'green' }}>User created successfully! Redirecting to login...</p>}
      {(!success && message) && <p>{message}</p>} {/* Show error messages if not successful */}

    </div>
  );
};

export default Register;
