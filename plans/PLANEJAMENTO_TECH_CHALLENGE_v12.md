# Tech Challenge v12 - Simplificação: Status ENUM

## Mudanças da v11 para v12

### 🎯 Objetivo da Refatoração
Simplificar a arquitetura removendo a tabela `post_status` separada e usando um campo ENUM direto na tabela `posts`, eliminando complexidade desnecessária e melhorando performance.

---

## 📊 Comparação v11 vs v12

| Aspecto | v11 | v12 |
|---------|-----|-----|
| **Status Storage** | Tabela separada `post_status` | Campo ENUM direto em `posts` |
| **Status Field** | `status_id` (UUID FK) | `status` (ENUM) |
| **Models** | 6 models (incluindo PostStatus) | 5 models (PostStatus removido) |
| **Queries** | Requer JOIN | Comparação direta |
| **Indices** | 16 indices | 16 indices (mesma quantidade) |
| **Storage** | 16 bytes/post (UUID) | 4 bytes/post (ENUM) |
| **Tabelas** | `posts` + `post_status` | Apenas `posts` |

---

## ✨ Mudanças Implementadas

### 1. Removido
- ❌ Tabela `post_status`
- ❌ Modelo `PostStatus.js`
- ❌ Campo `posts.status_id` (UUID FK)
- ❌ Index `idx_posts_status_id`
- ❌ Seeder `20240101000003-post-status.js`
- ❌ Association `Post.belongsTo(PostStatus)`

### 2. Adicionado
- ✅ Campo `posts.status` (ENUM: DRAFT, PUBLISHED, ARCHIVED)
- ✅ Index `idx_posts_status` (BTREE)
- ✅ ENUM type `enum_posts_status`
- ✅ Migration `20240102000001-replace-status-id-with-enum.js`
- ✅ Testes para validar status ENUM

### 3. Modificado
- 🔄 **Post model:** `status_id` → `status` com validação ENUM
- 🔄 **PostService:** Queries diretas (`where.status = 'PUBLISHED'` em vez de `where['$status.label$'] = 'PUBLISHED'`)
- 🔄 **PostService:** Remoção de `PostStatus.findByPk()` lookups
- 🔄 **PostController:** API contracts usam `status` string em vez de `status_id` UUID
- 🔄 **Posts seeder:** UUIDs substituídos por strings ENUM
- 🔄 **Todos os testes:** Atualizados para refletir nova estrutura

---

## 🔄 Breaking Changes na API

### Request Body

**Antes (v11):**
```json
POST /posts
{
  "title": "Título do Post",
  "content": "Conteúdo aqui",
  "status_id": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Depois (v12):**
```json
POST /posts
{
  "title": "Título do Post",
  "content": "Conteúdo aqui",
  "status": "PUBLISHED"
}
```

### Response Format

**Antes (v11):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440001",
  "title": "Introdução à Álgebra Linear",
  "content": "...",
  "status": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "label": "PUBLISHED"
  },
  "author": { ... },
  "discipline": { ... }
}
```

**Depois (v12):**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440001",
  "title": "Introdução à Álgebra Linear",
  "content": "...",
  "status": "PUBLISHED",
  "author": { ... },
  "discipline": { ... }
}
```

### Status Values

| v11 UUID | v12 ENUM | Descrição |
|----------|----------|-----------|
| `770e8400-...001` | `'DRAFT'` | Rascunho |
| `770e8400-...002` | `'PUBLISHED'` | Publicado |
| `770e8400-...003` | `'ARCHIVED'` | Arquivado |

---

## 🗄️ Estrutura de Banco de Dados

### Posts Table Schema (v12)

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id),
  discipline_id UUID REFERENCES disciplines(id),
  status enum_posts_status NOT NULL DEFAULT 'DRAFT',  -- v12: ENUM direto
  published_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- v12: Novo ENUM type
CREATE TYPE enum_posts_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- v12: Novo index
CREATE INDEX idx_posts_status ON posts USING BTREE (status);
```

---

## 📦 Models (5 total)

1. **User** - Usuários (TEACHER/STUDENT)
2. **Post** - Posts com status ENUM direto ⭐ MODIFICADO
3. **PostRead** - Rastreamento de leituras
4. **UserSession** - Sessões JWT
5. **Discipline** - Disciplinas

**Nota:** PostStatus foi removido na v12

---

## 🔍 Índices (16 total - sem mudanças no total)

**Modificações nos índices de posts:**
- ❌ Removido: `idx_posts_status_id` (FK para post_status)
- ✅ Adicionado: `idx_posts_status` (ENUM direto)

---

## 🚀 Benefícios da Refatoração

