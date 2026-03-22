import React from 'react';
import './UI.css';

const Error = ({ message, id }) => {
  return (
    <div id={id} className="err">
      ⚠ {message}
    </div>
  );
};

export default Error;