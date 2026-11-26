import { apiFetch } from "./api.js";
import { getCurrentUser, isAuthenticated } from "./auth.js";
import { formatDateTime, formatPercent } from "./ui.js";

const details = document.getElementById("pollDetails");
const voting = document.getElementById("votingActions");
const results = document.getElementById("results");
const management = document.getElementById("managementActions");
const alertBox = document.getElementById("pollAlert");
let currentPoll = null;

function showAlert(message, success = false) {
  alertBox.textContent = message;
  alertBox.className = `alert ${success ? "alert-success" : "alert-danger alert-error"}`;
}

function hideAlert() {
  alertBox.textContent = "";
  alertBox.className = "alert alert-danger alert-error d-none";
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function apiMessage(error, fallback) {
  if (error.status === 401) return "Faça login novamente para continuar.";
  return error.message ?? fallback;
}

function isCreator(poll) {
  const user = getCurrentUser();
  return Boolean(user) && String(user.id) === String(poll.createdById);
}

function canManage(poll) {
  return poll.status === "OPEN" && !poll.hasVotes;
}

function managementReason(poll) {
  if (poll.status === "CLOSED") return "A enquete está encerrada e não pode ser alterada.";
  return "Não é possível alterar: a enquete já possui votos.";
}

function actionButton(label, className, onClick) {
  const button = createElement("button", `btn ${className}`, label);
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}

function redirectWithFlash(message) {
  sessionStorage.setItem("census.flash", message);
  window.location.assign("/");
}

async function closePoll() {
  if (!window.confirm("Encerrar esta enquete?")) return;
  try {
    await apiFetch(`/polls/${currentPoll.id}/close`, { method: "PATCH" });
    redirectWithFlash("Enquete encerrada com sucesso.");
  } catch (error) {
    showAlert(apiMessage(error, "Não foi possível encerrar a enquete."));
  }
}

async function deletePoll() {
  if (!window.confirm("Excluir esta enquete?")) return;
  try {
    await apiFetch(`/polls/${currentPoll.id}`, { method: "DELETE" });
    redirectWithFlash("Enquete excluída com sucesso.");
  } catch (error) {
    showAlert(apiMessage(error, "Não foi possível excluir a enquete."));
  }
}

function renderOption(label, value, selected) {
  const column = createElement("div", "col-md-6");
  const option = createElement("div", `poll-option p-4 h-100${selected ? " poll-option-selected" : ""}`);
  option.append(createElement("span", "small text-secondary d-block mb-2", label));
  option.append(createElement("strong", "fs-5", value));
  if (selected) {
    option.append(createElement("span", "badge badge-open d-inline-block mt-3", "Seu voto"));
  }
  column.append(option);
  return column;
}

function renderResultBar(label, votes, percent, barClass) {
  const wrapper = createElement("div", "mb-3");
  const info = createElement("div", "d-flex justify-content-between small mb-1");
  info.append(createElement("span", "fw-semibold", label));
  info.append(
    createElement("span", "text-secondary", `${votes} ${votes === 1 ? "voto" : "votos"} · ${formatPercent(percent)}`)
  );

  const progress = createElement("div", "progress");
  progress.setAttribute("role", "progressbar");
  progress.setAttribute("aria-valuenow", String(percent));
  progress.setAttribute("aria-valuemin", "0");
  progress.setAttribute("aria-valuemax", "100");
  const bar = createElement("div", `progress-bar ${barClass}`);
  bar.style.width = `${percent}%`;
  progress.append(bar);

  wrapper.append(info, progress);
  return wrapper;
}

function renderResults(result) {
  results.replaceChildren();
  const section = createElement("section");
  section.append(createElement("h2", "h2 mb-3", "Resultados"));
  section.append(renderResultBar(currentPoll.optionA, result.optionAVotes, result.optionAPercent, "bg-primary"));
  section.append(renderResultBar(currentPoll.optionB, result.optionBVotes, result.optionBPercent, "bg-secondary"));
  section.append(
    createElement(
      "p",
      "small text-secondary mt-2 mb-0",
      `Total de ${result.totalVotes} ${result.totalVotes === 1 ? "voto" : "votos"}.`
    )
  );
  results.append(section);
}

function showResultsMessage(message) {
  results.replaceChildren();
  results.append(createElement("div", "alert alert-secondary", message));
}

async function loadResults() {
  results.replaceChildren();

  if (currentPoll.status !== "CLOSED" && !currentPoll.hasVoted) {
    showResultsMessage("Vote para ver os resultados.");
    return;
  }

  results.append(createElement("div", "text-secondary", "Carregando resultados..."));
  try {
    const result = await apiFetch(`/polls/${currentPoll.id}/results`);
    renderResults(result);
  } catch (error) {
    if (error.status === 403) {
      showResultsMessage("Vote para ver os resultados.");
      return;
    }
    showResultsMessage(apiMessage(error, "Não foi possível carregar os resultados."));
  }
}

async function submitVote(option, buttons) {
  buttons.forEach((button) => {
    button.disabled = true;
  });
  hideAlert();

  try {
    await apiFetch(`/polls/${currentPoll.id}/votes`, {
      method: "POST",
      body: JSON.stringify({ option })
    });
    currentPoll.hasVotes = true;
    currentPoll.hasVoted = true;
    currentPoll.votedOption = option;
    showAlert("Voto registrado com sucesso.", true);
    renderHeaderAndOptions(currentPoll);
    renderVoting(currentPoll);
    renderManagement(currentPoll);
    await loadResults();
  } catch (error) {
    if (error.status === 409 && String(error.message).includes("já votou")) {
      currentPoll.hasVotes = true;
      currentPoll.hasVoted = true;
      renderVoting(currentPoll);
      renderManagement(currentPoll);
    }
    showAlert(apiMessage(error, "Não foi possível registrar o voto."));
  } finally {
    buttons.forEach((button) => {
      button.disabled = false;
    });
  }
}

function renderVoting(poll) {
  voting.replaceChildren();

  if (poll.status === "CLOSED") {
    voting.append(createElement("div", "alert alert-secondary", "A votação está encerrada."));
    return;
  }

  if (!isAuthenticated()) {
    const login = createElement("a", "btn btn-primary", "Entrar para votar");
    login.href = "/login.html";
    voting.append(createElement("h2", "h2 mb-3", "Votar"), login);
    return;
  }

  if (poll.hasVoted) {
    const chosenOption = poll.votedOption ? ` na opção ${poll.votedOption}` : "";
    voting.append(createElement("div", "alert alert-success", `Você já votou${chosenOption}.`));
    return;
  }

  const buttons = [];
  const choices = [
    { label: "Opção A", value: "A", option: poll.optionA, className: "btn-primary" },
    { label: "Opção B", value: "B", option: poll.optionB, className: "btn-outline-primary" }
  ];
  const row = createElement("div", "row g-3");

  choices.forEach((choice) => {
    const column = createElement("div", "col-md-6");
    const button = createElement("button", `btn ${choice.className} w-100 py-3`);
    button.type = "button";
    button.append(createElement("span", "small d-block", choice.label));
    button.append(createElement("strong", "fs-5", choice.option));
    button.addEventListener("click", () => submitVote(choice.value, buttons));
    buttons.push(button);
    column.append(button);
    row.append(column);
  });

  voting.append(
    createElement("h2", "h2 mb-3", "Votar"),
    createElement("p", "text-secondary", "Escolha uma opção. Seu voto não pode ser alterado."),
    row
  );
}

function renderManagement(poll) {
  management.replaceChildren();
  if (!isCreator(poll)) return;

  management.append(createElement("h2", "h2 mb-3", "Gerenciar enquete"));
  if (!canManage(poll)) {
    management.append(createElement("div", "alert alert-secondary small", managementReason(poll)));
    return;
  }

  const actions = createElement("div", "d-flex flex-wrap gap-2");
  const edit = createElement("a", "btn btn-outline-primary", "Editar");
  edit.href = `/?edit=${encodeURIComponent(poll.id)}`;
  actions.append(edit);
  actions.append(actionButton("Encerrar", "btn-outline-secondary", closePoll));
  actions.append(actionButton("Excluir", "btn-outline-danger", deletePoll));
  management.append(actions);
}

function renderHeaderAndOptions(poll) {
  const header = createElement("div", "d-flex align-items-start justify-content-between gap-3");
  header.append(createElement("h1", "h1 mb-0", `${poll.optionA} vs ${poll.optionB}`));

  const badge = createElement(
    "span",
    `badge ${poll.status === "CLOSED" ? "badge-closed" : "badge-open"}`,
    poll.status === "CLOSED" ? "Encerrada" : "Aberta"
  );
  header.append(badge);

  const meta = createElement("div", "mt-3");
  meta.append(createElement("p", "small text-secondary mb-1", `Encerra em ${formatDateTime(poll.endsAt)}`));
  meta.append(createElement("p", "small text-secondary mb-0", `Criada por ${poll.createdByName}`));

  const optionsTitle = createElement("h2", "h2 mt-5 mb-3", "Opções");
  const options = createElement("div", "row g-3");
  options.append(renderOption("Opção A", poll.optionA, poll.hasVoted && poll.votedOption === "A"));
  options.append(renderOption("Opção B", poll.optionB, poll.hasVoted && poll.votedOption === "B"));

  details.replaceChildren(header, meta, optionsTitle, options);
}

async function renderPoll(poll) {
  currentPoll = poll;
  results.replaceChildren();
  renderHeaderAndOptions(poll);
  renderVoting(poll);
  renderManagement(poll);
  await loadResults();
}

function renderInvalidId() {
  details.replaceChildren();
  voting.replaceChildren();
  results.replaceChildren();
  management.replaceChildren();
  showAlert("Enquete inválida.");
}

async function loadPoll() {
  hideAlert();
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id || !/^\d+$/.test(id)) {
    renderInvalidId();
    return;
  }

  try {
    const poll = await apiFetch(`/polls/${encodeURIComponent(id)}`);
    await renderPoll(poll);
  } catch (error) {
    details.replaceChildren();
    voting.replaceChildren();
    results.replaceChildren();
    management.replaceChildren();
    showAlert(
      error.status === 404
        ? "Enquete não encontrada."
        : apiMessage(error, "Não foi possível carregar a enquete.")
    );
  }
}

loadPoll();
