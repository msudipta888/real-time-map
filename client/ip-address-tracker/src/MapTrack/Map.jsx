import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setStartPoint,
  setEndPoint,
  setDistance,
  setRoutepath,
  setTime,
} from "../redux/CounterSlice";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { services } from '@tomtom-international/web-sdk-services';
import LeafLet from "./LeafLet";
import {motion} from 'framer-motion'
import './Map.css'
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";


const Map = () => {
  const [travelOption, setTravelOption] = useState("car"); // Updated travel options for ORS
  const startPoint = useSelector((state) => state.position.startPoint);
  const endPoint = useSelector((state) => state.position.endPoint);
  const routepath = useSelector((state) => state.position.routepath);
  const distance = useSelector((state) => state.position.distance);
  const time = useSelector((state) => state.position.time);
  const [errorMessage, setErrorMessage] = useState('');
  const dispatch = useDispatch();
  const [eachSteps, setEachSteps] = useState([]);
  const [start,setStart] = useState({});
  const [end,setEnd] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [isValidStart, setIsValidStart] = useState(false); 
  const [isValidEnd, setIsValidEnd] = useState(false);
  const API_KEY = 'G7qsLIpGIXTyp6eq1Xa8wTLEyrvTiYVs'; // 
  const [active,setActive] = useState(null);
  const navigate = useNavigate();
  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await services.fuzzySearch({
        key: API_KEY,
        query: query,
        limit: 5
      });

      if (response.results) {
        setSearchResults(response.results);
      }
    } catch (error) {
      console.error('Error during search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e,type) => {
    const value = e.target.value;
    setActive(type)
    if(type === "start"){
    dispatch(setStartPoint(value))
    }
    else if (type === "end") {
      dispatch(setEndPoint(value));
    }
    setIsValidEnd(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };
  
  const handleResultClick = (result) => {
    if(startPoint && !isValidStart && active==="start"){ 
     setIsValidStart(true);     
      dispatch(setStartPoint(result.address.freeformAddress))
    } else if(endPoint && !isValidEnd && active==="end")
    {
      setIsValidEnd(true);     
      dispatch(setEndPoint(result.address.freeformAddress))
    }
    setSearchResults([]);
  };
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

    let socket;
    const fetchRoute = async () => {
      const token = localStorage.getItem("token");
      try {

         socket =io("http://localhost:3001",{
          auth:{
            token:token
          }
         })
     socket.on('authenticationError',(err)=>{
       console.log(err.error);
       <p style={{color:"red",fontSize:"16px",position:"fixed",zIndex:1000}}>{err.error} </p>
     })
        if(isValidStart && isValidEnd){
          socket.emit("updateDestinations", {startPoint, endPoint,travelOption});
        }
        socket.on("invalid",(error)=>{
          console.log(error.error);
          <p style={{position:"fixed",zIndex:2000}}>{error.error}</p>
        })
          socket.on("routeUpdate", (response) => {
            console.log("Response data:", response);
            if (response) {
              setEachSteps(response.instructions); 
              dispatch(setTime(response.time));
              dispatch(setDistance(response.distance));
              setStart({ lat: response.startPlace.lat, lng: response.startPlace.lng });
              setEnd({ lat: response.endPlace.lat, lng: response.endPlace.lng });
              console.log("Start coordinates set:", start);
              console.log("End coordinates set:", end);
            
              const decodedPath = response.points;
              if (Array.isArray(decodedPath) && decodedPath.length > 0) {
                const path = decodedPath.map((val) => [val.latitude, val.longitude]);
                dispatch(setRoutepath(path));
                console.log("Route paths are: ", path);
              } else {
                console.error("No route found");
                dispatch(setRoutepath([]));
              }
            } else {
              console.error("No instructions found in the response");
              setEachSteps([]);
            }
          });
          socket.on("error", (error) => {
            console.error("Error fetching route:", error.error);
            dispatch(setRoutepath([])); 
          });
        }
     
        catch (error) {
          console.error("Error fetching route:", error);
            setTimeout(() => {
              navigate("/signin");
            }, 3000); // Redirect after 3 seconds
      }
    }
    useEffect(() => {
      if (isValidStart && isValidEnd) {
        fetchRoute();
      }
    }, [startPoint, endPoint, travelOption]); 
  return (
    
    <div className="main">
      <NavBar/>
      <div className="container">
    <div className="startPoint">
     
        <input
          type="text"
          name="startPlace"
          value={startPoint}
          onChange={(e)=>handleInputChange(e,"start")}
          placeholder="Enter Start Place"
          autoComplete="off"
        />
      </div>

      <div className="endPoint">
      
        <input
         
          type="text"
          name="endPlace"
          value={endPoint}
          onChange={(e)=> handleInputChange(e,"end")}
          placeholder="Enter End Place"
          autoComplete="off"
        />
         </div>
        {searchResults.length > 0 && (
          <motion.div
           className="search-result"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.ul initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}>
              {searchResults.map((result) => (
                <motion.li
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  style={{
                   padding:"8px 9px",
                    cursor: "pointer",
                    listStyleType:"none",
                    marginTop:"15px"
                  }}
                  whileHover={{ scale: 1.02, background: "#f1f1f1" }} // Light gray on hover
                  whileTap={{ scale: 0.98 }}
                >
                  <div style={{ fontSize: "medium" }}>{result.address.freeformAddress}</div>
                  {result.address.country && (
                    <div style={{ fontSize: "small", color: "gray" }}>{result.address.country}</div>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
        </div>
        <div>
      {errorMessage && <div className="error-alert animated-alert">{errorMessage}</div>}
      {/* Other UI elements */}
    </div>
        <div className="sidebar">
        <Sidebar  travelOption={travelOption} eachSteps={eachSteps} setHoveredSegment={setHoveredSegment} />
        </div>

       <p>Distance: {(distance / 1000).toFixed(2)} km</p>
       <p>Time: {Math.round(time/3600)}hrs </p>
       <div className="map">
       <LeafLet 
        start={start}
        end={end}
        routepath={routepath}
        travelOption={travelOption}
        setTravelOption={setTravelOption}
        hoveredSegment={hoveredSegment}
        eachSteps={eachSteps}
      />
       </div>
       
    </div>
 
   
  );
};

export default Map;