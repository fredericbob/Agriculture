const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");

const  Buyer  = require("../models/Buyer");
const jwt = require("jsonwebtoken");

const getBuyerIdFromToken = async (req) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) throw new Error("Token manquant");
  
  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  const decoded = jwt.verify(token, process.env.JWT_KEY);

  if (decoded.role !== "acheteur") throw new Error("Seul un acheteur peut passer une commande");

  const buyer = await Buyer.findOne({ where: { user_id: decoded.id } });
  if (!buyer) throw new Error("Compte buyer non trouvé");

  return buyer.id; 
};



exports.createOrder = async (data, req) => {
  const buyer_id = await getBuyerIdFromToken(req);


  if (data.items && Array.isArray(data.items)) {
    let total_amount = 0;

   
    for (const item of data.items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) throw new Error(`Produit ${item.product_id} non trouvé`);

      if (parseFloat(product.quantity_available) < parseFloat(item.quantity)) {
        throw new Error(`Stock insuffisant pour le produit ${product.titre}`);
      }

      total_amount += parseFloat(product.price) * parseFloat(item.quantity);
    }

    const order = await Order.create({
      buyer_id,
      producer_id: null, 
      total_amount
    });
    for (const item of data.items) {
      const product = await Product.findByPk(item.product_id);

      await OrderItem.create({
        order_id: order.id,
        product_id: product.id,
        quantity: item.quantity,
        unit_price: product.price
      });

      console.log(`Produit ${product.titre} - Stock avant :`, product.quantity_available);
      product.quantity_available = parseFloat(product.quantity_available) - parseFloat(item.quantity);
      await product.save();
      console.log(`Produit ${product.titre} - Stock après :`, product.quantity_available);
    }

    return { order };
  }

  if (data.product_id && data.quantity) {
    const product = await Product.findByPk(data.product_id);
    if (!product) throw new Error("Produit non trouvé");

    if (parseFloat(product.quantity_available) < parseFloat(data.quantity)) {
      throw new Error("Stock insuffisant");
    }

    const total_amount = parseFloat(product.price) * parseFloat(data.quantity);

    const order = await Order.create({
      buyer_id,
      producer_id: product.producer_id,
      total_amount
    });

    const orderItem = await OrderItem.create({
      order_id: order.id,
      product_id: product.id,
      quantity: data.quantity,
      unit_price: product.price
    });

    console.log(`Produit ${product.titre} - Stock avant :`, product.quantity_available);
    product.quantity_available = parseFloat(product.quantity_available) - parseFloat(data.quantity);
    await product.save();
    console.log(`Produit ${product.titre} - Stock après :`, product.quantity_available);

    return { order, orderItem };
  }

  throw new Error("Format de commande invalide");
};
