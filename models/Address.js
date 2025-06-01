const mongoose = require("mongoose");
const Country = require("./Country");

const addressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  addresses: {
    type: String,
    required: true,
  },
  country:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Country",
    required:true,
  },
  city:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"City",
    required:true,
  },
  zipcode:{
    type:String,
    required:true,
  },
},{timestamps:true});

module.exports = mongoose.model("Address", addressSchema);
