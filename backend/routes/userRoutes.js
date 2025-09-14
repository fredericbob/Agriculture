const express = require("express");
const router = express.Router();
const jwtAuth = require("../middlewares/jwtAuth");
const {
  createUser,
  getUsers,
  getProducteurs,
  getBuyers,
  updateRole,
  deleteUser,
} = require("../controllers/userController");

router.get("/", getUsers);

router.post("/", createUser);

router.get("/producteurs", getProducteurs);

router.get("/buyers", getBuyers);

router.put("/:id", jwtAuth(["manager", "producteur"]), updateRole);

router.delete("/:id", jwtAuth("manager"), deleteUser);

module.exports = router;
