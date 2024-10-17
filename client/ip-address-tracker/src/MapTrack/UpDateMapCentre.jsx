import { useMap } from "react-leaflet";

const UpdateMapCentre = ({ newCenter }) => {
  const map = useMap();
  if (newCenter) {
    map.setView (newCenter, 13); // Update the center of the map
  }
  return null;
};
export default UpdateMapCentre