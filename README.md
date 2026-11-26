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

## Checklist manual

Executado em 26/11/2026 em Chromium headless, a 1200×800 e 1366×768, com a API real. Não há suporte a celular (RNF07, RNF17, RNF18).

| ID | Cenário | Verificação | Resultado |
|---|---|---|---|
| UC01 | Cadastro | Nome, e-mail e senha válidos criam usuário (`201`); senha fraca retorna `400`; e-mail repetido retorna `409` | OK |
| UC02 | Login e logout | Login válido retorna `200`; credenciais inválidas retornam `401`; “Sair” remove `census.token` e `census.user` | OK |
| UC03 | Criação | Enquete com prazo futuro retorna `201`; prazo passado retorna `400`; visitante retorna `401` | OK |
| UC04 | Lista e detalhe | Cards mostram `A vs B`, badge, prazo, ações e link para o detalhe; id inválido retorna `400`; id inexistente retorna `404` | OK |
| UC05 | Voto | Primeiro voto retorna `201`; segundo voto retorna `409`; opção inválida retorna `400`; visitante retorna `401`; a interface remove os botões e destaca a escolha | OK |
| UC06 | Resultados | Antes do voto, visitante e outro usuário recebem `403`; após votar, o usuário recebe `200`; após encerramento, qualquer visitante recebe `200` | OK |
| UC07 | Edição | Criador edita com `200`; outro usuário recebe `403`; com votos ou encerrada, a ação é bloqueada | OK |
| UC08 | Exclusão | Criador exclui com `204`; outro usuário recebe `403`; consulta posterior retorna `404` | OK |
| UC09 | Encerramento manual | Criador encerra sem votos com `200`; com votos retorna `409`; `closedAt` é preenchido e resultados viram públicos | OK |
| UC10 | Encerramento automático | Enquete com prazo de 8s ficou `OPEN` e depois `CLOSED`, com `closedAt: null`; voto posterior retornou `409` | OK |
| RNF13 | Datas | API em ISO-8601 UTC; tela em `pt-BR` com `America/Sao_Paulo` | OK |
| RNF14 | Erros | Respostas `400`, `401`, `403`, `404` e `409` com o mesmo formato de erro | OK |
| RNF18 | Layout | `col-xl-4` produz 3 colunas; `scrollWidth` não excede a largura da janela em 1200px e 1366px; Bootstrap carrega com SRI válido | OK |

Evidentemente, itens de interação como confirmações de exclusão e encerramento também devem ser conferidos na demonstração ao vivo, pois usam `window.confirm`.

## Ensaio da demonstração

1. Abra `http://localhost:8080` como visitante e mostre a lista, o badge de status e o link “Entrar para votar”.
2. Cadastre duas contas em `/register.html` e entre com a primeira em `/login.html`.
3. Crie uma enquete “Café vs Chá” com prazo de 2 minutos e mostre o card “Aberta” com “Votar”.
4. Vote na opção A. Mostre o destaque da escolha, a remoção dos botões e as barras de resultado.
5. Tente votar de novo: a API devolve `409` e a tela já bloqueia a ação.
6. Entre com a segunda conta e abra a mesma enquete: “Vote para ver os resultados.” aparece antes do voto.
7. Crie uma segunda enquete sem votos e clique em “Encerrar”. Mostre o badge “Encerrada” e os resultados públicos para um visitante.
8. Aguarde o prazo da primeira enquete. Recarregue a página e mostre que ela ficou “Encerrada” sem scheduler e com `closedAt` nulo na API.
9. Encerre com “Sair” e mostre que ações protegidas voltam a exigir login.

## Validação final registrada

- `./mvnw clean package` concluído; o jar contém `BOOT-INF/classes/static/` com as quatro páginas, CSS e JavaScript.
- Páginas servidas pelo jar: `/`, `/login.html`, `/register.html` e `/poll.html` retornam `200`.
- Fluxo de interface conferido por DevTools: login → voto único com resultados → logout com sessão limpa.
- Os hashes SRI do CSS e do bundle do Bootstrap 5.3.9 conferem com os arquivos servidos pelo jsDelivr.
- Nenhum segredo é versionado: `.env`, `target/` e `backend/src/main/resources/static/` estão fora do Git.
