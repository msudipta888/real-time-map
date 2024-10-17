const axios = require("axios");
const api_key = 'a39abcfaeb2bbed6ed457aafc62cbf2e';

const getLatLng = async (place) => {
  try {
    const response = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(place)}&limit=5&appid=${api_key}`
    );
    
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    } else {
      throw new Error("Place not found");
    }
  } catch (error) {
    console.error("Error in getLatLng:", error);
    throw new Error("Failed to retrieve coordinates");
  }
};

const getNearByPlaces = async (req, res) => {
  const { place, category, distance } = req.body; // Changed from req.query to req.body

  console.log('Received request:', { place, category, distance });

  try {
    if (!place || !category || !distance) {
      throw new Error('Missing required parameters');
    }

    const placpoint = await getLatLng(place);
    console.log('Coordinates:', placpoint);

    const lat = placpoint.lat;
    const lon = placpoint.lng;
    
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="${category}"](around:${distance}, ${lat}, ${lon});
      );
      out body;
    `;

    console.log("Sending Overpass Query: ", query);

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
    console.log(allPlaces);
    const parsedPlaces = allPlaces.map((place) => ({
      id: place.id,
      lat: place?.lat,
      lon: place?.lon,

       allInfo:place.tags
    }));
    // console.log(parsedPlaces);
    if( Array.isArray(parsedPlaces)){
      res.json(parsedPlaces.length > 0 ? parsedPlaces : []);
     }
   

  } catch (error) {
    console.error(error);
    res.status(400).json({ 
      error: error || "Failed to fetch nearby places" 
    });
  }
};

module.exports = { getNearByPlaces };