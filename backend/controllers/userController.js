const User = require("../models/user");
const bcrypt = require("bcrypt");
const Buyer  = require("../models/Buyer");
const Producer  = require("../models/Producer");

const jwt = require('jsonwebtoken');
const createUser = async (req, res) => {
  try {
    const { email, password, display_name, phone, role, buyer, producer } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email déjà utilisé" });
    
    const newUser = await User.create({
      email,
      password_hash: password,
      display_name,
      phone,
      role
    });
    
    if (role === "acheteur") {
      await Buyer.create({
        user_id: newUser.id,
        organisation: buyer?.organisation || "",
        adresse: buyer?.adresse || ""
      });
    } else if (role === "producteur") {
      await Producer.create({
        user_id: newUser.id,
        organisation: producer?.organisation || "",
        region: producer?.region || "",
        parcelle_nom: producer?.parcelle_nom || ""
      });
    }
    
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
    
    res.status(201).json({
      message: "Inscription réussie",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        display_name: newUser.display_name,
        phone: newUser.phone,
        role: newUser.role
      }
     
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password_hash"] },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProducteurs = async (req, res) => {
  try {
    const producteurs = await User.findAll({
      where: { role: "producteur" },
      attributes: { exclude: ["password_hash"] },
    });
    res.status(200).json(producteurs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBuyers = async (req, res) => {
  try {
    const buyers = await User.findAll({
      where: { role: "buyer" },
      attributes: { exclude: ["password_hash"] },
    });
    res.status(200).json(buyers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["buyer", "producteur"].includes(role)) {
      return res.status(400).json({ error: "Rôle invalide" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    user.role = role;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  getProducteurs,
  getBuyers,
  updateRole,
  deleteUser,
};
