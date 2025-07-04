const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
  // Générer un token JWT
  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  // Vérifier et décoder un token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token invalide');
    }
  }

  // Refresh token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token requis' });
      }

      const decoded = AuthController.verifyToken(refreshToken);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }

      const newToken = AuthController.generateToken(user.id);
      
      res.json({
        token: newToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Erreur refresh token:', error);
      res.status(401).json({ error: 'Refresh token invalide' });
    }
  }
}

module.exports = AuthController;