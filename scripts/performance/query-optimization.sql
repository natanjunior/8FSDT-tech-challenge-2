-- ============================================
-- QUERY 1: Listar Posts PUBLISHED (STUDENT)
-- ============================================

EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT
	p.id,
	p.title,
	p.content,
	p.status,
	p.published_at,
	p.created_at,
	u.id as author_id,
	u.name as author_name,
	u.role as author_role,
	d.id as discipline_id,
	d.label as discipline_label
FROM posts p
INNER JOIN users u ON p.author_id = u.id
LEFT JOIN disciplines d ON p.discipline_id = d.id
WHERE p.status = 'PUBLISHED'
ORDER BY p.created_at DESC
LIMIT 20;

-- ============================================
-- QUERY 2: Listar Todos Posts (TEACHER)
-- ============================================

EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT
	p.id,
	p.title,
	p.content,
	p.status,
	p.published_at,
	p.created_at,
	u.id as author_id,
	u.name as author_name,
	d.id as discipline_id,
	d.label as discipline_label
FROM posts p
INNER JOIN users u ON p.author_id = u.id
LEFT JOIN disciplines d ON p.discipline_id = d.id
ORDER BY p.created_at DESC
LIMIT 20;

-- ============================================
-- QUERY 3: Busca Full-Text (search)
-- ============================================

EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT
	p.id,
	p.title,
	p.content,
	p.status,
	u.name as author_name
FROM posts p
INNER JOIN users u ON p.author_id = u.id
WHERE to_tsvector('portuguese', p.title || ' ' || p.content) @@ to_tsquery('portuguese', 'Node.js')
	AND p.status = 'PUBLISHED'
ORDER BY p.created_at DESC
LIMIT 20;

-- ============================================
-- QUERY 4: Verificar se Post foi Lido
-- ============================================

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM post_reads
WHERE post_id = '880e8400-e29b-41d4-a716-446655440001'
	AND user_id = '550e8400-e29b-41d4-a716-446655440001';

-- ============================================
-- QUERY 5: Validar Sessão JWT
-- ============================================

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM user_sessions
WHERE id = '7c9e6679-7425-40de-944b-e07fc1f90ae7'
	AND expires_at > NOW();

-- ============================================
-- QUERY 6: Cleanup de Sessões Expiradas
-- ============================================

EXPLAIN (ANALYZE, BUFFERS)
DELETE FROM user_sessions
WHERE expires_at < NOW();
