# Tech Challenge API - Documentacao

## Visao Geral

API RESTful para blog de professores de escola publica. Permite gerenciamento de posts, leitura de posts e listagem de disciplinas.

**Base URL:** `http://localhost:3030`
**Swagger UI:** `http://localhost:3030/api-docs`

## Autenticacao

A API usa autenticacao JWT (JSON Web Token) via header `Authorization: Bearer <token>`.

O login e passwordless - basta enviar o email cadastrado.

### Obter Token

```bash
curl -X POST http://localhost:3030/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@school.com"}'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "Professor",
    "email": "teacher@school.com",
    "role": "TEACHER"
  }
}
```

### Usar Token

Inclua o token no header de todas as requisicoes autenticadas:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Roles

| Role | Permissoes |
|------|-----------|
| TEACHER | CRUD completo de posts, listar disciplinas, marcar leitura |
| STUDENT | Listar posts PUBLISHED, buscar posts, listar disciplinas, marcar leitura |

## Endpoints

### Auth

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| POST | `/auth/login` | Login passwordless | Nao |
| POST | `/auth/logout` | Logout | Sim |

### Posts

| Metodo | Rota | Descricao | Auth | Role |
|--------|------|-----------|------|------|
| GET | `/posts` | Listar posts | Opcional | TEACHER ve todos, demais ve PUBLISHED |
| GET | `/posts/search` | Buscar posts | Opcional | Mesmas regras de listagem |
| GET | `/posts/:id` | Buscar post por ID | Sim | Todos |
| POST | `/posts` | Criar post | Sim | TEACHER |
| PUT | `/posts/:id` | Atualizar post | Sim | TEACHER |
| DELETE | `/posts/:id` | Deletar post (hard delete) | Sim | TEACHER |

### Post Reads

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| POST | `/posts/:id/read` | Marcar post como lido (idempotente) | Sim |
| GET | `/posts/:id/read` | Verificar se post foi lido | Sim |

### Disciplines

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| GET | `/disciplines` | Listar todas as disciplinas | Sim |

### Health Check

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| GET | `/health` | Status da API | Nao |

## Exemplos de Uso

### Criar Post (TEACHER)

```bash
curl -X POST http://localhost:3030/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Introducao a Matematica",
    "content": "Conteudo do post...",
    "status": "DRAFT",
    "discipline_id": "uuid-da-disciplina"
  }'
```

### Listar Posts

```bash
# Sem autenticacao (apenas PUBLISHED)
curl http://localhost:3030/posts

# Com autenticacao TEACHER (todos os status)
curl http://localhost:3030/posts \
  -H "Authorization: Bearer <token>"

# Com paginacao
curl "http://localhost:3030/posts?page=1&limit=10"
```

### Buscar Posts

```bash
# Busca por termo
curl "http://localhost:3030/posts/search?query=matematica"

# Busca por titulo
curl "http://localhost:3030/posts/search?title=introducao"

# Busca por autor
curl "http://localhost:3030/posts/search?author=professor"
```

### Atualizar Post (TEACHER)

```bash
curl -X PUT http://localhost:3030/posts/:id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Titulo Atualizado",
    "status": "PUBLISHED"
  }'
```

### Deletar Post (TEACHER)

```bash
curl -X DELETE http://localhost:3030/posts/:id \
  -H "Authorization: Bearer <token>"
```

### Marcar Post como Lido

```bash
curl -X POST http://localhost:3030/posts/:id/read \
  -H "Authorization: Bearer <token>"
```

### Verificar Leitura

```bash
curl http://localhost:3030/posts/:id/read \
  -H "Authorization: Bearer <token>"
```

**Resposta:**
```json
{
  "read": true,
  "read_at": "2024-01-15T10:30:00.000Z"
}
```

### Listar Disciplinas

```bash
curl http://localhost:3030/disciplines \
  -H "Authorization: Bearer <token>"
```

## Status de Post

| Status | Descricao |
|--------|-----------|
| DRAFT | Rascunho - visivel apenas para TEACHER |
| PUBLISHED | Publicado - visivel para todos |
| ARCHIVED | Arquivado - visivel apenas para TEACHER |

## Codigos de Resposta

| Codigo | Descricao |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 204 | Deletado com sucesso (sem corpo) |
| 400 | Dados invalidos |
| 401 | Nao autenticado |
| 403 | Acesso negado (role insuficiente) |
| 404 | Recurso nao encontrado |
| 500 | Erro interno do servidor |

## Swagger UI

A documentacao interativa esta disponivel em `/api-docs` quando a API esta rodando.

```bash
# Iniciar a API
npm run dev

# Acessar no navegador
# http://localhost:3030/api-docs
```
