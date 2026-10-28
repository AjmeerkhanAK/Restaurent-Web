const mongoose = require("mongoose");
const Food = require("../models/Food");
const Order = require("../models/Order");

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !address ||
      paymentMethod !== "COD"
    ) {
      return res.status(400).json({
        message: "Valid items, address and payment method are required"
      });
    }

    const requiredAddressFields = [
      "fullName",
      "phone",
      "street",
      "city",
      "pincode"
    ];

    for (const field of requiredAddressFields) {
      if (
        typeof address[field] !== "string" ||
        !address[field].trim()
      ) {
        return res.status(400).json({
          message: `Address field ${field} is required`
        });
      }
    }

    // Validate IDs and quantities before querying MongoDB.
    const quantities = new Map();

    for (const item of items) {
      if (
        !mongoose.isValidObjectId(item.food) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 50
      ) {
        return res.status(400).json({
          message: "Invalid food ID or quantity"
        });
      }

      const id = item.food.toString();
      quantities.set(id, (quantities.get(id) || 0) + item.quantity);

      if (quantities.get(id) > 50) {
        return res.status(400).json({
          message: "Maximum quantity per food item is 50"
        });
      }
    }

    const foodIds = [...quantities.keys()];
    const foods = await Food.find({
      _id: { $in: foodIds },
      isAvailable: true
    });

    if (foods.length !== foodIds.length) {
      return res.status(400).json({
        message: "One or more food items are unavailable"
      });
    }

    const foodMap = new Map(
      foods.map((food) => [food._id.toString(), food])
    );

    const orderItems = foodIds.map((id) => {
      const food = foodMap.get(id);

      return {
        food: food._id,
        name: food.name,
        price: food.price,
        quantity: quantities.get(id)
      };
    });

    // Always calculate prices on the backend.
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      address: {
        fullName: address.fullName.trim(),
        phone: address.phone.trim(),
        street: address.street.trim(),
        city: address.city.trim(),
        pincode: address.pincode.trim()
      },
      totalAmount,
      paymentMethod: "COD"
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to place order"
    });
  }
};

// GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders"
    });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    const isOwner = order.user.toString() === req.user._id.toString();

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You cannot access this order"
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order"
    });
  }
};

// GET /api/orders — admin only
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders"
    });
  }
};

// PATCH /api/orders/:id/status — admin only
exports.updateOrderStatus = async (req, res) => {
  try {
    const allowedStatuses = [
      "CONFIRMED",
      "PREPARING",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED"
    ];

    const { orderStatus } = req.body;

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid order status"
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (
      order.orderStatus === "DELIVERED" ||
      order.orderStatus === "CANCELLED"
    ) {
      return res.status(400).json({
        message: "This order can no longer be updated"
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update order status"
    });
  }
};