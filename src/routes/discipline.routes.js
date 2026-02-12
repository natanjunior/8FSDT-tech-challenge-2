'use strict';

const express = require('express');
const router = express.Router();
const DisciplineController = require('../controllers/discipline.controller');
const { authenticate } = require('../middlewares/authenticate');

/**
 * @swagger
 * /disciplines:
 *   get:
 *     summary: Listar disciplinas
 *     description: Retorna todas as disciplinas cadastradas, ordenadas por label (A-Z).
 *     tags: [Disciplines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de disciplinas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Discipline'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, DisciplineController.listAll);

module.exports = router;
