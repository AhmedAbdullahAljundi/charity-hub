const express = require('express');
const authController = require('./auth.controller');
const { requireAuth } = require('../../middleware/auth');
const { loginLimiter, forgotPasswordLimiter } = require('../../middleware/rateLimit');

const { loginSchema, refreshSchema } = require('../../shared/validators/auth.validator');
const { validate } = require('../../middleware/validate');

const router = express.Router();

router.post('/login',           loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh',         validate(refreshSchema), authController.refresh);
router.post('/logout',          authController.logout);
router.get('/me',               requireAuth, authController.me);
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/change-password', requireAuth, authController.changePassword);

module.exports = router;
