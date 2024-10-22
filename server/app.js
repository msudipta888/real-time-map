const express = require("express");
const { createServer } = require("http");
 const socketIo = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
 const {nearBy,Route, newAccessToken} = require('./router')

const server = createServer(app);
mongoose
  .connect(process.env.MONGOOSE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 50000,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 30000,
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

  
app.use(cors());

app.use(
 cors({
    origin: "https://mapquestorapp.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

const io = socketIo(server, {
 cors({
    origin: "https://mapquestorapp.netlify.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, 
  })
});
  app.use(express.json());
  app.use(cookieParser())
io.on("connection", (socket) => {
  console.log("connection established");  
 socket.on("userlocation", (data) => {
    socket.broadcast.emit("recieve-location", { id: socket.id, data });
  });
});
 

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});
app.use("/refresh-token",newAccessToken);
app.use("/map",Route)
app.use("/nearby-places", nearBy);
app.use("/users", require("./routes/authRoutes"));
