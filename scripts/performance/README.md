# Scripts de Performance

Scripts para análise e otimização de performance do banco de dados e API.

## Pré-requisitos

1. PostgreSQL instalado e rodando
2. Banco de dados `blog_api_dev` criado e com migrations aplicadas
3. Dados de seed carregados (para testes realistas)
4. API rodando em `http://localhost:3030`

## Scripts SQL

### 1. analyze-indexes.sql

Analisa todos os 16 índices criados no banco de dados.

```bash
npm run perf:analyze
```

**O que faz:**
- Lista todos os índices criados
- Executa EXPLAIN ANALYZE em queries que usam cada índice
- Mostra estatísticas de uso (scans, tuples read/fetched)
- Identifica índices não utilizados
- Mostra tamanho de cada índice

**Saída:** `reports/analyze-indexes.txt`

### 2. query-optimization.sql

Analisa as 6 queries mais críticas da aplicação.

```bash
npm run perf:queries
```

**Queries analisadas:**
1. Listar posts PUBLISHED (STUDENT)
2. Listar todos posts (TEACHER)
3. Busca full-text
4. Verificar se post foi lido
5. Validar sessão JWT
6. Cleanup de sessões expiradas

**Saída:** `reports/query-optimization.txt`

### 3. postgres-config.sql

Aplica configurações otimizadas no PostgreSQL.

```bash
npm run perf:config
```

**Atenção:** Algumas configurações requerem restart do PostgreSQL!

**Configurações aplicadas:**
- shared_buffers: 256MB
- effective_cache_size: 1GB
- maintenance_work_mem: 64MB
- work_mem: 4MB
- WAL settings
- Query planner tuning

## Script Node.js

### benchmark-endpoints.js

Faz benchmark de 6 endpoints críticos da API.

```bash
npm run perf:benchmark
```

**Requisitos:**
- API rodando em localhost:3030
- Usuário `joao.silva@escola.com` cadastrado

**Endpoints testados:**
- GET /posts (público)
- GET /posts (TEACHER autenticado)
- GET /posts/:id
- GET /posts/search?query=Node
- GET /disciplines
- POST /posts/:id/read

**Métricas:** média, mínimo, máximo, P95

## Executar Tudo

```bash
npm run perf:all
```

Executa análise de índices, otimização de queries e benchmark de endpoints.

## Interpretando Resultados

### EXPLAIN ANALYZE

**Bom:**
- `Index Scan` (usa índice)
- `cost` baixo (< 100)
- `execution time` < 10ms

**Ruim:**
- `Seq Scan` em tabelas grandes
- `cost` alto (> 1000)
- `execution time` > 100ms

### Benchmark

**Meta P95:**
- GET /posts: < 100ms
- GET /posts/:id: < 50ms
- GET /posts/search: < 150ms
- POST /posts: < 100ms
- GET /disciplines: < 30ms

## Troubleshooting

### psql: command not found

Adicione o PostgreSQL ao PATH:

**Windows:**
```
C:\Program Files\PostgreSQL\15\bin
```

**Linux/Mac:**
```bash
export PATH="/usr/local/pgsql/bin:$PATH"
```

### Permission denied

Execute psql com usuário postgres:

```bash
psql -U postgres -d blog_api_dev -p 5433 -f script.sql
```

### API não responde

Verifique se a API está rodando:

```bash
npm run dev
```

### Dados insuficientes

Execute os seeds:

```bash
npm run db:seed
```
