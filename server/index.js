const axios = require("axios");
require('dotenv').config();

const api_key = "a30da95635e2418da1d035ad84ff72d8";
const getLatLng = async (place) => {
  try {
    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(place)}&key=${api_key}&limit=4`
    );

    if (response.data.results && response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry;
      return { lat, lng };
    } else {
      throw new Error("Place not found");
    }
  } catch (error) {
    throw new Error("Failed to retrieve coordinates");
  }
};

const getNearByPlaces = async (req, res) => {
  const { place, category, distance } = req.body;
  
  try {
    if (!place || !category || !distance) {
      throw new Error('Missing required parameters');
    }

    const placpoint = await getLatLng(place);
   
    const lat = placpoint.lat;
    const lon = placpoint.lng;

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="${category}"](around:${distance}, ${lat}, ${lon});
      );
      out body;
    `;

    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      `data=${encodeURIComponent(query)}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 18000,
      }
    );

    const allPlaces = response.data.elements;
    const parsedPlaces = allPlaces.map((place) => ({
      id: place.id,
      lat: place?.lat,
      lon: place?.lon,
      allInfo: place.tags
    }));

    if (Array.isArray(parsedPlaces)) {
      res.json(parsedPlaces.length > 0 ? parsedPlaces : []);
    } else {
      throw new Error("Unexpected response format");
    }

  } catch (error) {
    
    const errorResponse = {
      error: error.message || "Failed to fetch nearby places"
    };
    
    res.status(400).json(errorResponse);
  }
};

module.exports = { getNearByPlaces };
