import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link for navigation
import axios from 'axios';  // Import axios for API requests
import '../Style/Login.css';

const Login = ({ setIsLoggedIn, redirectPath }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 5;
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateEmail(email) || !validatePassword(password)) {
            setMessage('Please enter a valid email and password!');
            setSuccess(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:4000/user/login', {
                email,
                password,
            });

            if (response.status === 200) {
                // Save the token and username
                localStorage.setItem('token', response.data.token); 
                localStorage.setItem('username', response.data.username); // Ensure username is stored
                setIsLoggedIn(true);
                setMessage("Login successful!");
                setSuccess(true);

                setTimeout(() => {
                    navigate(redirectPath); // Redirect to the page they wanted to access
                }, 2000);
            }
        } catch (error) {
            setMessage(error.response?.data?.msg || "Invalid credentials. Please try again.");
            setSuccess(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
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

            {/* Display messages */}
            {success && <p style={{ color: 'green' }}>Login successful! Redirecting...</p>}
            {(!success && message) && <p>{message}</p>} 
            
            {/* Registration Prompt */}
            <p className="registration-prompt">
            You don’t have an account yet? 
           <Link to="/register" className="register-link">
                Please Register.
               </Link>
       </p>
        </div>
    );
};

export default Login;
