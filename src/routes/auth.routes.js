'use strict';

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/authenticate');

/**
 * POST /auth/login
 * Login passwordless (público)
 * Body: { email }
 */
router.post('/login', (req, res) => AuthController.login(req, res));

/**
 * POST /auth/logout
 * Logout (requer autenticação)
 * Header: Authorization: Bearer <token>
 */
router.post('/logout', authenticate, (req, res) => AuthController.logout(req, res));

module.exports = router;
