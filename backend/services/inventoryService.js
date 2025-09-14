const Inventory = require("../models/Inventory");

exports.getAllStocks = async () => {
  return await Inventory.findAll({ include: "product" });
};
