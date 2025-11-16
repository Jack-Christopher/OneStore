const { Schema, model } = require("mongoose");
const ProductSchema = new Schema({
  name: String,
  category: String,
  stock: Number,
  price: Number
}, { timestamps: true });
module.exports = model("Product", ProductSchema);
