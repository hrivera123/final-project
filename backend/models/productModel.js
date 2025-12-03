const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 100 },
    description: { type: String },
    image: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
