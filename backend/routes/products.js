const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const productController = require("../controllers/productController");

// Public product listing
router.get("/", productController.listProducts);
router.get("/:id", productController.getProduct);

// Admin-protected product management
router.post("/", auth, productController.createProduct);
router.put("/:id", auth, productController.updateProduct);

module.exports = router;
