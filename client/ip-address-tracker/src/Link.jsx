// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { MdLogout, MdNearbyOff, MdMenu } from "react-icons/md";
// import { FaMapMarkedAlt } from "react-icons/fa";
// import { motion } from 'framer-motion';


// const NavBar = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleSidebar = () => setIsOpen(!isOpen);

//   const sidebarVariants = {
//     open: { opacity: 1, x: 0 },
//     closed: { opacity: 0, x: "-100%" },
//   };

//   return (
//     <>
//       {/* Sidebar */}
//       <motion.div 
//         className={`sidebar ${isOpen ? 'shift-content' : ''}`} // Add a class to shift content
//         initial={false} 
//         animate={isOpen ? "open" : "closed"}
//         variants={sidebarVariants}
//         transition={{ duration: 0.3 }}
//       >
//         <div className="sidebar-links">
//           <Link to="/map-routing" icon={<FaMapMarkedAlt />} text="Map" mobile />
//           <Link to="/NearBy" icon={<MdNearbyOff />} text="Nearby" mobile />
//           <Link to="/logout" icon={<MdLogout />} text="Logout" mobile />
//         </div>
//       </motion.div>

//       {/* Top Navbar */}
//       <motion.nav 
//         className="navbar"
//         initial={false}
//         animate={isOpen ? "open" : "closed"}
//       >
//         <div className="navbar-container">
//           <div className="navbar-logo">
//             <Link to="/" className="logo-link">Logo</Link>
//           </div>
//           <div className="navbar-menu-button">
//             <button onClick={toggleSidebar} className="menu-button">
//               <MdMenu className="menu-icon" />
//             </button>
//           </div>
//         </div>
//       </motion.nav>

//       {/* Main Content Area */}
//       <div className={`main-content ${isOpen ? 'shift' : ''}`}>
//         {/* This is where your inputs and map will go */}
//       </div>
//     </>
//   );
// };


// export default NavBar;
