-- ==============================================================================
-- Database Initialization Script
-- ==============================================================================
-- Este script é executado automaticamente na criação do container PostgreSQL
-- via docker-entrypoint-initdb.d

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Para busca de texto otimizada

-- Configurações de performance (otimizadas para containers)
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Mensagem de confirmação
DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Database initialized successfully!';
  RAISE NOTICE 'Extensions: uuid-ossp, pg_trgm';
  RAISE NOTICE 'Performance settings applied';
  RAISE NOTICE '=================================================';
END $$;
