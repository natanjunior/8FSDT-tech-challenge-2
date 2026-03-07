# 🐳 Guia Docker - Tech Challenge Blog API

Documentação completa para executar a aplicação com Docker e Docker Compose.

---

## 📋 Índice

1. [Pré-requisitos](#-pré-requisitos)
2. [Desenvolvimento](#-desenvolvimento)
3. [Produção](#-produção)
4. [Acesso aos Serviços](#-acesso-aos-serviços)
5. [Comandos Úteis](#-comandos-úteis)
6. [Troubleshooting](#-troubleshooting)
7. [Estrutura dos Arquivos](#-estrutura-dos-arquivos)

---

## 🛠️ Pré-requisitos

- **Docker:** >= 20.10.0
- **Docker Compose:** >= 2.0.0

Verificar instalação:
```bash
docker --version
docker-compose --version
```

---

## 💻 Desenvolvimento

### Iniciar Ambiente Completo

```bash
# Iniciar todos os containers (API + PostgreSQL + PgAdmin)
npm run docker:up
# OU
docker-compose up -d
```

**O que é iniciado:**
- ✅ PostgreSQL (porta 5433)
- ✅ API (porta 3030) com **hot reload**
- ✅ PgAdmin (porta 5050) para gerenciamento visual

### Ver Logs

```bash
# Ver logs da API
npm run docker:logs
# OU
docker-compose logs -f api

# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs do PostgreSQL
docker-compose logs -f postgres
```

### Rodar Migrations

```bash
# Entrar no container da API
docker-compose exec api sh

# Dentro do container, rodar migrations
npm run db:migrate

# Ou em um único comando
docker-compose exec api npm run db:migrate
```

### Rodar Seeds

```bash
# Popular banco com dados de exemplo
docker-compose exec api npm run db:seed
```

### Parar Ambiente

```bash
# Parar containers (mantém volumes/dados)
npm run docker:down
# OU
docker-compose down

# Parar e REMOVER volumes (apaga dados)
npm run docker:clean
# OU
docker-compose down -v
```

### Reiniciar API

```bash
# Reiniciar apenas a API (útil após mudanças)
npm run docker:restart
# OU
docker-compose restart api
```

---

## 🚀 Produção

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.docker .env

# Editar .env com valores de produção
nano .env
```

**Variáveis obrigatórias:**
```env
NODE_ENV=production
PORT=3030
POSTGRES_USER=postgres
POSTGRES_PASSWORD=sua_senha_super_segura_aqui
POSTGRES_DB=blog_api_prod
DATABASE_URL=postgresql://postgres:sua_senha@postgres:5432/blog_api_prod
JWT_SECRET=seu_jwt_secret_super_seguro_32_caracteres_minimo
```

### 2. Build da Imagem

```bash
# Build da imagem otimizada
npm run docker:build
# OU
docker build -t 8fsdt-tech-challenge-2:1.0.0 .
```

**Imagem final:**
- Tamanho: ~100-150MB
- Base: node:18-alpine
- Multi-stage build (3 estágios)
- Usuário não-root (nodejs:nodejs)
- Healthcheck configurado

### 3. Iniciar Produção

```bash
# Iniciar ambiente de produção
npm run docker:prod:up
# OU
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Ver Logs de Produção

```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs -f api
```

### 5. Parar Produção

```bash
# Parar ambiente de produção
npm run docker:prod:down
# OU
docker-compose -f docker-compose.prod.yml down
```

---

## 🌐 Acesso aos Serviços

### API
- **URL:** http://localhost:3030
- **Health Check:** http://localhost:3030/health
- **Documentação:** (se implementada) http://localhost:3030/docs

### PostgreSQL (Desenvolvimento)
- **Host:** localhost
- **Porta:** 5433 (mapeada do 5432 interno)
- **Usuário:** postgres
- **Senha:** root
- **Database:** blog_api_dev

**Conectar via CLI:**
```bash
psql -h localhost -p 5433 -U postgres -d blog_api_dev
```

### PgAdmin (Desenvolvimento)
- **URL:** http://localhost:5050
- **Email:** admin@admin.com
- **Senha:** admin

**Configurar conexão no PgAdmin:**
1. Adicionar novo servidor
2. Name: Blog API Dev
3. Host: postgres (nome do container)
4. Port: 5432
5. Username: postgres
6. Password: root
7. Database: blog_api_dev

---

## 🔧 Comandos Úteis

### Desenvolvimento

```bash
# Ver status dos containers
docker-compose ps

# Acessar shell do container da API
docker-compose exec api sh

# Acessar PostgreSQL via psql
docker-compose exec postgres psql -U postgres -d blog_api_dev

# Ver uso de recursos
docker stats

# Rebuild completo (sem cache)
docker-compose build --no-cache api
docker-compose up -d

# Limpar tudo e recomeçar
npm run docker:clean
npm run docker:up
```

### Produção

```bash
# Ver status
docker-compose -f docker-compose.prod.yml ps

# Acessar container
docker-compose -f docker-compose.prod.yml exec api sh

# Ver logs específicos
docker-compose -f docker-compose.prod.yml logs --tail=100 api

# Backup do banco
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres blog_api_prod > backup.sql

# Restore do banco
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U postgres blog_api_prod < backup.sql
```

### Docker (Geral)

```bash
# Limpar containers parados
docker container prune

# Limpar imagens não usadas
docker image prune -a

# Limpar volumes não usados
docker volume prune

# Limpar tudo (cuidado!)
docker system prune -a --volumes
```

---

## 🐛 Troubleshooting

### API não inicia

**Sintomas:** Container reinicia constantemente

**Soluções:**
```bash
# 1. Ver logs detalhados
docker-compose logs -f api

# 2. Verificar se PostgreSQL está saudável
docker-compose ps
# Status do postgres deve ser "healthy"

# 3. Rebuild completo
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### PostgreSQL não aceita conexões

**Sintomas:** "connection refused" ou "authentication failed"

**Soluções:**
```bash
# 1. Verificar healthcheck
docker-compose ps postgres

# 2. Ver logs do PostgreSQL
docker-compose logs postgres

# 3. Verificar credenciais no .env
cat .env | grep POSTGRES

# 4. Resetar volume (APAGA DADOS!)
docker-compose down -v
docker-compose up -d
```

### Porta já está em uso

**Sintomas:** "bind: address already in use"

**Soluções:**
```bash
# Verificar quem está usando a porta
# Windows:
netstat -ano | findstr :3030

# Linux/Mac:
lsof -i :3030

# Parar processo ou mudar porta no .env
PORT=3031
```

### Hot Reload não funciona

**Sintomas:** Mudanças no código não refletem no container

**Soluções:**
```bash
# 1. Verificar volumes no docker-compose.yml
docker-compose config | grep -A 5 volumes

# 2. Reiniciar container
docker-compose restart api

# 3. Windows: pode precisar de polling
# Adicionar no nodemon.json:
{
  "legacyWatch": true,
  "pollInterval": 1000
}
```

### Imagem muito grande

**Sintomas:** Imagem > 500MB

**Soluções:**
```bash
# 1. Verificar tamanho
docker images | grep 8fsdt-tech-challenge-2

# 2. Garantir multi-stage build
# Dockerfile deve ter "AS dependencies" e "AS production"

# 3. Verificar .dockerignore
cat .dockerignore

# 4. Rebuild
docker build -t 8fsdt-tech-challenge-2:latest .
```

---

## 📁 Estrutura dos Arquivos

```
.
├── Dockerfile                 # Multi-stage build (dependencies → builder → production)
├── .dockerignore             # Arquivos ignorados no build
├── docker-compose.yml        # Desenvolvimento (hot reload + volumes)
├── docker-compose.prod.yml   # Produção (otimizado + seguro)
├── .env.docker               # Template de variáveis
├── scripts/
│   └── init-db.sql          # Script de inicialização do PostgreSQL
└── README-DOCKER.md         # Esta documentação
```

### Dockerfile - 3 Estágios

1. **dependencies:** Instala apenas node_modules de produção
2. **builder:** Instala todas as dependências (se precisar compilar)
3. **production:** Imagem final otimizada
   - Base: node:18-alpine (~40MB)
   - Usuário não-root (nodejs)
   - dumb-init para sinais
   - Healthcheck configurado

### docker-compose.yml - Desenvolvimento

- ✅ Hot reload via volumes
- ✅ PostgreSQL + PgAdmin
- ✅ Healthchecks
- ✅ Networks isoladas
- ✅ Restart policies

### docker-compose.prod.yml - Produção

- ✅ Sem volumes de código (imutável)
- ✅ Restart always
- ✅ Variáveis via .env
- ✅ Apenas serviços essenciais

---

## 📊 Monitoramento

### Healthcheck

A API possui healthcheck configurado:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3
```

**Verificar status:**
```bash
docker ps
# Coluna STATUS mostrará: healthy, unhealthy, ou starting
```

### Logs Estruturados

```bash
# Ver últimas 100 linhas
docker-compose logs --tail=100 api

# Seguir logs em tempo real
docker-compose logs -f api

# Ver logs de um período específico
docker-compose logs --since 2024-02-10T10:00:00 api
```

---

## 🔐 Segurança

### Checklist de Segurança

- [x] Container roda com usuário não-root
- [x] Imagem baseada em Alpine (menor superfície de ataque)
- [x] Multi-stage build (sem devDependencies em produção)
- [x] Secrets via variáveis de ambiente
- [x] PostgreSQL não exposto publicamente em produção
- [x] Healthcheck para detectar problemas
- [x] Networks isoladas

### Recomendações Adicionais

1. **Não commitar .env com secrets reais**
2. **Usar Docker secrets em produção real** (Swarm/Kubernetes)
3. **Escanear imagem com ferramentas de segurança:**
   ```bash
   docker scan 8fsdt-tech-challenge-2:latest
   ```
4. **Limitar recursos do container:**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 512M
   ```

---

## 📚 Referências

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

---

**Dúvidas?** Consulte o [README.md](README.md) principal ou abra uma issue.
