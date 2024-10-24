const { stringify } = require("querystring");
require("dotenv").config();
const axios = require("axios"); 
const api_key = "a30da95635e2418da1d035ad84ff72d8";
const getLatLng = async (place) => {
  try {
    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(place)}&key=${api_key}&limit=5`
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
  
  const getRoutes = async (startPlace, endPlace, travelOption) => {
    const query = {
      key: process.env.TOM_API,
      maxAlternatives: 1,
      alternativeType: "betterRoute",
      traffic: true,
      travelMode: travelOption,
      instructionsType: "text",
    };
    const midlat = (startPlace.lat + endPlace.lat) / 2;
    const midlng = (endPlace.lng + endPlace.lng) / 2;
    try {
      const response = await axios.post(
        `https://api.tomtom.com/routing/1/calculateRoute/${startPlace.lat},${
          startPlace.lng
        }:${endPlace.lat},${endPlace.lng}/json?${stringify(query)}`,
        {
          avoidAreas: {
            rectangles: [
              {
                northEastCorner: {
                  latitude: midlat + 0.1,
                  longitude: midlng + 0.1,
                },
                southWestCorner: {
                  latitude: midlat - 0.1,
                  longitude: midlng - 0.1,
                },
              },
            ],
          },
          supportingPoints: [
            {
              latitude: startPlace.lat,
              longitude: startPlace.lng,
            },
            {
              latitude: endPlace.lat,
              longitude: endPlace.lng,
            },
          ],
        }
      );
      if (!response.data || !response.data.routes || response.data.routes.length === 0) {
        throw new Error("No routes found");
      }
      return response.data.routes[0];
    } catch (error) {
     
      throw new Error("failed to retrive routes");
    }
  };
  
  
const getRoute= async (req,res)=>{ 
  console.log("request coming")
  const {startPoint,endPoint,travelOption} = req.body;
   try {
    if(!startPoint || !endPoint){
      return res.status(400).json({message: "Start and end points are required"})
    }else{
      const [startPlace, endPlace] = await Promise.all([
        getLatLng(startPoint),
        getLatLng(endPoint)
      ]);
      const response = await getRoutes(startPlace,endPlace,travelOption);
      const routeData = {
        startPlace,
        endPlace,
        instructions: response.guidance.instructions,
        points: response.legs[0].points,
        time: response.summary.travelTimeInSeconds,
        distance: response.summary.lengthInMeters,
        trafficDelay: response.summary.trafficDelayInSeconds,
        sections: response.sections[0],
      };
      return res.status(200).json(routeData);
    }
   } catch (error) {
    console.error(error.message);
    return res.status(500).json({message: "Failed to retrieve route"});
  
   }

}
module.exports={getRoute};
