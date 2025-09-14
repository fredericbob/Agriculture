const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Inventory = sequelize.define("inventory", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quantity: { type: DataTypes.DECIMAL(12,3), defaultValue: 0 },
  unit: { type: DataTypes.STRING, defaultValue: "kg" },
  seuil_alerte: { type: DataTypes.DECIMAL(12,3), defaultValue: 0 }
}, { timestamps: true });

module.exports = Inventory;
