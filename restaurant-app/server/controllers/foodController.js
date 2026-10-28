const mongoose = require("mongoose");
const Food = require("../models/Food");

// GET /api/foods?search=chicken&category=Biryani
exports.getFoods = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i"
      };
    }

    if (category) {
      filter.category = category;
    }

    const foods = await Food.find(filter).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch food items"
    });
  }
};

// GET /api/foods/:id
exports.getFoodById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid food ID"
      });
    }

    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found"
      });
    }

    res.json({ success: true, food });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch food"
    });
  }
};

// POST /api/foods
exports.createFood = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      price === "" ||
      price === null ||
      price === undefined ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        message: "Valid name, category and price are required"
      });
    }

    const food = await Food.create({
      name: name.trim(),
      description,
      price: Number(price),
      category: category.trim(),
      image
    });

    res.status(201).json({
      success: true,
      food
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create food"
    });
  }
};

// PUT /api/foods/:id
exports.updateFood = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid food ID"
      });
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "category",
      "image",
      "isAvailable"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const food = await Food.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!food) {
      return res.status(404).json({
        message: "Food not found"
      });
    }

    res.json({ success: true, food });
  } catch (error) {
    res.status(400).json({
      message: "Could not update food"
    });
  }
};

// DELETE /api/foods/:id
exports.deleteFood = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid food ID"
      });
    }

    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found"
      });
    }

    res.json({
      success: true,
      message: "Food deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete food"
    });
  }
};