# Census: Arquitetura

## Visão geral

O Census é formado por duas aplicações que colaboram: uma API REST em Spring Boot e um frontend estático em HTML, Bootstrap 5, CSS e JavaScript. O backend concentra regras de negócio, autenticação e persistência; o frontend concentra apresentação, interação e integração com a API. O PostgreSQL é o sistema de persistência, e o frontend é servido pela própria aplicação Spring Boot na mesma origem.

Os cinco arquivos obrigatórios ficam na raiz de `documentacao/`.

## Arquitetura do backend

O backend adota arquitetura em camadas com cortes por feature. Cada feature (autenticação, usuário, enquete, voto e infraestrutura comum) atravessa apenas as camadas de que precisa, evitando um único pacote gigante por responsabilidade.

### Camadas

1. **Apresentação/API:** recebe requisições HTTP, valida entradas e devolve respostas. Não contém regras de negócio.
2. **Transferência de dados:** DTOs definem os contratos de entrada e saída, separando a representação externa do modelo interno e impedindo a exposição de senha, hash ou detalhes de persistência.
3. **Aplicação:** services orquestram os casos de uso e concentram regras como autoria, estado da enquete, visibilidade dos resultados e voto único.
4. **Domínio/models:** entidades e enums representam os conceitos do negócio e suas invariantes. O status da enquete é derivado do prazo ou do encerramento, sem depender de agendador.
5. **Persistência:** repositories e mapeamento objeto-relacional isolam o acesso ao banco. Constraints de integridade ficam nessa camada como última barreira contra duplicidade.
6. **Infraestrutura/configuração:** segurança JWT, filtros, tratamento global de erros, propriedades de ambiente e integração com o banco.

Fluxo típico: requisição → apresentação → DTO de entrada → aplicação → domínio → persistência → banco. A resposta volta convertida em DTO, com erro padronizado quando há falha.

## Arquitetura do frontend

O frontend é modular e usa Bootstrap 5 como framework CSS. O JavaScript da aplicação permanece próprio e organizado por responsabilidade.

### Camadas

1. **Apresentação:** páginas HTML, Bootstrap 5 e folha de estilos definem telas, componentes visuais e layout desktop.
2. **Interação/UI:** funções de interface renderizam listas, cards, status, datas, barras de resultado, alertas e estados vazios ou de erro.
3. **Sessão:** o módulo de autenticação controla token, dados do usuário, header, logout e limpeza da sessão quando a API responde `401`.
4. **Integração com a API:** um módulo central concentra chamadas HTTP, envio do token, leitura de respostas e tradução de erros.
5. **Features de tela:** módulos por domínio coordenam cadastro, login, criação, listagem, detalhe, voto e resultados, ligando eventos do usuário à API e atualizando a interface.

Fluxo típico: evento do usuário → módulo da feature → integração com a API → backend → resposta → módulo da feature → apresentação.

Módulos atuais: `auth.js` para sessão, `api.js` para HTTP, `ui.js` para formatação de datas, `register.js`, `login.js`, `polls.js` (lista) e `poll.js` (detalhe) para as telas.

## Comunicação entre as aplicações

O navegador carrega os arquivos estáticos servidos pelo Spring Boot e chama a API com `fetch` na mesma origem. O token JWT viaja no header `Authorization: Bearer <token>` somente nas requisições protegidas; não há CORS nem sessão no servidor.

O backend converte DTOs em regras e persistência; o frontend converte respostas em estado de tela. Erros são padronizados no backend e explicados ao usuário no frontend. Datas trafegam em ISO-8601 UTC na API, são armazenadas em UTC e formatadas no cliente em `America/Sao_Paulo`.

## Configuração local

O `docker-compose.yml` sobe o PostgreSQL 16 com healthcheck e volume nomeado. As variáveis vêm de `.env`, criado a partir de `.env.example`; segredos não são versionados. A autenticação exige `JWT_SECRET` com no mínimo 32 caracteres para HS256 e aceita `JWT_EXPIRATION_MINUTES` com padrão de `1440`. Segredo ausente ou curto impede a inicialização da API.

