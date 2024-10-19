import React, { useReducer, useRef, useCallback, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./NearPlaces.css";
import ReactDOMServer from "react-dom/server";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import { services } from "@tomtom-international/web-sdk-services";
import { DivIcon } from "leaflet";
import {
  MdRestaurant,
  MdLocalBar,
  MdLocalGroceryStore,
  MdLocalPharmacy,
  MdSearch,
  MdClose
} from "react-icons/md";
import { IoMdCafe } from "react-icons/io";
import { IoFastFoodOutline } from "react-icons/io5";
import { FaHotel } from "react-icons/fa";
import UpdateMapCentre from "./UpDateMapCentre";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
const initialState = {
  searchInput: "",
  selectedPlace: null,
  category: "restaurant",
  distance: "1000",
  searchResults: [],
  nearbyPlaces: [],
  selectedMarker: null,
  isLoading: false,
};

const actions = {
  SET_INPUT: "SET_INPUT",
  SET_RESULTS: "SET_RESULTS",
  SELECT_PLACE: "SELECT_PLACE",
  SET_CATEGORY: "SET_CATEGORY",
  SET_DISTANCE: "SET_DISTANCE",
  SET_PLACES: "SET_PLACES",
  SELECT_MARKER: "SELECT_MARKER",
  SET_LOADING: "SET_LOADING",
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case actions.SET_INPUT:
      return { ...state, searchInput: payload };
    case actions.SET_RESULTS:
      return { ...state, searchResults: payload };
    case actions.SELECT_PLACE:
      return {
        ...state,
        selectedPlace: payload,
        searchInput: payload.address,
        searchResults: [],
      };
    case actions.SET_CATEGORY:
      return { ...state, category: payload };
    case actions.SET_DISTANCE:
      return { ...state, distance: payload };
    case actions.SET_PLACES:
      return { ...state, nearbyPlaces: payload, isLoading: false };
    case actions.SELECT_MARKER:
      return { ...state, selectedMarker: payload };
    case actions.SET_LOADING:
      return { ...state, isLoading: payload };
    default:
      return state;
  }
};

const NearPlaces = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchTimeoutRef = useRef(null);
  const API_KEY = "G7qsLIpGIXTyp6eq1Xa8wTLEyrvTiYVs";
