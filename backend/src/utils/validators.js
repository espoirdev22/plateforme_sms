const { body, validationResult } = require('express-validator');

// Validation pour numéro de téléphone
const phoneValidator = body('phoneNumber')
  .matches(/^\+?[1-9]\d{8,14}$/)
  .withMessage('Format de numéro invalide (ex: +33612345678)');

// Validation pour message SMS
const messageValidator = body('message')
  .isLength({ min: 1, max: 160 })
  .withMessage('Message doit faire entre 1 et 160 caractères')
  .trim();

// Validation pour email
const emailValidator = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Email invalide');

// Validation pour mot de passe
const passwordValidator = body('password')
  .isLength({ min: 6 })
  .withMessage('Mot de passe doit faire au moins 6 caractères')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

module.exports = {
  phoneValidator,
  messageValidator,
  emailValidator,
  passwordValidator,
  handleValidationErrors
};
