import React, { useState, useEffect, useRef } from 'react'; 
import { FaEllipsisV } from 'react-icons/fa';
import '../Style/ThreeDotMenu.css'

const ThreeDotMenu = ({ onEdit, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null); 

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="three-dot-menu" ref={menuRef}>
            <FaEllipsisV onClick={toggleMenu} className="three-dot-icon" />
            {isMenuOpen && (
                <div className="menu-options">
                    <button onClick={onEdit} className="menu-option">Edit</button>
                    <button onClick={onDelete} className="menu-option">Delete</button>
                </div>
            )}
        </div>
    );
};

export default ThreeDotMenu;
