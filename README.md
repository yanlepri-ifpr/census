# Census

Census é uma aplicação web de enquetes binárias “A vs B”. Qualquer visitante pode ver enquetes e resultados após o encerramento; usuários cadastrados criam enquetes, votam uma vez e gerenciam apenas as próprias enquetes enquanto estiverem abertas e sem votos.

## Tecnologias

- Java 21 e Spring Boot 4.2 com Spring Web MVC, Security, Validation e Data JPA.
- PostgreSQL 16 em Docker Compose, com volume persistente e healthcheck.
- JWT HS256 em `localStorage` e senhas com BCrypt.
- Frontend em HTML, CSS e JavaScript modules, servido pelo mesmo jar do Spring Boot.
- Bootstrap 5.3.9 via CDN com SRI; suporte desktop a partir de 1200px.

## Estrutura

```text
.
├── backend/       API REST Spring Boot
├── frontend/      HTML, CSS e JavaScript consumindo /api
├── documentacao/  Visão, requisitos, casos de uso, arquitetura e interface
├── docker-compose.yml
└── .env.example   Modelo das variáveis locais
```

O build copia `frontend/` para `backend/target/classes/static`, então não há servidor separado nem CORS.

## Como executar

Pré-requisitos: Java 21, Docker com Compose e o Maven Wrapper incluído em `backend/`.

```bash
cp .env.example .env
# Ajuste POSTGRES_PASSWORD, SPRING_DATASOURCE_PASSWORD e JWT_SECRET no .env
docker compose up -d
docker compose logs -f db
```

No terminal, a partir de `backend/`:

```bash
./mvnw spring-boot:run
```

Ou gere e execute o jar:

```bash
./mvnw clean package
java -jar target/census-0.0.1-SNAPSHOT.jar
```

Acesse `http://localhost:8080`. Para encerrar o banco: `docker compose down`.

## API REST

| Método | Rota | Acesso | Finalidade |
|---|---|---|---|
| `POST` | `/api/auth/register` | Pública | Cadastra usuário |
| `POST` | `/api/auth/login` | Pública | Emite JWT |
| `GET` | `/api/auth/me` | Autenticada | Dados do usuário atual |
| `GET` | `/api/polls` | Pública | Lista enquetes |
| `GET` | `/api/polls/{id}` | Pública | Detalhe da enquete |
| `POST` | `/api/polls` | Autenticada | Cria enquete |
| `PUT` | `/api/polls/{id}` | Criador | Edita enquete aberta e sem votos |
| `DELETE` | `/api/polls/{id}` | Criador | Exclui enquete aberta e sem votos |
| `PATCH` | `/api/polls/{id}/close` | Criador | Encerra antecipadamente |
| `POST` | `/api/polls/{id}/votes` | Autenticada | Registra voto único em A ou B |
| `GET` | `/api/polls/{id}/results` | Condicional | Libera após voto ou encerramento |

Erros usam JSON padronizado com `timestamp`, `status`, `error`, `message`, `path` e `fieldErrors`. O status é derivado de `closedAt` ou de `now >= endsAt`: não há job agendado e `closedAt` permanece nulo no encerramento automático (RF10, RF11, UC10).
