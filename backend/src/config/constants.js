// Statuts des messages
const MESSAGE_STATUS = {
    PENDING: 'pending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    FAILED: 'failed',
    RECEIVED: 'received'
  };
  
  // Types de direction des messages
  const MESSAGE_DIRECTION = {
    SENT: 'sent',
    RECEIVED: 'received'
  };
  
  // Limites de l'application
  const LIMITS = {
    SMS_LENGTH: 160,
    BULK_SMS_MAX: 100,
    MESSAGES_PER_PAGE: 50,
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX: 100
  };
  
  // Codes d'erreur Orange API
  const ORANGE_ERROR_CODES = {
    INVALID_PHONE: 'SVC0001',
    QUOTA_EXCEEDED: 'SVC0002',
    UNAUTHORIZED: 'SVC0003',
    INVALID_MESSAGE: 'SVC0004'
  };
  
  // Messages d'erreur personnalisés
  const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
    USER_NOT_FOUND: 'Utilisateur non trouvé',
    UNAUTHORIZED: 'Accès non autorisé',
    INVALID_TOKEN: 'Token invalide ou expiré',
    SMS_SEND_FAILED: 'Échec de l\'envoi du SMS',
    INVALID_PHONE_FORMAT: 'Format de numéro de téléphone invalide',
    MESSAGE_TOO_LONG: `Message trop long (max ${LIMITS.SMS_LENGTH} caractères)`,
    BULK_LIMIT_EXCEEDED: `Trop de numéros (max ${LIMITS.BULK_SMS_MAX})`,
    RATE_LIMIT_EXCEEDED: 'Trop de requêtes, veuillez patienter'
  };
  
  // Configuration Orange API
  const ORANGE_CONFIG = {
    API_VERSION: 'v1',
    TIMEOUT: 30000, // 30 secondes
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 seconde
  };
  
  module.exports = {
    MESSAGE_STATUS,
    MESSAGE_DIRECTION,
    LIMITS,
    ORANGE_ERROR_CODES,
    ERROR_MESSAGES,
    ORANGE_CONFIG
  };