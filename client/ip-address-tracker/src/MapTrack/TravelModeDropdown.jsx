import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModeOfTravelIcon from '@mui/icons-material/ModeOfTravel';
import MapIcon from '@mui/icons-material/Map';
import './TravelModeDropdown.css';

const DropdownSelect = ({ icon: Icon, options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    onChange({ target: { value: option } });
    setIsOpen(false);
  };

  return (
    <div className="dropdown">
      <button className="dropdown-toggle" onClick={toggleDropdown}>
        <Icon />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            className="dropdown-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {options.map((option) => (
              <li key={option} onClick={() => handleSelect(option)}>
                {option}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

const TravelModeDropdown = ({ travelOption, setTravelOption, mapType, setMapType }) => {
  const travelOptions = ["car", "walking", "truck", "scooter", "bike"];
  const mapOptions = ["OpenStreetMap", "Esri Satellite"];

  return (
    <div className="travel-mode-dropdown">
      <DropdownSelect
        icon={ModeOfTravelIcon}
        options={travelOptions}
        value={travelOption}
        onChange={(e) => setTravelOption(e.target.value)}
        label="Travel Mode"
      />
      <DropdownSelect
        icon={MapIcon}
        options={mapOptions}
        value={mapType}
        onChange={(e) => setMapType(e.target.value)}
        label="Map Type"
      />
    </div>
  );
};

export default TravelModeDropdown;