const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const { producer_id, titre, description, price, quantity_available, unit, image_urls } = req.body;

    const product = await Product.create({
      producer_id,
      titre,
      description,
      price,
      quantity_available,
      unit,
      image_urls
    });

    res.json({ message: "Produit créé avec succès", product });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
