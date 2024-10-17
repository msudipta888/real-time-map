const express = require("express");
const { createServer } = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const axios = require("axios"); // Use axios for consistency
require('dotenv').config();
const app = express();
const { stringify } = require("querystring");
const { getNearByPlacesRoute } = require("../router");
const mongoose  = require("mongoose");

const jwt = require('jsonwebtoken');

mongoose
  .connect(process.env.MONGOOSE_URI, {
    useNewUrlParser: true,  
    useUnifiedTopology: true,  
    serverSelectionTimeoutMS: 50000,  
    socketTimeoutMS: 60000, 
    connectTimeoutMS: 30000  
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
  });

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);
app.use(express.json());

const server = createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});


const tomtomApiKey = "9SfcvfCOKlu6AwseMQggkQrwtHkqewQs"; 

const getLatLng = async (place) => {
  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: place,
          format: "json",
        },
      }
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

const getRoutes = async (startPlace, endPlace, travelOption) => {
  const query = {
    key: tomtomApiKey,
    maxAlternatives: 1,
    alternativeType: "betterRoute",
    traffic: true,
    travelMode: travelOption,
    instructionsType: "text",
  };
  const midlat = (startPlace.lat+endPlace.lat)/2;
  const midlng = (endPlace.lng+endPlace.lng)/2;
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
                latitude: midlat+ 0.1,
                longitude: midlng + 0.1,
              },
              southWestCorner: {
                latitude: midlat- 0.1,
                longitude: midlng- 0.1,
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
  
    return response.data.routes[0];
  } catch (error) {
    console.log("Error in getRoutes:", error.response?.data || error.message);
    throw new Error("failed to retrive routes");
  }
};

//main

io.on("connection", (socket) => {
  console.log("connection established");

  socket.on("updateDestinations", async (data) => {
    try {
      const { startPoint, endPoint, travelOption } = data;
      if (!startPoint || !endPoint) {
        return socket.emit("invalid", {
          error: "Missing startPoint or endPoint",
        });
      }

      const startPlace = await getLatLng(startPoint);
      const endPlace = await getLatLng(endPoint);
     console.log(startPlace);
      const response = await getRoutes(startPlace, endPlace, travelOption);
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

      socket.emit("routeUpdate", routeData);
    } catch (error) {
      console.error("Error fetching route:", error);
      socket.emit("error", { error });
      
    }
  });
    // Handle location updates
    socket.on("userlocation", (data) => {
      console.log(`User location update from ${socket.id}:`, data);
      // Broadcast user location to others
      socket.broadcast.emit("recieve-location", { id: socket.id, data });
    });
});


app.use("/nearby-places", getNearByPlacesRoute);
app.use('/users',require('../routes/authRoutes'));

// Server start
const PORT = 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
