const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    display_name: DataTypes.STRING,
    phone: DataTypes.STRING,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    role: {
      type: DataTypes.ENUM('producteur','acheteur','admin'),
      defaultValue: 'producteur',
    }
  },
  {
    tableName: "app_user",
    timestamps: false,
  }
);
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed("password_hash")) {
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

User.prototype.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.password_hash);
};

module.exports = User;
