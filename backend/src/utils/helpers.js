const formatPhoneNumber = (phoneNumber) => {
    // Supprimer tous les caractères non numériques sauf le +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Si le numéro commence par 0, le remplacer par l'indicatif pays
    if (cleaned.startsWith('0')) {
      cleaned = '+33' + cleaned.substring(1); // France par défaut
    }
    
    // S'assurer que le numéro commence par +
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  };
  
  // Vérifier si un numéro est valide
  const isValidPhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\+[1-9]\d{8,14}$/;
    return phoneRegex.test(phoneNumber);
  };
  
  // Générer un ID unique pour les messages
  const generateMessageId = () => {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };
  
  // Formater une date pour l'affichage
  const formatDate = (date) => {
    return new Date(date).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calculer le nombre de SMS nécessaires pour un message
  const calculateSMSCount = (message) => {
    const maxLength = 160;
    return Math.ceil(message.length / maxLength);
  };
  
  // Tronquer un texte
  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Valider un token JWT sans le décoder
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch (error) {
      return true;
    }
  };
  
  // Générer un mot de passe aléatoire
  const generateRandomPassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  };
  
  module.exports = {
    formatPhoneNumber,
    isValidPhoneNumber,
    generateMessageId,
    formatDate,
    calculateSMSCount,
    truncateText,
    isTokenExpired,
    generateRandomPassword
  };