const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Producer = sequelize.define(
  "producer",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID },
    organisation: { type: DataTypes.STRING },
    region: { type: DataTypes.STRING },
    parcelle_nom: { type: DataTypes.STRING }
  },
  { tableName: "producer", timestamps: true, underscored: true }
);

module.exports = Producer;
