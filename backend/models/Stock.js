const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("./Product");

const Stock = sequelize.define("Stock", {
  quantite: { type: DataTypes.INTEGER, allowNull: false }
});

Stock.belongsTo(Product, { foreignKey: "produitId" });

module.exports = Stock;
