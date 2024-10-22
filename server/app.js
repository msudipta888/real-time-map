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

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser())
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
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
