import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="logo-icon">⛉</span> AuraKYC
      </div>
      
      <ul className="navbar-links">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/onboarding" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Onboarding
          </NavLink>
        </li>
        <li>
          <NavLink to="/liveness" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Biometrics
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Dashboard
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