## Modelo conceitual

Três conceitos sustentam o domínio: usuário, enquete e voto. O usuário pode criar enquetes e votar. A enquete pertence a um criador, apresenta duas opções e possui um prazo. O voto liga um usuário a uma enquete e é único por participante. O status da enquete é uma visão derivada, não um estado persistido separadamente.

Rotas já implementadas: `GET /api/polls` e `GET /api/polls/{id}` (públicas), `POST /api/polls` (autenticada), `PUT /api/polls/{id}`, `DELETE /api/polls/{id}` e `PATCH /api/polls/{id}/close` (criador), `POST /api/auth/register` (pública), `POST /api/auth/login` (pública) e `GET /api/auth/me` (protegida). Criação e listagem usam `Poll`, `PollRepository`, `CreatePollRequest`, `PollSummaryResponse` e `PollService`; edição usa `UpdatePollRequest` e o detalhe usa `PollDetailsResponse`. Resumo e detalhe expõem `createdById` e `hasVotes` para a interface decidir quais ações mostrar. A entidade `Vote` e seu repositório existem desde já para validar a regra de zero votos; o endpoint de voto vem na feature seguinte. Qualquer autenticado cria, sem papel de administrador. Enquete inexistente retorna `404`, outro usuário retorna `403` e operação inválida retorna `409`, todos padronizados. O login gera um JWT HS256 com claims `sub`, `userId`, `iat` e `exp`, sem claim de papel. A lista completa está nos casos de uso. Os atributos e as constraints acompanham a implementação.

## Padrões de nomenclatura

- **Backend:** pacotes em minúsculas por feature; classes em `PascalCase`; métodos em `camelCase`; sufixos `Controller`, `Service`, `Repository`, `Request`, `Response`, `Summary`, `Details` e `Results`.
- **Banco:** tabelas no plural em `snake_case`; constraints e índices com prefixos `uk_`, `fk_`, `ck_` e `idx_`.
- **API:** recursos no plural, minúsculos e JSON em `camelCase`, sem versionamento nem paginação.
- **Frontend:** arquivos em minúsculas, classes CSS em `kebab-case`, identificadores HTML em `camelCase` e chaves de armazenamento com prefixo comum.
- **Documentação:** arquivos em `kebab-case`; IDs `RF01`, `RNF01` e `UC01`.

## Decisões arquiteturais

- Camadas combinadas a features mantêm regras, transporte e persistência separados (RNF19).
- DTOs são a fronteira da API; senha e hash nunca saem do backend (RNF04, RNF14).
- Cadastro normaliza e-mail, valida senha forte e expõe somente dados públicos do usuário (RF01, RNF04, RNF12).
- Login compara hash BCrypt, emite JWT sem estado e o filtro autentica cada requisição protegida pelo e-mail do `sub` (RF02, RNF05, RNF06).
- Criação de enquete usa DTO com `optionA`, `optionB` e `endsAt` futuro, grava criador e devolve status derivado `OPEN`/`CLOSED` (RF03, RF11, RF12, RF13, RNF13).
- Listagem e detalhe são públicos e sem paginação: a lista devolve resumo e o detalhe acrescenta criador e datas, ambos com status derivado (RF04, RF11, RNF20).
- Gestão usa autoria, enquete aberta e zero votos antes de editar, excluir ou encerrar; o frontend esconde as ações do não-criador e explica o bloqueio quando houver votos ou encerramento (RF05, RF06, RF07, RF11, RF12, RF13, RNF14).
- Services concentram as regras de negócio, enquanto a apresentação permanece fina.
- JWT stateless e same-origin, sem papéis de usuário (RNF05, RNF06).
- Status derivado no lugar de agendador e constraint única para integridade do voto (RF10, RNF12).
- Frontend modular com Bootstrap 5 via CDN, consumindo apenas a API real (RNF02, RNF18).
