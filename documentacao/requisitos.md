# Census: Requisitos

Os casos de uso em `casos-uso.md` referenciam os IDs abaixo.

## Requisitos funcionais

| ID | Requisito | Descrição |
|---|---|---|
| RF01 | Cadastro | Visitante cadastra nome, e-mail único e senha forte. |
| RF02 | Login e logout | Usuário entra com e-mail e senha, recebe JWT; logout remove o token. |
| RF03 | Criar enquete | Usuário autenticado informa `optionA`, `optionB` e `endsAt` futuro. |
| RF04 | Listar enquetes | Lista pública com opções, status e data; logado vê se já votou. |
| RF05 | Editar enquete | Criador edita se estiver aberta e sem votos. |
| RF06 | Excluir enquete | Criador exclui se estiver aberta e sem votos. |
| RF07 | Encerrar antecipadamente | Criador encerra se estiver aberta e sem votos; resultados viram públicos. |
| RF08 | Votar | Usuário autenticado vota uma vez em A ou B; voto imutável. |
| RF09 | Ver resultados | Usuário vê após votar; todos veem após o encerramento. |
| RF10 | Encerramento automático | Enquete fica `CLOSED` quando `now >= endsAt`, sem scheduler. |
| RF11 | Status | API e interface exibem `OPEN`/`CLOSED` de forma consistente. |
| RF12 | Validações e erros | Entradas validadas e mensagens claras, com códigos HTTP adequados. |
| RF13 | Controle de acesso | Rotas de criação, gestão e voto exigem autenticação. |

## Requisitos não funcionais

| ID | Requisito | Descrição |
|---|---|---|
| RNF01 | API REST | Spring Boot 4.2 e Java 21. |
| RNF02 | Frontend integrado | HTML/CSS/JS consomem a API real, sem mocks. |
| RNF03 | PostgreSQL | Banco PostgreSQL 16 via Docker Compose. |
| RNF04 | Senhas | BCrypt, política forte, hash nunca exposto. |
| RNF05 | JWT | HS256 no `localStorage`, sem claim de papel. |
| RNF06 | Same-origin | Frontend servido pelo Spring Boot, sem CORS. |
| RNF07 | Layout desktop | Layout com Bootstrap 5, validado a partir de 1200px, sem suporte a celular. |
| RNF08 | Acessibilidade | Contraste AA, labels, foco visível, teclado e `aria-live`. |
| RNF09 | Consistência | Documentação acompanha a implementação. |
| RNF10 | Histórico Git | Commits frequentes e distribuídos entre a dupla. |
| RNF11 | Segredos | `JWT_SECRET` via ambiente; `.env` fora do Git. |
| RNF12 | Integridade | E-mail único e voto único por `(poll_id, user_id)`. |
| RNF13 | Datas | UTC no banco, ISO-8601 na API, `America/Sao_Paulo` na tela. |
| RNF14 | Erros | JSON de erro padronizado. |
| RNF15 | Maven Wrapper | Build com `./mvnw`, sem Maven global. |
| RNF16 | Docker Compose | Banco com healthcheck e volume persistente. |
| RNF17 | Testes | Checklist manual; sem testes automatizados. |
| RNF18 | Bootstrap 5 | Framework CSS servido localmente para layout e componentes desktop. |
| RNF19 | Manutenibilidade | Código por feature, nomes claros e DTOs. |
| RNF20 | Desempenho | Listagem simples, sem paginação. |
