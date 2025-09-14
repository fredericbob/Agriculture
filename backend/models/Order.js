const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Buyer = require("./Buyer");

const Order = sequelize.define("app_order", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  buyer_id: { type: DataTypes.UUID, allowNull: false },
  producer_id: { type: DataTypes.UUID },
  status: { type: DataTypes.ENUM('draft','placed','confirmed','shipped','delivered','cancelled'), defaultValue: 'draft' },
  total_amount: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  currency: { type: DataTypes.STRING, defaultValue: "MGA" }
}, { tableName: "app_order", timestamps: true, underscored: true });


Order.belongsTo(Buyer, { foreignKey: "buyer_id", as: "buyer" });

module.exports = Order;
