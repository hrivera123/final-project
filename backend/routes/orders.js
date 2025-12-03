const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const orderController = require("../controllers/orderController");

router.post("/", auth, orderController.createOrder);
router.get("/", auth, orderController.getOrders);
router.put("/:orderId/status", auth, orderController.updateOrderStatus);

module.exports = router;
