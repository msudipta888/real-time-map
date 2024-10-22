const axios = require("axios");
require('dotenv').config();

const getLatLng = async (place) => {
  try {
    const response = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(place)}&limit=5&appid=${process.env.TOM_API_KEY}`
    );
    
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
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