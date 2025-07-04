const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

// Webhook pour réception de SMS depuis Orange
router.post('/sms', async (req, res) => {
  try {
    console.log('Webhook SMS reçu:', req.body);
    
    // Structure typique d'un webhook Orange SMS
    const { 
      inboundSMSMessageList 
    } = req.body;

    if (inboundSMSMessageList && inboundSMSMessageList.inboundSMSMessage) {
      const messages = inboundSMSMessageList.inboundSMSMessage;
      
      for (const smsData of messages) {
        const phoneNumber = smsData.senderAddress.replace('tel:+', '');
        const messageText = smsData.message;
        const dateTime = smsData.dateTime;

        // Ici, vous devriez déterminer à quel utilisateur appartient ce SMS
        // Pour l'exemple, nous utilisons un utilisateur par défaut
        // Dans un vrai système, vous pourriez avoir une table de mapping des numéros
        
        await Message.create({
          userId: 1, // À adapter selon votre logique métier
          phoneNumber,
          messageText,
          direction: 'received',
          status: 'received'
        });

        console.log(`SMS reçu de ${phoneNumber}: ${messageText}`);
      }
    }

    // Répondre à Orange que le webhook a été traité
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Erreur webhook SMS:', error);
    res.status(500).json({ error: 'Erreur traitement webhook' });
  }
});

// Webhook pour notifications de livraison
router.post('/delivery', async (req, res) => {
  try {
    console.log('Webhook livraison reçu:', req.body);
    
    const { 
      deliveryInfoList 
    } = req.body;

    if (deliveryInfoList && deliveryInfoList.deliveryInfo) {
      const deliveries = deliveryInfoList.deliveryInfo;
      
      for (const delivery of deliveries) {
        const { 
          address, 
          deliveryStatus,
          description 
        } = delivery;

        // Mettre à jour le statut du message correspondant
        // Vous devriez avoir une logique pour identifier le message concerné
        console.log(`Livraison pour ${address}: ${deliveryStatus} - ${description}`);
      }
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Erreur webhook livraison:', error);
    res.status(500).json({ error: 'Erreur traitement webhook livraison' });
  }
});

// Test webhook (pour développement)
router.post('/test', (req, res) => {
  console.log('Test webhook reçu:', req.body);
  res.json({ 
    message: 'Webhook test reçu avec succès',
    data: req.body,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;