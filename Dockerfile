# ==============================================================================
# STAGE 1: Dependencies (Builder)
# ==============================================================================
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copiar apenas package files para aproveitar cache do Docker
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# ==============================================================================
# STAGE 2: Build (se necessário compilar)
# ==============================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar todas as dependências (dev + prod)
RUN npm ci

# Copiar código fonte
COPY . .

# ==============================================================================
# STAGE 3: Development
# ==============================================================================
FROM node:18-alpine AS development

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar TODAS as dependências (dev + prod) para hot reload
RUN npm ci

# Copiar código fonte
COPY . .

# Expor porta da aplicação
EXPOSE 3030

# Comando padrão para desenvolvimento (com nodemon)
CMD ["npm", "run", "dev"]

# ==============================================================================
# STAGE 4: Production
# ==============================================================================
FROM node:18-alpine AS production

# Metadados da imagem
LABEL maintainer="grupo28@fiap.com"
LABEL description="Tech Challenge - Blog API para Professores"
LABEL version="1.0.0"

# Instalar dumb-init para melhor gerenciamento de sinais
RUN apk add --no-cache dumb-init

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar node_modules do stage dependencies
COPY --chown=nodejs:nodejs --from=dependencies /app/node_modules ./node_modules

# Copiar código fonte
COPY --chown=nodejs:nodejs . .

# Trocar para usuário não-root
USER nodejs

# Expor porta da aplicação
EXPOSE 3030

# Healthcheck para monitorar saúde do container
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3030/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usar dumb-init como entrypoint para melhor gerenciamento de sinais
ENTRYPOINT ["dumb-init", "--"]

# Comando padrão para iniciar a aplicação
CMD ["node", "src/server.js"]
