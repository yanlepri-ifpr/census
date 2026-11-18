# Census: Visão do produto

## Problema

Perguntas leves e divisivas do cotidiano, como “café ou chá?” ou “trabalho remoto ou presencial?”, costumam virar discussão informal sem registro e sem um lugar para comparar preferências. Enquetes rápidas em redes sociais resolvem parte disso, mas são efêmeras, difíceis de revisitar e não oferecem um histórico organizado nem regras claras de participação. Falta um espaço descontraído onde qualquer pessoa possa propor uma disputa entre duas opções, votar uma vez e descobrir o que a comunidade prefere.

## Público-alvo

- Pessoas que gostam de enquetes rápidas, leves e sociais.
- Grupos de amigos, turmas e comunidades online que querem resolver dúvidas divertidas.
- Criadores de enquetes: qualquer usuário cadastrado pode propor “A vs B”.
- Participantes que querem votar uma vez e ver imediatamente o resultado.
- Visitantes que acompanham enquetes já encerradas.

## Proposta de valor

O Census transforma perguntas cotidianas em disputas binárias simples e sociais:

- qualquer usuário cadastrado cria uma enquete com duas opções e uma data de encerramento;
- a disputa é exibida como “A vs B”;
- cada usuário vota uma vez e o voto é imutável;
- ao votar, o participante passa a ver contagens e percentuais;
- após o encerramento, os resultados ficam públicos para qualquer visitante;
- o criador pode editar, excluir ou encerrar sua enquete apenas enquanto ela estiver aberta e sem votos.

## Resumo funcional

- Visitantes veem a lista de enquetes, o status e, após o encerramento, os resultados.
- Usuários se cadastram, entram, criam enquetes, votam uma vez e veem resultados após o voto.
- O criador edita, exclui e encerra antecipadamente somente as próprias enquetes, e apenas se estiverem abertas e sem votos.
- Após o primeiro voto, a enquete não pode ser editada, excluída nem encerrada antecipadamente. Fecha apenas na data.

## Escopo

### Incluído

- Cadastro de usuário.
- Login e logout.
- Criação de enquete por qualquer usuário autenticado.
- Listagem pública de enquetes.
- Detalhe da enquete.
- Edição, exclusão e encerramento pelo criador, somente enquanto aberta e sem votos.
- Voto único e imutável.
- Resultados visíveis após o voto e públicos após o encerramento.
- Encerramento automático por data.
- Validações e mensagens de erro.
- Autenticação via JWT.
- Documentação completa.

### Excluído

- Campo de pergunta (a enquete é apenas “A vs B”).
- Mais de duas opções.
- Papel de administrador.
- Edição, exclusão ou encerramento de enquete com votos.
- Edição, exclusão ou encerramento de enquete encerrada.
- Alteração ou remoção de voto.
- Reset de senha.
- Verificação de e-mail.
- Gestão, bloqueio ou promoção de usuários.
- Comentários.

## Premissas

- Não há papéis de usuário; basta estar autenticado.
- Qualquer usuário autenticado pode votar, inclusive o criador da enquete.
- O criador é o único responsável pela própria enquete.
- O voto é imutável e único por usuário por enquete.