-- ============================================
-- CONFIGURAÇÕES DE PERFORMANCE - PostgreSQL
-- ============================================

-- Ver configurações atuais
SHOW shared_buffers;
SHOW effective_cache_size;
SHOW maintenance_work_mem;
SHOW work_mem;

-- Aplicar configurações otimizadas (via ALTER SYSTEM)
-- OBS: Requer restart do PostgreSQL

-- Memória compartilhada (25% da RAM)
ALTER SYSTEM SET shared_buffers = '256MB';

-- Cache efetivo (50-75% da RAM)
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Memória para manutenção (VACUUM, CREATE INDEX)
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- Memória por operação de sort/hash
ALTER SYSTEM SET work_mem = '4MB';

-- WAL (Write-Ahead Log)
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Query planner
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Conexões
ALTER SYSTEM SET max_connections = 100;

-- Recarregar configurações (sem restart para algumas)
SELECT pg_reload_conf();

-- Ver configurações que requerem restart
SELECT name, setting, unit, pending_restart
FROM pg_settings
WHERE pending_restart = true;
