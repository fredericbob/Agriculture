const express = require("express");
const router = express.Router();
const orderService = require("../services/orderService");

router.post("/", async (req, res) => {
  try {
    const result = await orderService.createOrder(req.body, req);
    res.json({ message: "Commande créée avec succès", ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
