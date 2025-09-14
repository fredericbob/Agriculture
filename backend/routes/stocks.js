const express = require("express");
const router = express.Router();
const { sequelize } = require("../config/db");
const Inventory = require("../models/Inventory");
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  try {
    const stocks = await Inventory.findAll({ include: { model: Product, as: "product" } });
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