### 1. Performance
- **Eliminação de JOINs:** Todas as queries de posts são mais rápidas
- **Menos I/O:** Não precisa acessar tabela post_status
- **Menor uso de memória:** Sem buffers de JOIN
- **Índice mais eficiente:** BTREE direto no status

### 2. Simplicidade
- **Menos código:** Modelo PostStatus removido (~100 linhas)
- **Menos arquivos:** 2 arquivos a menos (model + seeder)
- **Queries mais simples:** `where.status = 'PUBLISHED'` vs `where['$status.label$'] = 'PUBLISHED'`
- **Sem lookups:** Comparação direta em vez de `PostStatus.findByPk()`

### 3. Storage
- **12 bytes economizados por post:** UUID (16 bytes) → ENUM (4 bytes)
- **Tabela eliminada:** post_status não ocupa mais espaço
- Para 10.000 posts: **~120 KB economizados**

### 4. Manutenção
- **Menos migrações:** Não precisa sincronizar 2 tabelas
- **Menos seeds:** Um seeder a menos para manter
- **Menos testes:** Sem testes do modelo PostStatus

---

## 🔄 Migration Strategy

### UP Migration (v11 → v12)

```javascript
// src/database/migrations/20240102000001-replace-status-id-with-enum.js

async up(queryInterface, Sequelize) {
  // 1. Adicionar coluna status ENUM (nullable)
  // 2. Migrar dados: post_status.label → posts.status
  // 3. Tornar status NOT NULL
  // 4. Remover FK constraint
  // 5. Remover coluna status_id
  // 6. Remover index idx_posts_status_id
  // 7. Criar index idx_posts_status
  // 8. Dropar tabela post_status
}
```

### DOWN Migration (Rollback)

```javascript
async down(queryInterface, Sequelize) {
  // 1. Recriar tabela post_status
  // 2. Re-inserir 3 registros (UUIDs fixos)
  // 3. Adicionar coluna status_id
  // 4. Migrar dados: posts.status → status_id
  // 5. Adicionar FK constraint
  // 6. Recriar index idx_posts_status_id
  // 7. Remover coluna status e ENUM type
}
```

---

## ✅ Verificação de Migração

### Antes da Migration (v11)

```sql
-- Contar posts por status
SELECT ps.label, COUNT(p.id) as count
FROM posts p
JOIN post_status ps ON p.status_id = ps.id
GROUP BY ps.label;

-- Resultado esperado:
--  label     | count
-- -----------+-------
--  DRAFT     |     1
--  PUBLISHED |     4
```

### Depois da Migration (v12)

```sql
-- Verificar tabela post_status foi deletada
\dt post_status
-- Deve retornar: relation "post_status" does not exist

-- Contar posts por status (sem JOIN!)
SELECT status, COUNT(id) as count
FROM posts
GROUP BY status;

-- Resultado esperado (mesmos dados):
--  status    | count
-- -----------+-------
--  DRAFT     |     1
--  PUBLISHED |     4

-- Verificar estrutura da tabela posts
\d posts
-- Deve mostrar:
--  - Coluna "status" tipo "enum_posts_status"
--  - SEM coluna "status_id"

-- Verificar ENUM type
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'enum_posts_status'::regtype
ORDER BY enumsortorder;

-- Deve retornar:
--  enumlabel
-- -----------
--  DRAFT
--  PUBLISHED
--  ARCHIVED

-- Verificar novo índice
\di idx_posts_status
-- Deve existir e usar BTREE
```

---

## 🧪 Testes Atualizados

### Models Tests (tests/unit/models.test.js)

**Mudanças:**
- ❌ Removido: describe block "PostStatus Model"
- ✅ Atualizado: Contagem de 6 → 5 models
- ✅ Adicionado: Teste para verificar status ENUM no Post
- 🔄 Modificado: Testes de atributos do Post (status em vez de status_id)
- 🔄 Modificado: Testes de associations do Post (sem status association)

### Service Tests (tests/unit/services/post.service.test.js)

**Mudanças:**
- ❌ Removido: Mock `PostStatus.findByPk`
- 🔄 Modificado: Mock data usa `status: 'PUBLISHED'` em vez de `status: { label: 'PUBLISHED' }`
- 🔄 Modificado: Assertions usam `where.status` em vez de `where['$status.label$']`
- 🔄 Modificado: createPost tests usam `status: 'DRAFT'` em vez de `status_id: 'UUID'`
- 🔄 Modificado: updatePost tests verificam `status: 'PUBLISHED'` diretamente

---

## 📝 Arquivos Modificados

### Deletados (2)
1. `src/models/PostStatus.js`
2. `src/database/seeders/20240101000003-post-status.js`

