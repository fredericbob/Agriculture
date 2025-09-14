const Product = require("../models/Product");
const Inventory = require("../models/Inventory");

exports.getAllProducts = async () => {
  return await Product.findAll({ include: { model: Inventory, as: "inventory" } });
};

exports.createProduct = async (data) => {
  const product = await Product.create(data);
  await Inventory.create({ productId: product.id, quantity: data.quantity_available || 0, unit: data.unit || "kg" });
  return await Product.findByPk(product.id, { include: { model: Inventory, as: "inventory" } });
};
