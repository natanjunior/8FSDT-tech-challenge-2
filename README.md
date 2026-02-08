# Tech Challenge Fase 2 - API RESTful de Blogging

API RESTful completa para professores da rede pública compartilharem conteúdo educacional.

## 🎯 Visão Geral

Sistema de blogging educacional com:
- 11 endpoints REST (CRUD posts, auth, categorias, comentários)
- Autenticação JWT com RBAC (TEACHER vs STUDENT)
- PostgreSQL + Sequelize ORM
- Soft delete para posts
- Cobertura >= 20% de testes
- Docker + CI/CD (GitHub Actions)
- Documentação Swagger

## 🛠️ Tecnologias

- **Backend:** Node.js 18+ + Express 4.18+
- **Database:** PostgreSQL 15+ + Sequelize ORM
- **Tests:** Jest 29+ + Supertest
- **Docker:** Multi-stage build
- **CI/CD:** GitHub Actions

## 📁 Estrutura do Projeto

```
8FSDT-tech-challenge-2/
├── src/
│   ├── config/          # Configurações (database, etc)
│   ├── models/          # Modelos Sequelize
│   ├── services/        # Lógica de negócio
│   ├── controllers/     # Controllers (request/response)
│   ├── middlewares/     # Middlewares (auth, validation)
│   ├── routes/          # Definição de rotas
│   ├── utils/           # Utilitários
│   └── database/
│       ├── migrations/  # Migrações do banco
│       └── seeders/     # Seeds
├── tests/
│   ├── unit/           # Testes unitários
│   └── integration/    # Testes de integração
├── plans/              # Documentação de planejamento
├── .env.example        # Template de variáveis de ambiente
├── .sequelizerc        # Configuração Sequelize CLI
├── jest.config.js      # Configuração Jest
└── package.json        # Dependências e scripts
```

## 🚀 Setup Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=tech_challenge_dev
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

### 3. Criar Banco de Dados

```bash
npm run db:create
```

### 4. Rodar Migrações

```bash
npm run db:migrate
```

### 5. Rodar Seeds (opcional)

```bash
npm run db:seed
```

## 📜 Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev          # Iniciar servidor em modo desenvolvimento (nodemon)
npm start            # Iniciar servidor em modo produção
```

### Testes

```bash
npm test             # Rodar todos os testes
npm run test:unit    # Rodar apenas testes unitários
npm run test:integration  # Rodar apenas testes de integração
npm run test:watch   # Rodar testes em modo watch
npm run test:coverage     # Rodar testes com cobertura
npm run test:ci      # Rodar testes no CI
```

### Banco de Dados

```bash
npm run db:create    # Criar banco de dados
npm run db:migrate   # Rodar migrações
npm run db:migrate:undo      # Desfazer última migração
npm run db:migrate:undo:all  # Desfazer todas migrações
npm run db:seed      # Rodar seeds
npm run db:reset     # Reset completo (undo + migrate + seed)
```

### Docker

```bash
npm run docker:up    # Subir containers
npm run docker:down  # Derrubar containers
npm run docker:logs  # Ver logs dos containers
```

### Qualidade de Código

```bash
npm run lint         # Verificar lint (ESLint)
npm run format       # Formatar código (Prettier)
```

## 📊 Cobertura de Testes

O projeto requer **mínimo de 20% de cobertura** de testes, configurado em `jest.config.js`:

- Branches: >= 20%
- Functions: >= 20%
- Lines: >= 20%
- Statements: >= 20%

Para verificar a cobertura:

```bash
npm run test:coverage
```

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NODE_ENV` | Ambiente (development, test, production) | `development` |
| `PORT` | Porta do servidor | `3000` |
| `DB_HOST` | Host do PostgreSQL | `localhost` |
| `DB_PORT` | Porta do PostgreSQL | `5432` |
| `DB_NAME` | Nome do banco de dados | `tech_challenge_dev` |
| `DB_USER` | Usuário do banco | `postgres` |
| `DB_PASSWORD` | Senha do banco | `postgres` |
| `JWT_SECRET` | Secret para JWT | - |
| `JWT_EXPIRES_IN` | Expiração do token | `7d` |
| `ALLOWED_ORIGINS` | Origins permitidos (CORS) | `*` |

## 📝 Próximos Passos

1. ✅ **Setup Inicial** (FASE 1) - Concluído
2. ✅ **Database** (FASE 2) - Concluído (6 models + 19 índices + seeds)
3. ⏳ **Services** (FASE 3) - Implementar lógica de negócio
4. ⏳ **Middlewares** (FASE 4) - Auth + Authorize
5. ⏳ **Controllers** (FASE 5) - Request/Response handlers
6. ⏳ **Routes** (FASE 6) - 11 endpoints REST
7. ⏳ **Express App** (FASE 7) - Configurar servidor
8. ⏳ **Testes** (FASE 8) - Cobertura >= 20%
9. ⏳ **Docker** (FASE 9) - Multi-stage build
10. ⏳ **CI/CD** (FASE 10) - GitHub Actions

## 📚 Documentação

- [Planejamento Completo](plans/PLANEJAMENTO_TECH_CHALLENGE_v10.md)
- [FASE 1 - Setup Completo](FASE_1_SETUP_COMPLETO.md)
- [FASE 2 - Database Completo](FASE_2_DATABASE_COMPLETO.md)
- [Diagrama do Banco de Dados](DATABASE_DIAGRAM.md)

## 👥 Equipe

8FSDT Team

## 📄 Licença

MIT
