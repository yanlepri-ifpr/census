# Census: Interface

## Identidade

- Tema claro, minimalista, leve e descontraído.
- Bootstrap 5 como base de layout e componentes desktop, com tema customizado.
- Azul como cor principal, com neutros e cores semânticas.
- Tom de voz direto e claro, em português.

## Paleta de cores

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#2563EB` | Botões primários e links |
| `--color-primary-dark` | `#1E40AF` | Hover |
| `--color-primary-light` | `#DBEAFE` | Destaques suaves |
| `--color-success` | `#10B981` | Indicadores positivos |
| `--color-success-bg` | `#D1FAE5` | Fundo do badge “Aberta” |
| `--color-success-text` | `#065F46` | Texto do badge “Aberta” |
| `--color-danger` | `#EF4444` | Erros e exclusão |
| `--color-danger-bg` | `#FEE2E2` | Fundo de alerta de erro |
| `--color-danger-text` | `#991B1B` | Texto de erro |
| `--color-warning` | `#F59E0B` | Avisos |
| `--color-warning-bg` | `#FEF3C7` | Fundo de aviso |
| `--color-warning-text` | `#92400E` | Texto de aviso |
| `--color-text` | `#0F172A` | Texto principal |
| `--color-text-muted` | `#64748B` | Texto secundário |
| `--color-border` | `#E2E8F0` | Bordas e divisores |
| `--color-bg` | `#F8FAFC` | Fundo da página |
| `--color-surface` | `#FFFFFF` | Cards, header e modal |

Badge “Encerrada” usa `--color-border` no fundo e `--color-text-muted` no texto.

## Tipografia

- Família: `Inter`, com fallback `system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`.
- Bootstrap 5.3.9 via jsDelivr, com SRI.
- Sem CDN de fontes.

| Elemento | Tamanho / linha | Peso |
|---|---|---|
| H1 | 32px / 40px | 700 |
| H2 | 24px / 32px | 600 |
| H3 | 20px / 28px | 600 |
| Corpo | 16px / 24px | 400 |
| Pequeno | 14px / 20px | 400 |
| Legenda | 12px / 16px | 500 |
| Botão | 16px / 24px | 600 |

Espaçamento em 4/8/12/16/24/32/48px; container máximo de 1100px; raios de 8px em cards, 6px em botões/inputs e 999px em badges; sombra discreta.

## Organização das telas

### `index.html`: Lista de enquetes

- Header: wordmark, link “Enquetes” e “Entrar”/“Criar conta” ou e-mail/“Sair”.
- Conteúdo: título “Enquetes” com botão “Nova enquete” à direita para usuário autenticado, grid de cards carregado de `GET /api/polls`, estados vazio/carregando/erro e alerta de sucesso após criação.
- Card: título “A vs B” e link “Ver detalhes” para `poll.html?id={id}`, badge de status, data de encerramento e, em enquetes abertas, a ação de voto disponível para o observador.
- Ações: “Votar” aparece para usuário autenticado que ainda não votou, “Entrar para votar” para visitante e “Você votou nesta enquete.” para quem já participou; “Ver resultados” entra na feature seguinte. Para o criador, “Editar”, “Encerrar” e “Excluir” aparecem somente com enquete aberta e sem votos; caso contrário, o card explica o motivo.
- Modal: `optionA`, `optionB` e `endsAt` em `datetime-local`, sem campo de pergunta. Serve para criar e editar; o cliente converte a data para ISO-8601 UTC antes de enviar.

### `login.html` e `register.html`

- Card centralizado até 420px.
- Login: e-mail, senha, links para cadastro e volta à lista.
- Cadastro: nome, e-mail, senha e confirmação; política de 8 a 64 caracteres com maiúscula, minúscula, número e símbolo; após sucesso abre o login.
- Login válido guarda a sessão no navegador, troca o header para e-mail/“Sair” e abre a lista de enquetes.
- Alertas de erro; sucesso no cadastro redireciona para o login.

### `poll.html`: Detalhe

- Cabeçalho com “A vs B”, badge de status, data de encerramento e nome do criador.
- Opções A e B em destaque em dois blocos lado a lado, com link para voltar à lista.
- Id inválido ou enquete inexistente exibem erro em português.
- Seção “Gerenciar enquete” aparece só para o criador, com “Editar” (abre o formulário na lista), “Encerrar” e “Excluir” quando a enquete está aberta e sem votos; caso contrário, mostra o motivo do bloqueio.
- Confirmação de encerramento ou exclusão retorna à lista com alerta de sucesso.
- Seção “Votar” com botões para A e B aparece para usuário autenticado em enquete aberta; visitante vê “Entrar para votar”. Após o voto, a opção escolhida é destacada, os botões são removidos e contagens/percentuais aparecem em barras com o total de votos.

## Componentes

Bootstrap 5 fornece grid, botões, formulários, card, badge, alerta, modal e progress. O projeto adiciona barra de resultado, estado vazio, loading e confirmação.

## Diretrizes de UI

- Foco em desktop; uma ação primária por tela; status sempre visível.
- Botões desabilitados durante requisições para evitar duplo clique.
- Validação inline nos campos e alerta global para erros de API.
- Em `401` de rota protegida, limpar a sessão local; o logout remove token e dados do usuário.
- Ações do criador usam confirmação; após redirecionamento, a mensagem de sucesso é transportada por `census.flash`.
- Modal com `Esc` para fechar e clique no backdrop.
- Datas em `pt-BR` em `America/Sao_Paulo`.
- Texto de opções via `textContent`; nunca `innerHTML` com dados de usuário.
- Sem tema escuro, sem animações longas e sem frameworks adicionais além do Bootstrap 5.

## Desktop

- Layout desktop a partir de 1200px; grid de 2 e 3 colunas; sem adaptação para celular.
- Botões e campos com área clicável ampla; modal até 560px; sem rolagem horizontal.

## Mensagens principais

| Contexto | Mensagem |
|---|---|
| Enquete criada | “Enquete criada com sucesso.” |
| Enquete atualizada | “Enquete atualizada com sucesso.” |
| Enquete encerrada pelo criador | “Enquete encerrada com sucesso.” |
| Enquete excluída | “Enquete excluída com sucesso.” |
| Voto registrado | “Voto registrado com sucesso.” |
| Já votou | “Você já votou nesta enquete.” |
| Opção inválida | “Escolha a opção A ou B.” |
| Resultados ocultos | “Vote para ver os resultados.” |
| Resultados públicos | “Resultados disponíveis após o encerramento.” |
| Sem permissão | “Somente o criador pode executar esta ação.” |
| Enquete com votos | “Não é possível alterar: a enquete já possui votos.” |
| Enquete encerrada | “A enquete está encerrada.” |
| Data passada | “A data de encerramento deve ser futura.” |
| E-mail duplicado | “E-mail já cadastrado.” |
| Senha fraca | “Use maiúscula, minúscula, número e símbolo.” |
| Senhas divergentes | “As senhas não conferem.” |
| Credenciais inválidas | “Credenciais inválidas.” |
| Erro de rede | “Não foi possível conectar ao servidor. Tente novamente.” |
| Não encontrada | “Enquete não encontrada.” |
| ID inválido | “Enquete inválida.” / “Identificador inválido.” |
