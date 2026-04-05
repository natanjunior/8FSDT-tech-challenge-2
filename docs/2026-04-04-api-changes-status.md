# Resposta às Solicitações de Mudança na API — Fase 3 Frontend

**Data:** 2026-04-04  
**Origem:** Time de backend — Fase 2  
**Destinatário:** Time de frontend — Fase 3  
**Referência:** `docs/2026-04-01-api-change-requests.md`

---

## Visão Geral

Este documento responde formalmente às solicitações de mudança levantadas durante o desenvolvimento do frontend (Fase 3). Para cada solicitação, indica o status atual de implementação e, quando já entregue, documenta o comportamento final da API.

---

## Status das Solicitações

| # | Título | Prioridade original | Status |
|---|--------|---------------------|--------|
| 1 | `?discipline=` e `?status=` em `GET /posts/search` | Crítica | **Implementado** |
| 2 | Ordenação FHIR em `GET /posts` e `GET /posts/search` | Crítica | **Implementado** |
| 3 | Endpoints de comentários (`/comments`) | Alta | **Implementado** |
| 4 | `comments_count` / `reads_count` no shape do Post | Média | **Implementado** |
| 5 | `GET /posts/:id` sem autenticação obrigatória | Alta | **Implementado** |
| — | **[Breaking]** Migração `POST/GET /posts/:id/read` → `/reads` | Extra | **Implementado** |

---

## Solicitação 5 — `GET /posts/:id` com autenticação opcional

**Status:** Implementado  
**Data de entrega:** 2026-04-04

### O que foi feito

A rota `GET /posts/:id` foi alterada de autenticação **obrigatória** para **opcional**, alinhando seu comportamento com `GET /posts` e `GET /posts/search`.

A mudança envolveu três camadas:

- **Rota** (`src/routes/post.routes.js`): substituído o middleware `authenticate` por `optionalAuth`. Se o header `Authorization` não for enviado, a requisição prossegue com `req.user = null`. Se o header estiver presente, o token é validado normalmente.
- **Service** (`src/services/post.service.js`): `getPostById` passou a receber `userRole` como segundo parâmetro e aplica as regras de visibilidade.
- **Controller** (`src/controllers/post.controller.js`): extrai `req.user?.role || null` e repassa para o service.

### Regras de visibilidade em vigor

| Quem faz a requisição | Post PUBLISHED | Post DRAFT | Post ARCHIVED |
|-----------------------|---------------|------------|---------------|
| TEACHER (token válido) | 200 | 200 | 200 |
| STUDENT (token válido) | 200 | 403 | 403 |
| Não autenticado (sem token) | 200 | 403 | 403 |

### Comportamento por caso

```
# Visitante sem token — post publicado
GET /posts/:id
→ 200  { id, title, content, ... }

# Visitante sem token — post em rascunho ou arquivado
GET /posts/:id
→ 403  { "error": "Acesso negado" }

# TEACHER — qualquer status
GET /posts/:id
Authorization: Bearer <token>
→ 200  { id, title, content, ... }

# Post inexistente (qualquer usuário)
GET /posts/:id
→ 404  { "error": "Post não encontrado" }
```

### Impacto para o frontend

- `posts/[id]/page.tsx` pode fazer a requisição sem token para posts públicos sem receber 401.
- Quando token estiver disponível no cookie, deve continuar sendo enviado — o backend trata corretamente.
- Não há mudança na estrutura do response body.

---

## Decisões de design da API

Durante o planejamento das solicitações pendentes, o time de backend tomou decisões que diferem do contrato original proposto pelo frontend. As mudanças estão documentadas abaixo.

### Solicitação 2 — Convenção de ordenação

