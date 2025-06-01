const mongoose = require("mongoose");
require("dotenv").config();
const MONGO_URI = process.env.MONGO_URI;

const initializeDatabase = async () => {
  await mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("Connected to Database");
    })
    .catch((error) => {
      console.error("Error to connection database", error);
    });
};

module.exports = {initializeDatabase}
