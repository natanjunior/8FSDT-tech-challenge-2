require('dotenv').config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Server initialization will be implemented in FASE 7
console.log(`[${NODE_ENV}] Server setup initialized`);
console.log(`Port configured: ${PORT}`);
console.log('');
console.log('✅ FASE 1 (Setup Inicial) - CONCLUÍDA');
console.log('');
console.log('Próximo passo: Implementar FASE 2 (Models + Migrations)');
console.log('');

// TODO: Import and start Express app (FASE 7)
// const app = require('./app');
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

module.exports = {};
