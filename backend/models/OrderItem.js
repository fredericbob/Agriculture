const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Order = require("./Order");
const Product = require("./Product");

const OrderItem = sequelize.define("order_item", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id: { type: DataTypes.UUID, allowNull: false },
  product_id: { type: DataTypes.UUID, allowNull: false },
  quantity: { type: DataTypes.DECIMAL(12,3), allowNull: false },
  unit_price: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  line_total: { 
    type: DataTypes.VIRTUAL, 
    get() { return parseFloat(this.quantity) * parseFloat(this.unit_price); } 
  }
}, { tableName: "order_item", timestamps: true, underscored: true });

OrderItem.belongsTo(Order, { foreignKey: "order_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

module.exports = OrderItem;
