import React, { useState } from "react";
import "./Sidebar.css";

const Sidebar = ({ travelOption, eachSteps, setHoveredSegment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null); 

  const convertSecondsToTime = (time) => {
    if (time < 60) {
      return `${time} secs`;
    } else {
      const min = Math.floor(time / 60).toFixed(2);
      const sec = Math.floor(time % 60).toFixed(2);
      return `${min} min ${sec} secs`;
    }
  };

  const convertDistance = (dis) => {
    if (dis < 1000) {
      return `${Math.floor(dis)} meters`;
    } else {
      const distance = (dis / 1000).toFixed(2);
      return `${distance} km`;
    }
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI / 180; // φ in radians
    const φ2 = lat2 * Math.PI / 180; // φ in radians
    const Δφ = (lat2 - lat1) * Math.PI / 180; // Δφ in radians
    const Δλ = (lon2 - lon1) * Math.PI / 180; // Δλ in radians

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="toggle-btn">
        {isOpen ? "➡️" : "⬅️"}
      </button>
      {isOpen && (
        <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
          <h3>Route Information</h3>
          <p>
            <strong>Travel Mode:</strong> {travelOption}
          </p>
          <h4>Steps:</h4>
          <div className="instructions-container">
            {Array.isArray(eachSteps) &&
              eachSteps.map((step, index) => {
                const { latitude: lat1, longitude: lon1 } = step.point;

                // Calculate distance and time for the next step
                let distanceToNext = 0;
                let estimatedTime = 0;

                if (index < eachSteps.length - 1) {
                  const { latitude: lat2, longitude: lon2 } = eachSteps[index + 1].point;

                 
                  distanceToNext = haversineDistance(lat1, lon1, lat2, lon2);
                  
                 
                  const averageSpeed = 1.39; 
                  estimatedTime = distanceToNext / averageSpeed; // Time in seconds
                }

                return (
                  <div
                    key={index}
                    className="instruction-item"
                    style={{ "--i": index }}
                    onMouseEnter={() => {
                      setHoveredSegment({
                        lat: step.point.latitude,
                        lng: step.point.longitude,
                        street: step.street,
                        message: step.message,
                      });
                      setHoveredIndex(index);
                    }}
                    onMouseLeave={() => {
                      if (index === eachSteps.length - 1) {
                        setHoveredSegment(null);
                        setHoveredIndex(null);
                      }
                    }}
                  >
                    <span className="instruction-text">{step.message}</span>
                    <br />
                    {index !== 0 && (
                      <span className="distance">
                        Distance: {convertDistance(distanceToNext)} 
                      </span>
                     
                    )}
                    <br />
                    {index !== 0 && (
                      <span className="duration">
                        Estimated Time: {convertSecondsToTime(estimatedTime)}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
