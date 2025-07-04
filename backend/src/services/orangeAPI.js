const axios = require('axios');

class OrangeAPIService {
  constructor() {
    this.clientId = process.env.ORANGE_CLIENT_ID;
    this.clientSecret = process.env.ORANGE_CLIENT_SECRET;
    this.baseURL = process.env.ORANGE_API_BASE_URL;
    this.oauthURL = process.env.ORANGE_OAUTH_URL;
    this.smsURL = process.env.ORANGE_SMS_URL;
  }

  // Obtenir un token d'accès Orange
  async getAccessToken() {
    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(this.oauthURL, 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Erreur obtention token Orange:', error.response?.data || error.message);
      throw new Error('Impossible d\'obtenir le token Orange');
    }
  }

  // Envoyer un SMS
  async sendSMS(phoneNumber, message, senderName = 'SMSPlatform') {
    try {
      /*const token = await this.getAccessToken();
  
      // L'adresse expéditeur en format requis (exemple : 'tel:+221780000000')
      const senderAddress = `tel:+221776716206`; // Remplace par ton numéro valide Orange ou un nom d'expéditeur validé
  
      const url = `${this.smsURL}/${senderAddress}/requests`;
  
      const payload = {
        outboundSMSMessageRequest: {
          address: [`tel:+${phoneNumber.replace(/\D/g, '')}`],
          senderAddress: senderAddress,
          outboundSMSTextMessage: {
            message: message
          }
        }
      };*/
      const token = await this.getAccessToken();

      // Si senderName est un numéro, formate-le
      const senderAddress = senderName.startsWith('tel:') 
        ? senderName 
        : `tel:+${senderName.replace(/\D/g, '')}`;
    
      const url = `${this.smsURL}/${senderAddress}/requests`;
    
      const payload = {
        outboundSMSMessageRequest: {
          address: [`tel:+${phoneNumber.replace(/\D/g, '')}`],
          senderAddress: senderAddress,
          outboundSMSTextMessage: {
            message: message
          }
        }
      };
  
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      return {
        success: true,
        messageId: response.data.outboundSMSMessageRequest.resourceURL,
        data: response.data
      };
    } catch (error) {
      console.error('Erreur envoi SMS Orange:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.requestError?.serviceException?.text || 'Erreur envoi SMS'
      };
    }
  }
  
  // Vérifier le statut d'un SMS
  async getSMSStatus(messageId) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(messageId, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Erreur statut SMS:', error.response?.data || error.message);
      throw new Error('Impossible de récupérer le statut');
    }
  }
}

module.exports = new OrangeAPIService();