const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { sequelize } = require("./config/db");

const productRoutes = require("./routes/products");

const orderRoutes = require("./routes/orders");
const stockRoutes = require("./routes/stocks");


const app = express();
app.use(cors());
app.use(express.json());

app.use('/user', require('./routes/userRoutes'));
app.use('/login', require('./routes/authRoutes'));
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stocks", stockRoutes);


const PORT = process.env.PORT || 5000;


sequelize.authenticate()
  .then(() => {
    console.log("✅ PostgreSQL connecté");
    return sequelize.sync(); 
  })
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ Impossible de se connecter à PostgreSQL :", err));
