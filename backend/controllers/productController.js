const Product = require("../models/productModel");
const User = require("../models/userModel");

// List all products (public)
exports.listProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ productId: 1 });
    res.json({ products });
  } catch (err) {
    console.error("listProducts error:", err);
    res.status(500).json({ msg: "Failed to list products" });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const p = await Product.findOne({ productId: Number(req.params.id) });
    if (!p) return res.status(404).json({ msg: "Product not found" });
    res.json({ product: p });
  } catch (err) {
    console.error("getProduct error:", err);
    res.status(500).json({ msg: "Failed to fetch product" });
  }
};

// Create a product (admin only)
exports.createProduct = async (req, res) => {
  try {
    // verify admin
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) return res.status(403).json({ msg: "Forbidden" });

    const { productId, name, description, price, stock, image } = req.body;
    const exists = await Product.findOne({ productId });
    if (exists) return res.status(400).json({ msg: "productId already exists" });

    const product = new Product({ productId, name, description, price, stock, image });
    await product.save();
    res.json({ msg: "Product created", product });
  } catch (err) {
    console.error("createProduct error:", err);
    res.status(500).json({ msg: "Failed to create product" });
  }
};

// Update product (admin only) - full update
exports.updateProduct = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) return res.status(403).json({ msg: "Forbidden" });

    const pid = Number(req.params.id);
    const updates = req.body;
    const product = await Product.findOneAndUpdate({ productId: pid }, updates, { new: true });
    if (!product) return res.status(404).json({ msg: "Product not found" });
    res.json({ msg: "Product updated", product });
  } catch (err) {
    console.error("updateProduct error:", err);
    res.status(500).json({ msg: "Failed to update product" });
  }
};
