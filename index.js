const express = require("express");
const mongoose = require("mongoose");
const route = require("./route/route");
const cors = require("cors");

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection

mongoose.connect(process.env.MONGODB_URL)
  .then(() => {console.log("MongoDB is connected! 😎")})
  .catch((error) => {console.error("MongoDB connection error:", error.message)});

// Routes
app.use("/", route);

// Start Server
app.listen(port, () => {
  console.log(`Server started successfully on port ${port}`);
});
