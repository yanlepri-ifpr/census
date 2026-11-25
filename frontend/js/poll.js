import { apiFetch } from "./api.js";
import { getCurrentUser } from "./auth.js";
import { formatDateTime } from "./ui.js";

const details = document.getElementById("pollDetails");
const management = document.getElementById("managementActions");
const alertBox = document.getElementById("pollAlert");
let currentPoll = null;

function showAlert(message) {
  alertBox.textContent = message;
  alertBox.classList.remove("d-none");
}

function hideAlert() {
  alertBox.textContent = "";
  alertBox.classList.add("d-none");
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

function renderOption(label, value) {
  const column = createElement("div", "col-md-6");
  const option = createElement("div", "poll-option p-4 h-100");
  option.append(createElement("span", "small text-secondary d-block mb-2", label));
  option.append(createElement("strong", "fs-5", value));
  column.append(option);
  return column;
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

function renderPoll(poll) {
  currentPoll = poll;

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
  options.append(renderOption("Opção A", poll.optionA));
  options.append(renderOption("Opção B", poll.optionB));

  details.replaceChildren(header, meta, optionsTitle, options);
  renderManagement(poll);
}

function renderInvalidId() {
  details.replaceChildren();
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
    renderPoll(poll);
  } catch (error) {
    details.replaceChildren();
    management.replaceChildren();
    showAlert(
      error.status === 404
        ? "Enquete não encontrada."
        : apiMessage(error, "Não foi possível carregar a enquete.")
    );
  }
}

loadPoll();
