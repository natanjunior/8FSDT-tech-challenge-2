const express = require('express');
const router = express.Router();
const PostReadController = require('../controllers/postRead.controller');
const { authenticate } = require('../middlewares/authenticate');

// POST /posts/:id/read (autenticado - todos podem marcar)
router.post('/:id/read', authenticate, PostReadController.markAsRead);

// GET /posts/:id/read (autenticado - todos podem verificar)
router.get('/:id/read', authenticate, PostReadController.checkIfRead);

module.exports = router;
