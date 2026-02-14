# 📊 Análise de Performance

## Índices Implementados (16 total)

### Users (3)
- `idx_users_email` (UNIQUE) - Login
- `idx_users_role` - Filtro por role
- `idx_users_created_at` - Ordenação

### Posts (6)
- `idx_posts_author_id` - FK
- `idx_posts_discipline_id` - FK
- `idx_posts_status` - Filtro por status ENUM
- `idx_posts_created_at` - Ordenação
- `idx_posts_published_at` - Ordenação
- `idx_posts_title_search` (GIN) - Full-text search

### Post Reads (3)
- `idx_post_reads_post_id` - FK
- `idx_post_reads_user_id` - FK
- `idx_post_reads_unique` (UNIQUE) - Composite

### User Sessions (2)
- `idx_user_sessions_user_id` - FK
- `idx_user_sessions_expires_at` - Cleanup job

### Disciplines (1)
- `idx_disciplines_label` (UNIQUE) - Busca

## Análise EXPLAIN ANALYZE

Execute: `psql -U postgres -d blog_api_dev -f scripts/performance/analyze-indexes.sql`

### Resultado Esperado

Todos os índices devem ser utilizados nas queries:
- Index Scan (não Seq Scan)
- Cost baixo
- Execution time < 10ms

## Benchmark de Endpoints

Execute: `node scripts/performance/benchmark-endpoints.js`

### Metas de Performance

| Endpoint | Meta P95 | Meta Média |
|----------|----------|------------|
| GET /posts | < 100ms | < 50ms |
| GET /posts/:id | < 50ms | < 20ms |
| GET /posts/search | < 150ms | < 80ms |
| POST /posts | < 100ms | < 50ms |
| GET /disciplines | < 30ms | < 10ms |

## Otimizações Aplicadas

1. **Índices estratégicos** - 16 índices cobrindo queries comuns
2. **GIN Index** - Full-text search em português
3. **Composite Index** - post_reads (post_id, user_id)
4. **PostgreSQL config** - Tuning de memória e cache

## Scripts de Performance

```bash
# Analisar todos os índices
npm run perf:analyze

# Otimizar queries específicas
npm run perf:queries

# Aplicar configurações PostgreSQL
npm run perf:config

# Benchmark de endpoints
npm run perf:benchmark

# Executar todos os testes de performance
npm run perf:all
```

## Configurações PostgreSQL

As configurações otimizadas incluem:

- **shared_buffers**: 256MB (25% da RAM)
- **effective_cache_size**: 1GB (50-75% da RAM)
- **maintenance_work_mem**: 64MB
- **work_mem**: 4MB
- **wal_buffers**: 16MB
- **max_connections**: 100

Execute `npm run perf:config` para aplicar (requer restart do PostgreSQL).

## Queries Críticas Analisadas

1. **Listar Posts PUBLISHED** - STUDENT vê apenas publicados
2. **Listar Todos Posts** - TEACHER vê todos os status
3. **Busca Full-Text** - Usando índice GIN
4. **Verificar Leitura** - Composite index
5. **Validar Sessão** - Lookup de JWT
6. **Cleanup Sessões** - Remoção de expiradas

## Próximos Passos (Opcional)

- [ ] Connection pooling (pg-pool)
- [ ] Redis cache para GET /posts
- [ ] CDN para assets estáticos
- [ ] Load balancing (multiple instances)
- [ ] APM (Application Performance Monitoring)
- [ ] Query caching com materialized views

## Relatórios

Os relatórios de análise são salvos em:
- `reports/analyze-indexes.txt`
- `reports/query-optimization.txt`

Execute `npm run perf:all` para gerar os relatórios completos.
