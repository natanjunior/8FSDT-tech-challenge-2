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
| STUDENT | Listar posts PUBLISHED, buscar posts, listar disciplinas, marcar leitura, comentar |
| Não autenticado | Listar posts PUBLISHED, buscar posts, comentar (anônimo via X-Anonymous-Id) |

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
| GET | `/posts/:id` | Buscar post por ID | Opcional | TEACHER ve todos, demais ve PUBLISHED |
| POST | `/posts` | Criar post | Sim | TEACHER |
| PUT | `/posts/:id` | Substituir post (completo) | Sim | TEACHER |
| PATCH | `/posts/:id` | Atualizar post (parcial) | Sim | TEACHER |
| DELETE | `/posts/:id` | Deletar post (hard delete) | Sim | TEACHER |

### Reads

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| POST | `/reads` | Marcar post como lido (idempotente) | Sim |
| GET | `/reads/search` | Listar leituras do usuario | Sim |

> **Breaking change:** As rotas `POST/GET /posts/:id/read` foram removidas.

### Comments

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| GET | `/comments/search` | Buscar comentarios com paginacao e ordenacao FHIR | Opcional |
| POST | `/comments` | Criar comentario (autenticado ou anonimo) | Opcional |
| DELETE | `/comments/:id` | Deletar comentario (dono ou TEACHER) | Opcional |

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

# Com ordenacao FHIR
curl "http://localhost:3030/posts?sort=-published_at,title"
```

### Buscar Posts

```bash
# Busca por termo
curl "http://localhost:3030/posts/search?query=matematica"

# Busca por titulo
curl "http://localhost:3030/posts/search?title=introducao"

# Busca por autor
curl "http://localhost:3030/posts/search?author=professor"

# Filtrar por disciplina
curl "http://localhost:3030/posts/search?discipline=660e8400-e29b-41d4-a716-446655440001"

# Filtrar por status (apenas TEACHER)
curl "http://localhost:3030/posts/search?status=DRAFT" \
  -H "Authorization: Bearer <token>"
```

### Substituir Post - PUT (TEACHER)

```bash
curl -X PUT http://localhost:3030/posts/:id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Titulo Completo",
    "content": "Conteudo completo obrigatorio",
    "status": "PUBLISHED"
  }'
```

### Atualizar Post Parcialmente - PATCH (TEACHER)

```bash
curl -X PATCH http://localhost:3030/posts/:id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Apenas o titulo atualizado"
  }'
```

### Deletar Post (TEACHER)

```bash
curl -X DELETE http://localhost:3030/posts/:id \
  -H "Authorization: Bearer <token>"
```

### Marcar Post como Lido

```bash
curl -X POST http://localhost:3030/reads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"post_id": "uuid-do-post"}'
```

### Buscar Leituras

```bash
# Todas as leituras do usuario
curl http://localhost:3030/reads/search \
  -H "Authorization: Bearer <token>"

# Verificar se leu um post especifico
curl "http://localhost:3030/reads/search?post_id=uuid-do-post" \
  -H "Authorization: Bearer <token>"
```

### Buscar Comentarios

```bash
# Comentarios de um post
curl "http://localhost:3030/comments/search?post_id=uuid-do-post"

# Com ordenacao
curl "http://localhost:3030/comments/search?post_id=uuid-do-post&sort=-mine,-created_at" \
  -H "X-Anonymous-Id: uuid-do-visitante"
```

### Criar Comentario

```bash
# Autenticado
curl -X POST http://localhost:3030/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"post_id": "uuid-do-post", "content": "Otimo post!"}'

# Anonimo
curl -X POST http://localhost:3030/comments \
  -H "Content-Type: application/json" \
  -H "X-Anonymous-Id: uuid-do-visitante" \
  -d '{"post_id": "uuid-do-post", "content": "Otimo post!", "author_name": "Visitante"}'
```

### Deletar Comentario

```bash
curl -X DELETE http://localhost:3030/comments/:id \
  -H "Authorization: Bearer <token>"
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
