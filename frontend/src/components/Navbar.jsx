import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout/Layout.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleNav = () => setIsOpen(!isOpen);
  const closeNav = () => setIsOpen(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav>
      <Link to="/" className="nav-brand" onClick={closeNav}>
        <span>✦</span> Dermyx AI
      </Link>
      
      <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
        <li>
          <Link to="/" className={isActive('/')} onClick={closeNav}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/detect-disease" className={isActive('/detect-disease')} onClick={closeNav}>
            Disease
          </Link>
        </li>
      
        <li>
          <Link to="/symptom-checker" className={isActive('/symptom-checker')} onClick={closeNav}>
            Symptoms
          </Link>
        </li>
        <li>
          <Link to="/skin-tone" className={isActive('/skin-tone')} onClick={closeNav}>
            Skin Tone
          </Link>
        </li>
        <li>
          <Link to="/product-analysis" className={isActive('/product-analysis')} onClick={closeNav}>
            Products
          </Link>
        </li>
        <li>
          <Link to="/nearby-doctors" className={isActive('/nearby-doctors')} onClick={closeNav}>
            📍 Nearby
          </Link>
        </li>
      </ul>
      
      <button className="nav-ham" onClick={toggleNav} aria-label="Menu">
        <i></i><i></i><i></i>
      </button>
    </nav>
  );
};

export default Navbar;