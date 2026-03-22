import React from 'react';
import './UI.css';

const Divider = ({ text }) => {
  return (
    <div className="divider">
      <span>{text}</span>
    </div>
  );
};

export default Divider;