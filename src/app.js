'use strict';

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

// Health check
app.get('/health', (req, res) => {
	res.json({ status: 'OK', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app;
