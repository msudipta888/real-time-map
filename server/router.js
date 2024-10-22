const express = require("express");
const { getNearByPlaces } = require("./index.js");
const { getRoute } = require("./maproute.js");
const router = express.Router();
const newAccessToken = router.post("/generate",require("./middleware/refreshToken.js"));
const Route = router.post("/routing", require("./middleware/auth.js"), getRoute);

const nearBy = router.post(
  "/location",
  require("./middleware/auth.js"),
  getNearByPlaces
);

module.exports = { nearBy, Route,newAccessToken };
