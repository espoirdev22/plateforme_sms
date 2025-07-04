const Message = require('../models/Message');
const orangeAPI = require('../services/orangeAPI');

class SMSController {
  // Envoi de SMS en lot
  static async sendBulkSMS(req, res) {
    try {
      const { phoneNumbers, message } = req.body;
      const userId = req.user.id;
      
      if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
        return res.status(400).json({ error: 'Liste de numéros requise' });
      }

      if (phoneNumbers.length > 100) {
        return res.status(400).json({ error: 'Maximum 100 numéros par envoi' });
      }

      const results = [];
      
      for (const phoneNumber of phoneNumbers) {
        try {
          const cleanPhone = phoneNumber.replace(/\D/g, '');
          
          // Créer l'enregistrement en base
          const messageRecord = await Message.create({
            userId,
            phoneNumber: cleanPhone,
            messageText: message,
            direction: 'sent',
            status: 'pending'
          });

          // Envoyer via Orange API
          const result = await orangeAPI.sendSMS(cleanPhone, message);
          
          if (result.success) {
            await Message.updateStatus(messageRecord.id, 'sent');
            results.push({
              phoneNumber: cleanPhone,
              success: true,
              messageId: messageRecord.id
            });
          } else {
            await Message.updateStatus(messageRecord.id, 'failed');
            results.push({
              phoneNumber: cleanPhone,
              success: false,
              error: result.error,
              messageId: messageRecord.id
            });
          }
        } catch (error) {
          results.push({
            phoneNumber,
            success: false,
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      res.json({
        message: `Envoi terminé: ${successCount} succès, ${failCount} échecs`,
        results,
        summary: {
          total: results.length,
          success: successCount,
          failed: failCount
        }
      });
    } catch (error) {
      console.error('Erreur envoi en lot:', error);
      res.status(500).json({ error: 'Erreur lors de l\'envoi en lot' });
    }
  }

  // Programmer un SMS
  static async scheduleSMS(req, res) {
    try {
      // Cette fonctionnalité nécessiterait un système de queue (Redis + Bull)
      // Pour l'instant, on retourne une réponse d'exemple
      res.status(501).json({ 
        error: 'Fonctionnalité de programmation pas encore implémentée',
        message: 'Utilisez un système de queue comme Bull avec Redis'
      });
    } catch (error) {
      console.error('Erreur programmation SMS:', error);
      res.status(500).json({ error: 'Erreur lors de la programmation' });
    }
  }

  // Obtenir les templates de messages
  static async getTemplates(req, res) {
    try {
      // Templates prédéfinis (pourraient être stockés en base)
      const templates = [
        {
          id: 1,
          name: 'Bienvenue',
          content: 'Bienvenue sur notre plateforme ! Nous sommes ravis de vous compter parmi nous.',
          category: 'accueil'
        },
        {
          id: 2,
          name: 'Rappel RDV',
          content: 'Rappel: Vous avez un rendez-vous demain à [HEURE]. Merci de confirmer.',
          category: 'rappel'
        },
        {
          id: 3,
          name: 'Promotion',
          content: 'Offre spéciale: -20% sur tous nos produits jusqu\'au [DATE]. Code: PROMO20',
          category: 'marketing'
        },
        {
          id: 4,
          name: 'Confirmation',
          content: 'Votre commande #[NUMERO] a été confirmée. Livraison prévue le [DATE].',
          category: 'confirmation'
        }
      ];

      res.json({ templates });
    } catch (error) {
      console.error('Erreur templates:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des templates' });
    }
  }
}

module.exports = SMSController;