const Order = require("../models/orderModel");
const Product = require("../models/productModel");

exports.createOrder = async (req, res) => {
  try {
    let { items, total } = req.body;
    if (!items || !items.length) return res.status(400).json({ msg: "No items provided" });

    // Normalize items coming from frontend. The frontend uses `id` for product id; map
    // to `productId` expected by the schema, and remove any _id fields that would
    // conflict with MongoDB ObjectId types.
    items = items.map(i => ({
      productId: i.productId || i.id || null,
      name: i.name,
      price: Number(i.price) || 0,
      qty: Number(i.qty) || 0
    }));

    // Check stock availability for all items before creating order
    for (const item of items) {
      const product = await Product.findOne({ productId: item.productId });
      if (!product) {
        return res.status(400).json({ msg: `Product ${item.productId} not found` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ msg: `Not enough stock for "${product.name}". Available: ${product.stock}, Requested: ${item.qty}` });
      }
    }

    // Recompute total server-side to avoid price tampering
    const serverTotal = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);
    total = Number(serverTotal.toFixed(2));

    const order = await Order.create({
      user: req.userId,
      items,
      total
    });

    // Decrement stock for each product in the order
    for (const item of items) {
      await Product.updateOne(
        { productId: item.productId },
        { $inc: { stock: -item.qty } }
      );
    }

    res.json({ msg: "Order created", order });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
