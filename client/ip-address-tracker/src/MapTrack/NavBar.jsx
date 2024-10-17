import React, { useState } from 'react';
import { IoHome } from "react-icons/io5";
import { MdNearbyOff } from "react-icons/md";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi"; // Added FiX for close button
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
     
      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX /> : <FiMenu />} 
      </button>

      {/* Navigation Menu */}
      <div className={`nav-icons ${isOpen ? 'open' : ''}`}>
        <nav>
          <NavLink to="/map-routing" icon={<IoHome />} label="Home" />
          <NavLink to="/nearBy" icon={<MdNearbyOff />} label="Nearby" />
          <NavLink to="/logout" icon={<FiLogOut />} label="Logout" />
        </nav>
      </div>
    </>
  );
};

const NavLink = ({ to, icon, label }) => (
  <Link to={to} className="nav-link">
    {icon}
    <span className="nav-label">{label}</span>
  </Link>
);

export default NavBar;
