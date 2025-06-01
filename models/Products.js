const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    rating: {
      type: Number,
    },
    discount: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    size: {
      type: [String],
      enum: ["S", "M", "L", "XL", "XXL"],
      default: ["S"],
    },
    description:{
      type:[String],
      default:undefined,
    },
    Category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories-v1",
      required:true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product-v1", productSchema);
