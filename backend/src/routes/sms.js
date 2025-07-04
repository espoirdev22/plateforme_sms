const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const Message = require('../models/Message');
const orangeAPI = require('../services/orangeAPI');

const router = express.Router();

// Middleware d'authentification pour toutes les routes SMS
router.use(authenticateToken);

// Envoyer un SMS
router.post('/send', [
    body('phoneNumber')
      .matches(/^\+?[1-9]\d{8,14}$/)
      .withMessage('Numéro de téléphone invalide'),
    body('message')
      .isLength({ min: 1, max: 160 })
      .withMessage('Message doit faire entre 1 et 160 caractères'),
    body('sender') 
      .optional()
      .matches(/^\+?[1-9]\d{8,14}$/)
      .withMessage('Numéro d\'expéditeur invalide')
  ], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber, message, sender }= req.body;
    const userId = req.user.id;

    // Nettoyer le numéro de téléphone
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Sauvegarder le message en base avant envoi
    const messageRecord = await Message.create({
      userId,
      phoneNumber: cleanPhone,
      messageText: message,
      direction: 'sent',
      status: 'pending'
    });

    // Envoyer via l'API Orange
    const result = await orangeAPI.sendSMS(cleanPhone, message, sender || '+221776716206');

    if (result.success) {
      // Mettre à jour le message avec l'ID Orange
      await Message.updateStatus(messageRecord.id, 'sent');
      
      res.json({
        success: true,
        message: 'SMS envoyé avec succès',
        messageId: messageRecord.id,
        orangeData: result.data
      });
    } else {
      // Mettre à jour le statut en cas d'échec
      await Message.updateStatus(messageRecord.id, 'failed');
      
      res.status(400).json({
        success: false,
        error: result.error,
        messageId: messageRecord.id
      });
    }
  } catch (error) {
    console.error('Erreur envoi SMS:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du SMS' });
  }
});

// Historique des messages
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const messages = await Message.findByUserId(userId, limit, offset);
    
    res.json({
      messages,
      pagination: {
        page,
        limit,
        hasMore: messages.length === limit
      }
    });
  } catch (error) {
    console.error('Erreur historique:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
});

// Statut d'un message spécifique
router.get('/status/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    
    if (!message || message.user_id !== userId) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    res.json({ message });
  } catch (error) {
    console.error('Erreur statut message:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du statut' });
  }
});

// Statistiques utilisateur
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Message.getStats(userId);
    
    res.json({ stats });
  } catch (error) {
    console.error('Erreur statistiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Rechercher dans l'historique
router.get('/search', async (req, res) => {
  try {
    const userId = req.user.id;
    const { q, direction, status } = req.query;
    
    let query = 'SELECT * FROM messages WHERE user_id = $1';
    let params = [userId];
    let paramCount = 1;

    if (q) {
      paramCount++;
      query += ` AND (message_text ILIKE ${paramCount} OR phone_number LIKE ${paramCount})`;
      params.push(`%${q}%`);
    }

    if (direction) {
      paramCount++;
      query += ` AND direction = ${paramCount}`;
      params.push(direction);
    }

    if (status) {
      paramCount++;
      query += ` AND status = ${paramCount}`;
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const db = require('../config/database');
    const result = await db.query(query, params);
    
    res.json({ messages: result.rows });
  } catch (error) {
    console.error('Erreur recherche:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

module.exports = router;