const jwtAuth = (roles = []) => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Accès refusé ! Aucun token fourni" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      req.user = decoded; 

      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Accès interdit. Rôles acceptés: ${roles.join(", ")} | Rôle reçu: ${req.user.role}`,
        });
      }

      next();
    } catch (error) {
      return res.status(403).json({ message: "Token expiré ou invalide" });
    }
  };
};

module.exports = jwtAuth;
