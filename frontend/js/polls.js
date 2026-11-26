import { apiFetch } from "./api.js";
import { getCurrentUser, isAuthenticated } from "./auth.js";
import { formatDateTime } from "./ui.js";

const list = document.getElementById("poll-list");
const listAlert = document.getElementById("listAlert");
const form = document.getElementById("pollForm");
const formAlert = document.getElementById("pollFormAlert");
const submitButton = document.getElementById("pollSubmitButton");
const newPollButton = document.getElementById("newPollButton");
const modalTitle = document.getElementById("pollModalTitle");
const modal = window.bootstrap.Modal.getOrCreateInstance(document.getElementById("pollModal"));
const fields = {
  optionA: document.getElementById("optionAInput"),
  optionB: document.getElementById("optionBInput"),
  endsAt: document.getElementById("endsAtInput")
};
let editingPollId = null;

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function showAlert(element, message, variant = "danger") {
  element.textContent = message;
  element.className = `alert alert-${variant}`;
}

function hideAlert(element) {
  element.textContent = "";
  element.className = "alert d-none";
}

function apiMessage(error, fallback) {
  if (error.status === 401) return "Faça login novamente para continuar.";
  return error.message ?? fallback;
}

function clearFormErrors() {
  hideAlert(formAlert);
  Object.values(fields).forEach((input) => input.classList.remove("is-invalid"));
  Object.keys(fields).forEach((name) => {
    document.getElementById(`${name}Error`).textContent = "";
  });
}

function setFieldError(name, message) {
  const input = fields[name];
  if (!input) return;
  const feedback = document.getElementById(`${name}Error`);
  if (message) {
    input.classList.add("is-invalid");
    if (feedback) feedback.textContent = message;
  } else {
    input.classList.remove("is-invalid");
    if (feedback) feedback.textContent = "";
  }
}

