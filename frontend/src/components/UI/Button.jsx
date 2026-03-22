import React from 'react';
import './UI.css';

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  fullWidth = false,
  variant = 'primary',
  type = 'button',
  style = {}
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'terra':
        return 'btn-terra';
      default:
        return 'btn-primary';
    }
  };

  return (
    <button
      type={type}
      className={`btn ${getVariantClass()} ${fullWidth ? 'btn-full' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
    >
      {loading && <span className="spinner"></span>}
      {children}
    </button>
  );
};

export default Button;