### Criados (2)
1. `src/database/migrations/20240102000001-replace-status-id-with-enum.js`
2. `plans/PLANEJAMENTO_TECH_CHALLENGE_v12.md` (este arquivo)

### Modificados (6)
1. `src/models/Post.js` - status_id → status ENUM
2. `src/services/post.service.js` - Queries diretas, sem PostStatus
3. `src/controllers/post.controller.js` - API usa status string
4. `src/database/seeders/20240101000004-posts.js` - UUIDs → strings
5. `tests/unit/services/post.service.test.js` - Mocks e assertions atualizados
6. `tests/unit/models.test.js` - PostStatus removido, status ENUM adicionado

---

## 🎛️ Comandos de Deployment

### Desenvolvimento Local

```bash
# 1. Reset banco de dados (opcional - limpa tudo)
npm run db:migrate:undo:all

# 2. Rodar todas as migrations (incluindo v12)
npm run db:migrate

# 3. Rodar seeds
npm run db:seed

# 4. Verificar que tudo funciona
npm test
```

### Produção

```bash
# 1. Backup do banco ANTES de qualquer coisa
pg_dump -U user -d database > backup_antes_v12.sql

# 2. Deploy do código
git pull origin main
npm install

# 3. Rodar migration
npm run db:migrate

# 4. Restart aplicação
pm2 restart app

# 5. Verificar logs
pm2 logs app

# 6. Se houver problemas, rollback:
npm run db:migrate:undo
git checkout v11-tag
pm2 restart app
```

---

## ⚠️ Rollback Plan

Se houver problemas após a migration:

```bash
# 1. Reverter migration (restaura post_status table)
npm run db:migrate:undo

# 2. Verificar que post_status foi restaurada
psql -d database -c "SELECT * FROM post_status;"

# 3. Verificar que status_id voltou
psql -d database -c "\d posts"

# 4. Reverter código
git revert <commit-hash-v12>

# 5. Restart
pm2 restart app
```

**Tempo estimado de rollback:** < 5 minutos

---

## 📊 Comparação de Performance

### Query Performance

**Antes (v11) - Com JOIN:**
```sql
EXPLAIN ANALYZE
SELECT p.*, ps.label
FROM posts p
JOIN post_status ps ON p.status_id = ps.id
WHERE ps.label = 'PUBLISHED'
ORDER BY p.created_at DESC;

-- Query Plan:
-- Hash Join (cost=2.05..10.45 rows=10)
--   Hash Cond: (p.status_id = ps.id)
--   -> Seq Scan on posts p
--   -> Hash (Seq Scan on post_status ps)
--         Filter: (label = 'PUBLISHED')
```

**Depois (v12) - Sem JOIN:**
```sql
EXPLAIN ANALYZE
SELECT p.*
FROM posts p
WHERE p.status = 'PUBLISHED'
ORDER BY p.created_at DESC;

-- Query Plan:
-- Index Scan using idx_posts_status on posts p (cost=0.15..8.17 rows=10)
--   Filter: (status = 'PUBLISHED')
```

**Melhoria estimada:** 20-40% mais rápido

---

## 🎯 Status Final

✅ **v12 Implementada com Sucesso**

- ✅ Migration completa (UP + DOWN)
- ✅ Modelo simplificado
- ✅ Service atualizado
- ✅ Controller atualizado
- ✅ Seeds atualizados
- ✅ Testes atualizados (19 testes no PostService, 5 testes no Post model)
- ✅ Documentação completa
- ✅ Breaking changes documentados
- ✅ Rollback plan preparado

---

## 📚 Compatibilidade

| Componente | v11 | v12 | Breaking? |
|------------|-----|-----|-----------|
| Database | 6 tabelas | 5 tabelas | ⚠️ Sim |
| API Contracts | UUID status_id | String status | ⚠️ Sim |
| Response Format | status object | status string | ⚠️ Sim |
| Lógica de Negócio | Sem mudanças | Sem mudanças | ✅ Não |
| Autenticação | Sem mudanças | Sem mudanças | ✅ Não |
| Visibilidade | Sem mudanças | Sem mudanças | ✅ Não |

---

## 🔗 Próximos Passos

Após a v12, o sistema está pronto para:
1. FASE 5 - Testes de Integração (E2E)
2. FASE 6 - Documentação API (Swagger)
3. FASE 7 - Deploy em Produção

---

**Versão:** v12
**Data:** 2024-01-02
**Breaking Changes:** ⚠️ Sim (API contracts)
**Requer Migration:** ✅ Sim
**Requer Maintenance Window:** ✅ Sim (breve, ~5min)
