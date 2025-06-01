const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  productId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product-v1",
    required:true,
  },
  addedAt:{
    type:Date,
    default:Date.now
  },
},{timestamps:true});

module.exports = mongoose.model("Wishlist", wishlistSchema);