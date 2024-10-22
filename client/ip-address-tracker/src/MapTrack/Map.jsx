import React, { useState, useEffect, useRef, useReducer } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  setStartPoint,
  setEndPoint,
  setDistance,
  setRoutepath,
  setTime,
} from "../redux/CounterSlice";

import "leaflet/dist/leaflet.css";
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { services } from '@tomtom-international/web-sdk-services';
import LeafLet from "./LeafLet";
import {motion} from 'framer-motion'
import './Map.css'
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import axios from "axios";

import TravelModeDropdown from "./TravelModeDropdown";

const Map = () => {
  const [travelOption, setTravelOption] = useState("car"); // Updated travel options for ORS
  const startPoint = useSelector((state) => state.position.startPoint);
  const endPoint = useSelector((state) => state.position.endPoint);
  const routepath = useSelector((state) => state.position.routepath);
  const distance = useSelector((state) => state.position.distance);
  const time = useSelector((state) => state.position.time);
  const dispatch = useDispatch();
  const [eachSteps, setEachSteps] = useState([]);
  const [start,setStart] = useState({});
  const [end,setEnd] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [isValidStart, setIsValidStart] = useState(false); 
  const [isValidEnd, setIsValidEnd] = useState(false);
  const API_KEY = '9SfcvfCOKlu6AwseMQggkQrwtHkqewQs'; // 
  const [active,setActive] = useState(null);
  const navigate = useNavigate();
  const [errorBox,setErrorBox] = useState(true)
  const [error,setError] =useState(null)

  const [mapType, setMapType] = useState("osm");
  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
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
      setError('Error during search:', error);
      setErrorBox(true);
    }
  };

  const handleInputChange = (e,type) => {
    const value = e.target.value;
    setActive(type)
    if(type === "start"){
    dispatch(setStartPoint(value))
    setIsValidStart(false);
    }
    else if (type === "end") {
      dispatch(setEndPoint(value));
      setIsValidEnd(false);
    }
  
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 200);
  };
  
  const handleResultClick = (result) => {
    const selectedAddress = result.address.freeformAddress;
    if(active==="start"){ 
      if (selectedAddress !== startPoint) {
        dispatch(setStartPoint(selectedAddress));
        setIsValidStart(true); 
      }
    } else if(active==="end")
    {
      if (selectedAddress !== endPoint) {
        dispatch(setEndPoint(selectedAddress));
        setIsValidEnd(true); 
      }
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

   
  const mapRouting= async(startPoint,endPoint,travelOption) => {
     
  try{
    const response = await axios.post("https://real-time-map-wwf8.onrender.com/map/routing",{
      startPoint,
      endPoint,
      travelOption
    },
    {
      headers:{
        "auth-token":localStorage.getItem("token")
      }
    }
  );
      if (response) {
        setEachSteps(response.data.instructions);
        dispatch(setTime(response.data.time));
        dispatch(setDistance(response.data.distance));
        setStart({ lat: response.data.startPlace.lat, lng: response.data.startPlace.lng });
        setEnd({ lat: response.data.endPlace.lat, lng: response.data.endPlace.lng });

        const decodedPath = response.data.points;
        if (Array.isArray(decodedPath) && decodedPath.length > 0) {
          const path = decodedPath.map((val) => [val.latitude, val.longitude]);
          dispatch(setRoutepath(path));
        } else {
          setError("No route found");
          dispatch(setRoutepath([]));
        }
      } else {
        setError("No instructions found in the response");
        setEachSteps([]);
      }
    
    }
    catch(error){
      if(error.response){
      if(error.response.status===401){
       try {
        const newToken = await axios.post("https://real-time-map-wwf8.onrender.com/refresh-token/generate",
          {},
       {   withCredentials:true}
        )
        const accessToken = newToken.data.accessToken;
        localStorage.setItem("token",accessToken);
        console.log("new token: ",accessToken);
       return mapRouting(startPoint,endPoint,travelOption);
       } catch (error) {
        setError("Session expired. Please log in again.")
        setTimeout(()=>{
         navigate("/signin")
        },5000)
       }
        navigate("/signin")
      }else {
        setError(( error.response.data)
          ? 
          (error.response.data.message) : "Place not found");
      }
    }
  else if(error.request){
    setError("No response received from server. Please try again later.")
  }
 setErrorBox(true);
    }
  }

    useEffect(() => {
      if (isValidStart && isValidEnd) {
       mapRouting(startPoint,endPoint,travelOption);
    }
    }, [isValidStart, isValidEnd, startPoint, endPoint, travelOption]);
  return (
    
    <div className="main">
      <NavBar/>
      {error && (
           
           <div className={`box ${errorBox ? "show" : "close"}`} >
             {
               console.log(errorBox)
             }
           <p>{typeof error === 'object' ? JSON.stringify(error) : error}</p>
           <button className="box-btn" onClick={()=>setErrorBox(false)} >❌</button>
         
           </div>
         )}
       
     
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
        mapType={mapType}
      />
       </div>
       <TravelModeDropdown travelOption={travelOption} setTravelOption={setTravelOption} mapType={mapType} setMapType={setMapType} />
    </div>
 
   
  );
};

export default Map;
