import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Popup,
  useMap,
  Polyline,
  Marker,

} from "react-leaflet";
import "./Leaflet.css";
import "esri-leaflet"; // Import ESRI Leaflet library
import {DivIcon} from 'leaflet'
import ReactDOMServer from 'react-dom/server'
import CarIcon from "./CarIcon";
import {useSelector} from 'react-redux'
import FlagIcon from '@mui/icons-material/Flag';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import UserLoc from "./UserLoc";
import ModeOfTravelIcon from '@mui/icons-material/ModeOfTravel';
import MapIcon from '@mui/icons-material/Map';
import HailIcon from '@mui/icons-material/Hail';
const FitBounds = ({ routepath }) => {
  const map = useMap();
  useEffect(() => {
    if (routepath && routepath.length > 0) {
      const bounds = routepath.map(([lat, lng]) => [lat, lng]);
      map.fitBounds(bounds);
    }
  }, [routepath, map]);

  return null;
};

const LeafLet = ({
  start,
  end,
  routepath,
  travelOption,
  setTravelOption,
  hoveredSegment,
  eachSteps,
}) => {
  const [mapType, setMapType] = useState("osm");
  const apiKey = "R8YlXVzflf6vLLFHbXyttOfW33AxnA0b";
  const latitude = useSelector(state=>state.position.userlat);
  const longitude = useSelector(state=>state.position.userlon);
  const startPoint = useSelector((state) => state.position.startPoint);
  const endPoint = useSelector((state) => state.position.endPoint);
  const [placeName,setPlaceName] = useState("");
  const handleTravelMode = (e) => {
    setTravelOption(e.target.value);
  };
  const handleMapTypeChange = (e) => {
    setMapType(e.target.value);
  };
  const tomtomApiKey = "G7qsLIpGIXTyp6eq1Xa8wTLEyrvTiYVs";

  const center =
    start.lat && end.lat
      ? [(start.lat + end.lat) / 2, (start.lng + end.lng) / 2]
      : [0,0];
      const customIcons = new DivIcon({
        html: ReactDOMServer.renderToString( <CarIcon/>),
        iconSize: [0,0],
        iconAnchor: [24, 24],
       
      });
   const customStart  = new DivIcon({
    html: ReactDOMServer.renderToString(<FlagIcon style={{fontSize:"39px"}}/>),
    iconSize:[0,0],
    iconAnchor:[15,15]
   });
   const customEnd  = new DivIcon({
    html: ReactDOMServer.renderToString(<SportsScoreIcon style={{fontSize:"39px"}}/>),
    iconSize:[0,0],
    iconAnchor:[15,15]
   });
   const customUserIcon = new DivIcon({
    html: ReactDOMServer.renderToString(<HailIcon style={{fontSize:"49px"}}/>),
    iconSize:[0,0],
    iconAnchor: [28, 40], // Adjust anchor so the icon is correctly positioned
    popupAnchor: [0, -40]
   })
  return (
    <div className="leaflet-main">
      <div className="custom-select travelmode">
        <ModeOfTravelIcon/>
        <select value={travelOption} onChange={handleTravelMode}>
          <option value="car">Car</option>
          <option value="foot">Walking</option>
          <option value="truck">Truck</option>
          <option value="scooter">Scooter</option>
          <option value="bike">Bike</option>
        </select>
      </div>

      {/* Map Type Selection */}
      <div className="custom-select maptype">
        <MapIcon/>
        <select value={mapType} onChange={handleMapTypeChange}>
          <option value="osm">OpenStreetMap</option>
          <option value="esri">Esri Satellite</option>
        </select>
        
      </div>
      
      {/* Map Container */}
     
      <MapContainer
        center={center}
        zoom={16}
        style={{ height: "100vh", width: "100vw", position:"relative",scrollbarWidth:"none",overflow:"hidden",flex:1 }}
      >
        {/* Tile Layers Based on Selected Map Type */}
        {mapType === "osm" ? (
          <>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
             
            />
            <TileLayer
              url={`https://{s}.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${tomtomApiKey}`}
            />
            <TileLayer
              url={`https://{s}.api.tomtom.com/traffic/incidents/2/tile/{z}/{x}/{y}.png?key=${tomtomApiKey}`}
             
            />
          </>
        ) : (
          <TileLayer
            url="https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
          />
        )}  
          <div className="user-location-container">
          <UserLoc setPlaceName={setPlaceName} />
        </div>
        {start.lat && start.lng && (
          <Marker
            position={[start.lat, start.lng]}
           icon={customStart}
          >
            <Popup>{startPoint+'(Start point)'}</Popup>
          </Marker>
        )}
       
        {end.lat && end.lng && (
          <Marker
            position={[end.lat, end.lng]}
           icon={customEnd}
            fillOpacity={0.5}
          >
            <Popup>{endPoint+'(destination)'}</Popup>
          </Marker>
        )}
         
        <Polyline  positions={routepath} color={"blue"} weight={7} />
       

     {latitude && longitude && ( <Marker position={[latitude,longitude]}
      icon={customUserIcon}>
        <Popup >
         {placeName}
        </Popup>
       </Marker>)}
        {hoveredSegment && (
        <Marker 
        position={[hoveredSegment.lat,hoveredSegment.lng]}
        icon={customIcons}
        >
        <Popup>
    {hoveredSegment 
      ? (hoveredSegment.street 
          ? `Turn onto ${hoveredSegment.street}`
          : hoveredSegment.message 
            ? hoveredSegment.message 
            : `Maneuver: ${hoveredSegment.maneuver}, Angle: ${hoveredSegment.turnAngleInDecimalDegrees}°`)
      : "Loading..."}
  </Popup>
        </Marker>
        )}
        <FitBounds routepath={routepath} />
      </MapContainer>
    </div>
  );
};

export default LeafLet;
