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

## Comunicação entre as aplicações

O navegador carrega os arquivos estáticos servidos pelo Spring Boot e chama a API com `fetch` na mesma origem. O token JWT viaja no header das requisições protegidas; não há CORS nem sessão no servidor.

O backend converte DTOs em regras e persistência; o frontend converte respostas em estado de tela. Erros são padronizados no backend e explicados ao usuário no frontend. Datas trafegam em ISO-8601 UTC na API e são formatadas no cliente para o fuso local.

## Configuração local

O `docker-compose.yml` sobe o PostgreSQL 16 com healthcheck e volume nomeado. As variáveis vêm de `.env`, criado a partir de `.env.example`; segredos não são versionados.

## Modelo conceitual

Três conceitos sustentam o domínio: usuário, enquete e voto. O usuário pode criar enquetes e votar. A enquete pertence a um criador, apresenta duas opções e possui um prazo. O voto liga um usuário a uma enquete e é único por participante. O status da enquete é uma visão derivada, não um estado persistido separadamente.

Rotas já implementadas: `GET /api/polls` (pública) e `POST /api/auth/register` (pública). A lista completa está nos casos de uso. Os atributos e as constraints acompanham a implementação.

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
- Services concentram as regras de negócio, enquanto a apresentação permanece fina.
- JWT stateless e same-origin, sem papéis de usuário (RNF05, RNF06).
- Status derivado no lugar de agendador e constraint única para integridade do voto (RF10, RNF12).
- Frontend modular com Bootstrap 5 via CDN, consumindo apenas a API real (RNF02, RNF18).
