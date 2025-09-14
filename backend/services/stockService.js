const Stock = require("../models/Stock");
const Product = require("../models/Product");

async function getAllStocks() {
  return await Stock.findAll({
    include: [{ model: Product, attributes: ["nom"] }]
  });
}

module.exports = { getAllStocks };
