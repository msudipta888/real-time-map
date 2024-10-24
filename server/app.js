const express = require("express");
const { createServer } = require("http");
 const socketIo = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
 const {nearBy,Route} = require('./router')

const server = createServer(app);
mongoose
  .connect(process.env.MONGOOSE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 17000,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
  });

app.use(
 cors({
    origin: "https://mapquestorapp.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

const io = socketIo(server, {
  cors: {
    origin: "https://mapquestorapp.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});
  app.use(express.json());
io.on("connection", (socket) => {
  console.log("connection established");  
 socket.on("userlocation", (data) => {
    socket.broadcast.emit("recieve-location", { id: socket.id, data });
  });
});
 
app.use("/map",Route)
app.use("/nearby-places", nearBy);
app.use("/users", require("./routes/authRoutes"));
