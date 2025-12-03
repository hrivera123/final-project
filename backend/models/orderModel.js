const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: Number },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true }
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: ["Created", "Shipped", "Delivered"], required: true },
  timestamp: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    status: { type: String, enum: ["Created", "Shipped", "Delivered"], default: "Created" },
    statusHistory: [statusHistorySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