A API **não** adotará `?sort=campo&order=asc`. Em vez disso, usará o padrão **FHIR sort** ([referência](https://build.fhir.org/search.html#sort)):

```
?sort=-published_at,title
```

- Único parâmetro `sort`
- Múltiplos campos separados por vírgula (ordenação composta)
- Prefixo `-` para DESC, sem prefixo para ASC

Essa convenção se aplica a **todos** os endpoints com suporte a ordenação: `GET /posts`, `GET /posts/search`, `GET /comments/search`, `GET /reads/search`.

### Solicitação 3 — Arquitetura de comentários

O frontend propôs `GET/POST/DELETE /posts/:id/comments` (rotas aninhadas). A API implementará `comments` como **entidade independente**:

```
GET    /comments/search?post_id=<uuid>
POST   /comments
DELETE /comments/:id
```

O comportamento funcional é equivalente. O frontend deve ajustar as URLs.

### Item extra — Breaking change: `/reads`

As rotas de leitura são migradas de rotas aninhadas para entidade independente:

| Antes | Depois |
|-------|--------|
| `POST /posts/:id/read` | `POST /reads` com `{ post_id }` no body |
| `GET /posts/:id/read` | `GET /reads/search?post_id=<uuid>` |

**Ação necessária no frontend:** atualizar as chamadas antes do deploy desta versão.

---

## Solicitação 1 — Filtros `?discipline=` e `?status=` em `GET /posts/search`

**Status:** Implementado  
**Data de entrega:** 2026-04-05

### O que foi feito

O endpoint `GET /posts/search` passou a aceitar dois novos parâmetros de query:

| Param | Tipo | Descrição |
|-------|------|-----------|
| `discipline` | UUID | Filtra posts pela disciplina (usa `discipline_id` internamente) |
| `status` | string | Filtra por status (`DRAFT`, `PUBLISHED`, `ARCHIVED`) — case-insensitive |

**Regra de status:** Apenas TEACHER pode filtrar por qualquer status. STUDENT e não autenticados sempre veem apenas `PUBLISHED`, independentemente do parâmetro enviado.

### Exemplos

```
# TEACHER filtra rascunhos de uma disciplina
GET /posts/search?discipline=660e8400-...&status=DRAFT
Authorization: Bearer <token>

# STUDENT com status=DRAFT → ignora, retorna apenas PUBLISHED
GET /posts/search?status=DRAFT
Authorization: Bearer <token-student>
→ 200  { data: [/* apenas PUBLISHED */] }

# Case-insensitive
GET /posts/search?status=draft  →  normalizado para DRAFT internamente
```

---

## Solicitação 2 — Ordenação FHIR em `GET /posts` e `GET /posts/search`

**Status:** Implementado  
**Data de entrega:** 2026-04-05

### O que foi feito

Ambos os endpoints passaram a aceitar o parâmetro `sort` no padrão FHIR:

```
?sort=-published_at,title
```

- Único parâmetro `sort`
- Múltiplos campos separados por vírgula (ordenação composta)
- Prefixo `-` para DESC, sem prefixo para ASC
- Campos inválidos são ignorados (fallback para ordem padrão `created_at DESC`)

### Campos disponíveis

| Campo | Descrição |
|-------|-----------|
| `title` | Título do post |
| `status` | Status (DRAFT, PUBLISHED, ARCHIVED) |
| `published_at` | Data de publicação |
| `created_at` | Data de criação |
| `author` | Nome do autor (join) |
| `discipline` | Label da disciplina (join) |

### Exemplos

```
GET /posts?sort=-published_at          → mais recentes primeiro
GET /posts?sort=title                  → título A-Z
GET /posts/search?query=math&sort=-created_at,title
```

---

## Solicitação 3 — Endpoints de comentários (`/comments`)

**Status:** Implementado  
**Data de entrega:** 2026-04-05

### O que foi feito

Comentários foram implementados como **entidade independente** (não aninhados em `/posts/:id/comments`). Suportam autores autenticados e anônimos via header `X-Anonymous-Id`.

### Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/comments/search` | Opcional | Buscar comentários com paginação e ordenação FHIR |
| POST | `/comments` | Opcional | Criar comentário (autenticado ou anônimo) |
| DELETE | `/comments/:id` | Opcional | Deletar comentário (dono ou TEACHER) |

### `GET /comments/search`

| Param | Tipo | Descrição |
|-------|------|-----------|
| `post_id` | UUID | Filtrar por post (opcional) |
| `sort` | string | Ordenação FHIR. Campos: `created_at`, `updated_at`, `mine` |
| `page` | int | Default: 1 |
| `limit` | int | Default: 10, máximo: 50 |

O campo `mine` é um campo computado que ordena "meus comentários primeiro". A ordenação padrão (sem `sort`) é `-mine,-created_at`.

**Response shape:**

```json
{
  "data": [
    {
      "id": "uuid",
      "content": "Texto do comentário",
      "author_name": "Prof. João" | null,
      "is_anonymous": false,
      "can_delete": true,
      "created_at": "2026-04-05T10:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 }
}
```

O campo `can_delete` é calculado server-side baseado na identidade do requisitante.

### `POST /comments`

```json
// Request
{
  "post_id": "uuid",          // obrigatório
  "content": "Texto",         // obrigatório, 1-1000 chars
  "author_name": "Visitante"  // opcional, máximo 100 chars
}

// Headers (para anônimos)
X-Anonymous-Id: 11111111-1111-1111-1111-111111111111
```

Se o usuário está autenticado, o comentário é vinculado ao `user_id`. Se não, usa o `anonymous_id` do header. Se autenticado, `anonymous_id` é ignorado.

### `DELETE /comments/:id`

- **TEACHER** pode deletar qualquer comentário
- Dono autenticado pode deletar o próprio
- Anônimo com `X-Anonymous-Id` correto pode deletar o próprio
- Response: `204 No Content`
- Sem permissão: `403`

---

## Solicitação 4 — `comments_count` e `reads_count` no shape do Post

**Status:** Implementado  
**Data de entrega:** 2026-04-05

### O que foi feito

O shape de resposta de Post agora inclui dois campos adicionais:

```json
{
  "id": "uuid",
  "title": "...",
  "...campos existentes...",
  "comments_count": 5,
  "reads_count": 42
}
```

Presentes em **todos** os endpoints que retornam Post:
- `GET /posts`
- `GET /posts/search`
- `GET /posts/:id`

Ambos são sempre inteiros ≥ 0. Calculados via subquery SQL no repository.

---

## Item extra — Migração `POST/GET /posts/:id/read` → `/reads`

**Status:** Implementado  
**Data de entrega:** 2026-04-05

### Breaking change

As rotas abaixo foram **removidas**:

| Antes (removido) | Depois |
|-------------------|--------|
| `POST /posts/:id/read` | `POST /reads` com `{ "post_id": "uuid" }` no body |
| `GET /posts/:id/read` | `GET /reads/search?post_id=<uuid>` |

### `POST /reads`

```
Auth: obrigatória

Body: { "post_id": "uuid" }

Response 201: { "id", "post_id", "user_id", "read_at" }   // novo registro
Response 200: mesmo shape                                   // já existia (idempotente)
Response 400: { "errors": [...] }
Response 404: { "error": "Post não encontrado" }
```

### `GET /reads/search`

```
Auth: obrigatória

Query params:
  post_id   UUID    opcional — filtra por post
  sort      FHIR, campo: read_at — default: -read_at
  page      int ≥ 1, default 1
  limit     int 1–100, default 20

Response 200:
{
  "data": [{ "id", "post_id", "user_id", "read_at" }],
  "pagination": { "page", "limit", "total", "totalPages" }
}
```

### Impacto para o frontend

As chamadas `POST /posts/:id/read` e `GET /posts/:id/read` devem ser atualizadas para as novas rotas antes do deploy desta versão. As rotas antigas retornam 404.

---

*Documento gerado em 2026-04-04. Última atualização em 2026-04-05 — todas as solicitações implementadas.*
