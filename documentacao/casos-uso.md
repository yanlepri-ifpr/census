# Census: Casos de uso

## UC01: Cadastrar usuário

- **Ator:** Visitante. **Requisitos:** RF01, RNF04.
- **Pré-condição:** e-mail ainda não cadastrado.
- **Fluxo principal:** acessa o cadastro → informa nome, e-mail, senha e confirmação → envia `POST /api/auth/register` → backend valida, normaliza o e-mail, gera hash BCrypt e cria o usuário → retorna `201` → frontend abre o login.
- **Exceções:** campos inválidos ou senha fraca retornam `400`; e-mail duplicado retorna `409`; falha de rede permite nova tentativa.
- **Pós-condição:** usuário criado, sem token emitido.

## UC02: Login e logout

- **Ator:** Usuário. **Requisitos:** RF02, RNF05.
- **Pré-condição:** usuário cadastrado.
- **Fluxo principal (login):** informa e-mail e senha → envia `POST /api/auth/login` → backend valida e retorna JWT com dados do usuário → frontend salva `census.token` e `census.user` e abre a lista.
- **Fluxo principal (logout):** clica em “Sair” → frontend remove as chaves do `localStorage` → redireciona.
- **Exceções:** credenciais inválidas retornam `401`; token inválido em requisição posterior limpa a sessão; falha de rede permite nova tentativa.
- **Pós-condição:** sessão ativa no cliente; logout remove o token local.

## UC03: Usuário cria enquete

- **Ator:** Usuário autenticado. **Requisitos:** RF03.
- **Pré-condição:** ator autenticado.
- **Fluxo principal:** clica em “Nova enquete” → informa A, B e `endsAt` → envia `POST /api/polls` → backend valida e cria a enquete → retorna `201` → frontend atualiza a lista.
- **Exceções:** opções vazias ou data passada retornam `400`; visitante retorna `401`; falha de rede permite nova tentativa.
- **Pós-condição:** enquete criada como `OPEN`.

## UC04: Listar enquetes

- **Atores:** Visitante, Usuário. **Requisitos:** RF04, RF11.
- **Pré-condição:** nenhuma.
- **Fluxo principal:** frontend chama `GET /api/polls` → backend calcula status → frontend renderiza cards “A vs B” com status, data e link para o detalhe; ao abrir um card, `GET /api/polls/{id}` devolve as opções, o criador e o status da enquete. A sinalização de voto do observador é acrescentada junto ao voto (UC05).
- **Exceções:** lista vazia exibe estado vazio; detalhe inexistente retorna `404` e id inválido é recusado no cliente; falha de rede exibe erro e opção de recarregar.
- **Pós-condição:** nenhuma alteração de estado.

## UC05: Votar

- **Ator:** Usuário autenticado. **Requisitos:** RF08, RF09, RNF12.
- **Pré-condição:** enquete aberta e ator ainda não votou.
- **Fluxo principal:** abre `poll.html?id={id}` → seleciona A ou B → envia `POST /api/polls/{id}/votes` → backend valida e grava o voto → retorna `201` com resultados → frontend exibe as contagens.
- **Exceções:** visitante retorna `401`; enquete encerrada ou voto duplicado retornam `409`; opção inválida retorna `400`; enquete inexistente retorna `404`; a constraint única resolve concorrência.
- **Pós-condição:** voto registrado e imutável.

## UC06: Ver resultados

- **Atores:** Visitante, Usuário. **Requisitos:** RF09, RF10.
- **Pré-condição:** enquete existente.
- **Fluxo principal:** frontend chama `GET /api/polls/{id}/results` → backend libera se encerrada ou se o usuário já votou → retorna contagens e percentuais → frontend mostra barras e texto.
- **Exceções:** resultados indisponíveis retornam `403`; enquete inexistente retorna `404`; falha de rede permite nova tentativa.
- **Pós-condição:** nenhuma alteração de estado.

## UC07: Usuário edita enquete

- **Ator:** Criador. **Requisitos:** RF05.
- **Pré-condição:** enquete aberta, sem votos e criada pelo ator.
- **Fluxo principal:** clica em “Editar” → ajusta A, B e `endsAt` → envia `PUT /api/polls/{id}` → backend valida autoria, status aberto e zero votos → retorna `200` com o detalhe → frontend recarrega a lista. No detalhe, “Editar” abre o mesmo formulário na lista com `?edit={id}`.
- **Exceções:** outro usuário recebe `403`; com votos ou encerrada retorna `409`; dados inválidos retornam `400`; visitante retorna `401`; enquete inexistente retorna `404`. A interface mostra o motivo quando a ação está indisponível.
- **Pós-condição:** enquete atualizada.

## UC08: Usuário exclui enquete

- **Ator:** Criador. **Requisitos:** RF06.
- **Pré-condição:** enquete aberta, sem votos e criada pelo ator.
- **Fluxo principal:** clica em “Excluir” → confirma → envia `DELETE /api/polls/{id}` → backend valida autoria, status aberto e zero votos, remove e retorna `204` → frontend recarrega a lista e mostra a confirmação.
- **Exceções:** outro usuário recebe `403`; com votos ou encerrada retorna `409`; visitante retorna `401`; enquete inexistente retorna `404`; cancelar a confirmação não envia requisição.
- **Pós-condição:** enquete removida.

## UC09: Usuário encerra enquete antecipadamente

- **Ator:** Criador. **Requisitos:** RF07.
- **Pré-condição:** enquete aberta, sem votos e criada pelo ator.
- **Fluxo principal:** clica em “Encerrar” → confirma → envia `PATCH /api/polls/{id}/close` → backend valida autoria, status aberto e zero votos, preenche `closedAt` e retorna `200` → frontend recarrega a tela; os resultados passam a ser públicos.
- **Exceções:** outro usuário recebe `403`; com votos ou já encerrada retorna `409`; visitante retorna `401`; enquete inexistente retorna `404`.
- **Pós-condição:** enquete `CLOSED` e resultados públicos.

## UC10: Encerramento automático

- **Ator:** Sistema. **Requisitos:** RF10, RF11.
- **Pré-condição:** `now >= endsAt`.
- **Fluxo principal:** leitura da enquete calcula `closedAt != null || now >= endsAt` → status vira `CLOSED` → resultados ficam públicos.
- **Exceção:** não há scheduler; `closedAt` permanece nulo no encerramento automático.
- **Pós-condição:** status `CLOSED`.

## UC11: Logout

- **Ator:** Usuário. **Requisitos:** RF02.
- **Pré-condição:** token armazenado no cliente.
- **Fluxo principal:** clica em “Sair” → frontend remove `census.token` e `census.user` → redireciona.
- **Exceção:** sem token, apenas redireciona.
- **Pós-condição:** ações protegidas voltam a exigir login.
