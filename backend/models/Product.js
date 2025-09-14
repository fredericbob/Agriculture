const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Product = sequelize.define("product", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  producer_id: { type: DataTypes.UUID, allowNull: false },
  culture_id: { type: DataTypes.UUID },
  titre: { type: DataTypes.TEXT, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  quantity_available: { type: DataTypes.DECIMAL(12,3), allowNull: false, defaultValue: 0 },
  unit: { type: DataTypes.STRING, defaultValue: "kg" },
  image_urls: { type: DataTypes.ARRAY(DataTypes.TEXT) },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: "product", timestamps: true, underscored: true });

module.exports = Product;