const [error,setError] =useState(null)
  const navigate = useNavigate();
  const [errorBox,setErrorBox] = useState(true)
  const fetchNearbyPlaces = useCallback(async (place, category, distance) => {
    if (!place) return;
    dispatch({ type: actions.SET_LOADING, payload: true });
    try {
      const { data } = await axios.post(
        "https://real-time-map-6jrp.onrender.com/nearby-places/location",
        { place: place.address, category, distance },{
          headers:{
            "auth-token":localStorage.getItem("token"),
          }
        }
      );
      dispatch({ type: actions.SET_PLACES, payload: data.data });
    } 
    catch (error) {
      console.log(err.response);
      const errorMessage = error.response.data?.error || error.response.data?.message || "An unknown error occurred";
      
      if (error.response) {
        if (error.response.status === 401) {
          setError("Authentication failed. Redirecting to sign in...");
          setTimeout(() => {
            navigate('/signin');
          }, 3000);
        } else {
          setError((typeof error.response.data.error === 'string' &&  error.response.data.error!==null)
            ? 
            (error.response.data.error) : "Place not found");
        }
      } else if (error.request) {
        setError("No response received from server. Please try again.");
      } 
      setErrorBox(true);
    } finally {
      dispatch({ type: actions.SET_LOADING, payload: false });
    } 
  }, []);

  useEffect(() => {
    if (state.selectedPlace) {
      fetchNearbyPlaces(state.selectedPlace, state.category, state.distance);
    }
  }, [state.selectedPlace, state.category, state.distance, fetchNearbyPlaces]);

  const handleSearchInput = (value) => {
    dispatch({ type: actions.SET_INPUT, payload: value });
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      if (!value) return dispatch({ type: actions.SET_RESULTS, payload: [] });
      try {
        const { results } = await services.fuzzySearch({
          key: API_KEY,
          query: value,
          limit: 5,
        });
        dispatch({ type: actions.SET_RESULTS, payload: results || [] });
      } catch (error) {
        console.error("Error during search:", error);
      }
    }, 300);
  };

  const handlePlaceSelection = (result) => {
    const placeData = {
      address: result.address.freeformAddress,
      coordinates: result.position,
    };
    dispatch({ type: actions.SELECT_PLACE, payload: placeData });
  };

  const handleFilterChange = (type, value) => {
    dispatch({
      type: type === "category" ? actions.SET_CATEGORY : actions.SET_DISTANCE,
      payload: value,
    });
  };

  const getIcon = (category) => {
    const icons = {
      hotel: <FaHotel />,
      restaurant: <MdRestaurant />,
      cafe: <IoMdCafe />,
      bar: <MdLocalBar />,
      fast_food: <IoFastFoodOutline />,
      market: <MdLocalGroceryStore />,
      pharmacy: <MdLocalPharmacy />,
    };
    return icons[category] || icons.restaurant;
  };

  const createCustomIcon = (category) =>
    new DivIcon({
      html: ReactDOMServer.renderToString(getIcon(category)),
      iconSize: [30, 30],
      className: "custom-div-icon",
    });

  const handleMarkerClick = (place) => {
    dispatch({ type: actions.SELECT_MARKER, payload: place.allInfo });
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => {
      dispatch({ type: actions.SELECT_MARKER, payload: null });
    }, 300);
  };

  return (
        <div className="near-places-container">
          <NavBar/>
          {error && (
           
        <div className={`box ${errorBox ? "show" : "close"}`} >
          {
            console.log(errorBox)
          }
        <p >{typeof error === 'object' ? (error) : error}</p>
        <button onClick={()=>setErrorBox(false)} className="box-btn" >❌</button>
      
        </div>
      )}
      <motion.div 
        className="search-container"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
      >
        <div className="search-input-wrapper">
          <MdSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Enter place name..."
            value={state.searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
          />
        </div>
        <AnimatePresence>
          {state.searchResults.length > 0 && (
            <motion.ul 
              className="search-results"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {state.searchResults.map((result) => (
                <motion.li
                  key={result.id}
                  onClick={() => handlePlaceSelection(result)}
                  whileHover={{ backgroundColor: "#f0f0f0", scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {result.address.freeformAddress}{" "}
                  <small>{result.address.country}</small>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
        <motion.select
          className="category-select"
          value={state.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <option value="restaurant">Restaurant</option>
          <option value="bar">Bar</option>
          <option value="cafe">Cafe</option>
          <option value="hotel">Hotel</option>
          <option value="supermarket">Grocery Store</option>
          <option value="fast_food">Fast Food</option>
          <option value="pharmacy">Pharmacy</option>
        </motion.select>
        <motion.select
          className="distance-select"
          value={state.distance}
          onChange={(e) => handleFilterChange("distance", e.target.value)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <option value="1000">1Km</option>
          <option value="3000">3Km</option>
          <option value="500">500M</option>
          <option value="2000">2Km</option>
          <option value="800">800M</option>
        </motion.select>
      </motion.div>
      {state.isLoading && (
        <motion.div 
          className="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="loader"></div>
          <p>Loading nearby places...</p>
        </motion.div>
      )}
       
      <MapContainer
        center={state.selectedPlace ? [
          state.selectedPlace.coordinates.lat,
          state.selectedPlace.coordinates.lng,
        ] : [22.5744, 88.3629]}
        zoom={10}
        className="map-main"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {state.selectedPlace && (
          <UpdateMapCentre
            newCenter={[state.selectedPlace.coordinates.lat, state.selectedPlace.coordinates.lng]}
          />
        )}

        {Array.isArray(state.nearbyPlaces) && state.nearbyPlaces.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lon]}
            icon={createCustomIcon(state.category)}
            eventHandlers={{
              click: () => handleMarkerClick(place),
            }}
          />
        ))}
      </MapContainer>

      <AnimatePresence>
        {state.selectedMarker && (
          <motion.div 
            className={`sidebar ${isSidebarOpen ? "show" : "closed"}`}
            initial={{ x: "100%" }}
            animate={{ x: isSidebarOpen ? 0 : "100%" }}
            exit={{ x: "100%" }}
          >
            <motion.button
              className="close-btn"
              onClick={closeSidebar}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <MdClose />
            </motion.button>
            <h2>{state.selectedMarker.name}</h2>
            {state.selectedMarker.cuisine ? (
              <p><strong>Cuisine:</strong> {state.selectedMarker.cuisine.split(';').join(' ')}</p>
            ): 'Cuisine not specified'}
            {state.selectedMarker?.brand && (
              <p><strong>Brand:</strong> {state.selectedMarker.brand}</p>
            )}
            {state.selectedMarker?.["payment:cards"] && (
              <p><strong>Payment Cards:</strong> {state.selectedMarker["payment:cards"]}</p>
            )}
            {state.selectedMarker?.["payment:cash"] && (
              <p><strong>Payment Cash:</strong> {state.selectedMarker["payment:cash"]}</p>
            )}
            {state.selectedMarker?.["address:street"] && (
              <p><strong>Street:</strong> {state.selectedMarker["address:street"]}</p>
            )}
            {state.selectedMarker?.phone && (
              <p><strong>Phone:</strong> {state.selectedMarker.phone.split(';').join(' ')}</p>
            )}
            {state.selectedMarker?.["payment:mastercard"] && (
              <p><strong>Payment MasterCard:</strong> {state.selectedMarker["payment:mastercard"]}</p>
            )}
            {
              state.selectedMarker?.website && (
                <p><strong>Website:</strong> <a href={state.selectedMarker.website}>{state
                  .selectedMarker.website}</a></p>
              )
            }
          </motion.div>
        )}
      </AnimatePresence>
    
    </div>
  );
};

export default NearPlaces;