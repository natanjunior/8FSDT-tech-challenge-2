const express = require('express');
const router = express.Router();
const DisciplineController = require('../controllers/discipline.controller');
const { authenticate } = require('../middlewares/authenticate');

// GET /disciplines (autenticado - todos podem listar)
router.get('/', authenticate, DisciplineController.listAll);

module.exports = router;
