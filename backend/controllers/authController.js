const User = require('../models/user'); 
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

if (!process.env.JWT_KEY) {
  throw new Error("JWT_KEY n'est pas défini dans le .env");
}
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Identifiants incorrects" });

    const isValid = await user.verifyPassword(password);
    if (!isValid) return res.status(400).json({ message: " difeerent" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role,display_name: user.display_name },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login };
