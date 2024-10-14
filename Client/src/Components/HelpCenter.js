import React from 'react';
import '../Style/HelpCenter.css'; 
const HelpCenter = () => {
  const fullEmail = "musicFanZone@gmail.com"; 

  return (
    <div className="help-center">
      <h1>Help Center</h1>
      <p>If you need any information or assistance, or if you encounter any issues, please don’t hesitate to reach out to us at:</p>
      <p className="email">
        {/* Split the email into individual letters */}
        {fullEmail.split("").map((letter, index) => (
          <span
            key={index}
            className="letter"
            style={{ "--index": index }} 
          >
            {letter}
          </span>
        ))}
      </p>
    </div>
  );
};

export default HelpCenter;
