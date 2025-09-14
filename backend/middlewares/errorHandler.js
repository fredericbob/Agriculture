function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ success: false, message: "Erreur interne du serveur" });
}

module.exports = errorHandler;
