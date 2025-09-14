const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Buyer = sequelize.define("buyer", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  organisation: DataTypes.TEXT,
  adresse: DataTypes.TEXT
}, { tableName: "buyer", timestamps: true, underscored: true });

module.exports = Buyer;
