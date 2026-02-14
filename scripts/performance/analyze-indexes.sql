-- ============================================
-- ANÁLISE DE ÍNDICES - Tech Challenge v12
-- Total: 16 índices
-- ============================================

-- Verificar todos os índices criados
SELECT
	tablename,
	indexname,
	indexdef
FROM pg_indexes
WHERE schemaname = 'public'
	AND indexname NOT LIKE '%pkey'
ORDER BY tablename, indexname;

-- ============================================
-- TABELA: users (3 índices)
-- ============================================

-- Índice 1: idx_users_email (UNIQUE - login)
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'joao.silva@escola.com';

-- Índice 2: idx_users_role (filtro por role)
EXPLAIN ANALYZE
SELECT * FROM users WHERE role = 'TEACHER';

-- Índice 3: idx_users_created_at (ordenação)
EXPLAIN ANALYZE
SELECT * FROM users ORDER BY created_at DESC LIMIT 20;

-- ============================================
-- TABELA: posts (6 índices)
-- ============================================

-- Índice 4: idx_posts_author_id (FK)
EXPLAIN ANALYZE
SELECT * FROM posts WHERE author_id = '550e8400-e29b-41d4-a716-446655440001';

-- Índice 5: idx_posts_discipline_id (FK)
EXPLAIN ANALYZE
SELECT * FROM posts WHERE discipline_id = '660e8400-e29b-41d4-a716-446655440001';

-- Índice 6: idx_posts_status (ENUM v12)
EXPLAIN ANALYZE
SELECT * FROM posts WHERE status = 'PUBLISHED';

-- Índice 7: idx_posts_created_at (ordenação)
EXPLAIN ANALYZE
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20;

-- Índice 8: idx_posts_published_at (ordenação)
EXPLAIN ANALYZE
SELECT * FROM posts WHERE published_at IS NOT NULL ORDER BY published_at DESC LIMIT 20;

-- Índice 9: idx_posts_title_search (GIN full-text)
EXPLAIN ANALYZE
SELECT * FROM posts
WHERE to_tsvector('portuguese', title || ' ' || content) @@ to_tsquery('portuguese', 'Node.js');

-- ============================================
-- TABELA: post_reads (3 índices)
-- ============================================

-- Índice 10: idx_post_reads_post_id (FK)
EXPLAIN ANALYZE
SELECT * FROM post_reads WHERE post_id = '880e8400-e29b-41d4-a716-446655440001';

-- Índice 11: idx_post_reads_user_id (FK)
EXPLAIN ANALYZE
SELECT * FROM post_reads WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';

-- Índice 12: idx_post_reads_unique (UNIQUE composite)
EXPLAIN ANALYZE
SELECT * FROM post_reads
WHERE post_id = '880e8400-e29b-41d4-a716-446655440001'
	AND user_id = '550e8400-e29b-41d4-a716-446655440001';

-- ============================================
-- TABELA: user_sessions (2 índices)
-- ============================================

-- Índice 13: idx_user_sessions_user_id (FK)
EXPLAIN ANALYZE
SELECT * FROM user_sessions WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';

-- Índice 14: idx_user_sessions_expires_at (cleanup job)
EXPLAIN ANALYZE
SELECT * FROM user_sessions WHERE expires_at < NOW();

-- ============================================
-- TABELA: disciplines (1 índice)
-- ============================================

-- Índice 15: idx_disciplines_label (UNIQUE)
EXPLAIN ANALYZE
SELECT * FROM disciplines WHERE label = 'Matemática';

-- ============================================
-- ESTATÍSTICAS DOS ÍNDICES
-- ============================================

-- Tamanho dos índices
SELECT
	schemaname,
	tablename,
	indexname,
	pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Uso dos índices (scans)
SELECT
	schemaname,
	tablename,
	indexname,
	idx_scan as scans,
	idx_tup_read as tuples_read,
	idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
	AND indexname NOT LIKE '%pkey'
ORDER BY idx_scan DESC;

-- Índices não utilizados (possíveis candidatos para remoção)
SELECT
	schemaname,
	tablename,
	indexname,
	idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
	AND idx_scan = 0
	AND indexname NOT LIKE '%pkey';