function toDateTimeLocal(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function validate() {
  const errors = {};
  const rawDate = fields.endsAt.value;
  const endsAt = rawDate ? new Date(rawDate) : null;

  if (!fields.optionA.value.trim()) errors.optionA = "Informe a opção A.";
  if (!fields.optionB.value.trim()) errors.optionB = "Informe a opção B.";
  if (!rawDate || Number.isNaN(endsAt.getTime())) {
    errors.endsAt = "Informe a data de encerramento.";
  } else if (endsAt.getTime() <= Date.now()) {
    errors.endsAt = "A data de encerramento deve ser futura.";
  }
  return errors;
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
  const button = createElement("button", `btn btn-sm ${className}`, label);
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}

function resultsLink(href) {
  const link = createElement("a", "small fw-semibold d-inline-block mt-2", "Ver resultados");
  link.href = href;
  return link;
}

function openEditModal(poll) {
  editingPollId = poll.id;
  modalTitle.textContent = "Editar enquete";
  submitButton.textContent = "Salvar alterações";
  clearFormErrors();
  fields.optionA.value = poll.optionA;
  fields.optionB.value = poll.optionB;
  fields.endsAt.min = toDateTimeLocal(new Date());
  fields.endsAt.value = toDateTimeLocal(new Date(poll.endsAt));
  modal.show();
}

function resetCreateModal() {
  editingPollId = null;
  modalTitle.textContent = "Nova enquete";
  submitButton.textContent = "Criar enquete";
  form.reset();
  clearFormErrors();
  fields.endsAt.min = toDateTimeLocal(new Date());
}

async function closePoll(poll) {
  if (!window.confirm("Encerrar esta enquete?")) return;
  try {
    await apiFetch(`/polls/${poll.id}/close`, { method: "PATCH" });
    showAlert(listAlert, "Enquete encerrada com sucesso.", "success");
    await loadPolls();
  } catch (error) {
    showAlert(listAlert, apiMessage(error, "Não foi possível encerrar a enquete."));
  }
}

async function deletePoll(poll) {
  if (!window.confirm("Excluir esta enquete?")) return;
  try {
    await apiFetch(`/polls/${poll.id}`, { method: "DELETE" });
    showAlert(listAlert, "Enquete excluída com sucesso.", "success");
    await loadPolls();
  } catch (error) {
    showAlert(listAlert, apiMessage(error, "Não foi possível excluir a enquete."));
  }
}

function renderPoll(poll) {
  const column = createElement("div", "col-md-6 col-xl-4");
  const card = createElement("article", "card h-100 p-4");

  const header = createElement("div", "d-flex align-items-start justify-content-between gap-3");

  const titleLink = createElement("a", "text-decoration-none text-reset");
  titleLink.href = `/poll.html?id=${encodeURIComponent(poll.id)}`;
  titleLink.append(createElement("h2", "h2 mb-0", `${poll.optionA} vs ${poll.optionB}`));

  const badge = createElement(
    "span",
    `badge ${poll.status === "CLOSED" ? "badge-closed" : "badge-open"}`,
    poll.status === "CLOSED" ? "Encerrada" : "Aberta"
  );
  header.append(titleLink, badge);

  const date = createElement("p", "small text-secondary mt-3 mb-0", `Encerra em ${formatDateTime(poll.endsAt)}`);

  const detailsLink = createElement("a", "small fw-semibold d-inline-block mt-3", "Ver detalhes");
  detailsLink.href = titleLink.href;

  card.append(header, date, detailsLink);

  if (poll.status === "OPEN") {
    if (poll.hasVoted) {
      card.append(createElement("p", "small fw-semibold text-success mt-2 mb-0", "Você votou nesta enquete."));
      card.append(resultsLink(titleLink.href));
    } else if (isAuthenticated()) {
      const voteLink = createElement("a", "small fw-semibold d-inline-block mt-2", "Votar");
      voteLink.href = titleLink.href;
      card.append(voteLink);
    } else {
      const loginLink = createElement("a", "small fw-semibold d-inline-block mt-2", "Entrar para votar");
      loginLink.href = "/login.html";
      card.append(loginLink);
    }
  } else {
    card.append(resultsLink(titleLink.href));
  }

  if (isCreator(poll)) {
    if (canManage(poll)) {
      const actions = createElement("div", "d-flex flex-wrap gap-2 mt-3");
      actions.append(actionButton("Editar", "btn-outline-primary", () => openEditModal(poll)));
      actions.append(actionButton("Encerrar", "btn-outline-secondary", () => closePoll(poll)));
      actions.append(actionButton("Excluir", "btn-outline-danger", () => deletePoll(poll)));
      card.append(actions);
    } else {
      card.append(createElement("p", "small text-secondary mt-3 mb-0", managementReason(poll)));
    }
  }

  column.append(card);
  return column;
}

async function loadPolls() {
  list.replaceChildren();
  const loading = createElement("div", "col-12", "Carregando enquetes...");
  list.append(loading);

  try {
    const polls = await apiFetch("/polls");
    list.replaceChildren();

    const editId = new URLSearchParams(window.location.search).get("edit");
    if (editId) {
      const poll = polls.find((item) => String(item.id) === editId);
      if (poll && isCreator(poll) && canManage(poll)) {
        openEditModal(poll);
      } else {
        showAlert(listAlert, "Não foi possível editar esta enquete.");
      }
      window.history.replaceState(null, "", window.location.pathname);
    }

    if (polls.length === 0) {
      list.append(createElement("div", "col-12 text-secondary", "Nenhuma enquete por enquanto."));
      return;
    }
    polls.forEach((poll) => list.append(renderPoll(poll)));
  } catch (error) {
    list.replaceChildren();
    showAlert(listAlert, apiMessage(error, "Não foi possível carregar as enquetes."));
  }
}

newPollButton.addEventListener("click", resetCreateModal);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearFormErrors();

  const errors = validate();
  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([name, message]) => setFieldError(name, message));
    showAlert(formAlert, "Revise os campos enviados.");
    return;
  }

  const body = JSON.stringify({
    optionA: fields.optionA.value.trim(),
    optionB: fields.optionB.value.trim(),
    endsAt: new Date(fields.endsAt.value).toISOString()
  });

  submitButton.disabled = true;
  try {
    if (editingPollId !== null) {
      await apiFetch(`/polls/${editingPollId}`, { method: "PUT", body });
      showAlert(listAlert, "Enquete atualizada com sucesso.", "success");
    } else {
      await apiFetch("/polls", { method: "POST", body });
      showAlert(listAlert, "Enquete criada com sucesso.", "success");
    }
    modal.hide();
    await loadPolls();
  } catch (error) {
    const fieldErrors = error.payload?.fieldErrors ?? {};
    Object.entries(fieldErrors).forEach(([name, message]) => setFieldError(name, message));
    showAlert(formAlert, apiMessage(error, "Não foi possível salvar a enquete."));
  } finally {
    submitButton.disabled = false;
  }
});

const flash = sessionStorage.getItem("census.flash");
if (flash) {
  sessionStorage.removeItem("census.flash");
  showAlert(listAlert, flash, "success");
}

fields.endsAt.min = toDateTimeLocal(new Date());
loadPolls();
