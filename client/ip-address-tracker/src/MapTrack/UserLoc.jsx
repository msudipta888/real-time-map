import React, { useRef, useEffect,useState } from 'react';
import { setUserlat, setUserlon } from '../redux/CounterSlice';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { useMap } from 'react-leaflet';
import './UserLoc.css'

const UserLoc = ({setPlaceName}) => {
  const dispatch = useDispatch();
 const latitude = useSelector(state=>state.position.userlat);
 const longitude = useSelector(state=>state.position.userlon);
  // Use ref to store the socket instance
  const socketRef = useRef(null);
  const watchIdRef = useRef(null); 
  const [rotating, setRotating] = useState(false);
 const map = useMap()
  const token = localStorage.getItem("token")
  useEffect(() => {
    try{
    socketRef.current = io('http://localhost:3001',{
      auth:{
        token:token
      }
    })
  }catch(error){
    if (error.response && error.response.status === 401) {
      
      alert("Invalid or expired token. Please log in again.");
      localStorage.removeItem("token");
    }
  }
    return () => {
      // Clean up socket connection on component unmount
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Handle geolocation errors
  function errorCallback(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        alert("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        alert("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        alert("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        alert("An unknown error occurred.");
        break;
      default:
        break;
    }
  }

  // Start tracking user location
  const userLocTrack = () => {
    try {
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.flyTo([latitude,longitude],13);

            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
            .then(response => response.json())
            .then(data => {
              console.log("Place Name:", data.display_name); 
              setPlaceName(data.display_name);
            })
          .catch(error => console.error('Error:', error));
            dispatch(setUserlat(latitude));
            dispatch(setUserlon(longitude));

            // Emit user's current location
            if (socketRef.current) {
              socketRef.current.emit('userlocation', { lat: latitude, lon: longitude });
            }
            console.log('latitude: ',latitude + "  " + 'longitude: ',longitude)
            setRotating(true); // Start rotating

            // Stop rotating after 3 seconds
            setTimeout(() => {
              setRotating(false);
            }, 4000);
          },
          (error) => errorCallback(error),
          {
            enableHighAccuracy: true,
            timeout: 6000,
            maximumAge: 10000,
          }
        );

        // Listen for server updates about other users
        if (socketRef.current) {
          socketRef.current.on('recieve-location', (data) => {
            console.log(`Update from user ${data.id}:`, data.data);
          });
        }
       
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);
  

  return (
    <div>
      <button className={`user-location-button ${rotating ? "rotate":""}`} onClick={userLocTrack}>
      <MyLocationIcon />
      </button>
    </div>
  );
};

export default UserLoc;
