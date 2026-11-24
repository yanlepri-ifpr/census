import { apiFetch } from "./api.js";
import { formatDateTime } from "./ui.js";

const list = document.getElementById("poll-list");
const listAlert = document.getElementById("listAlert");
const form = document.getElementById("pollForm");
const formAlert = document.getElementById("pollFormAlert");
const submitButton = document.getElementById("pollSubmitButton");
const newPollButton = document.getElementById("newPollButton");
const modal = window.bootstrap.Modal.getOrCreateInstance(document.getElementById("pollModal"));
const fields = {
  optionA: document.getElementById("optionAInput"),
  optionB: document.getElementById("optionBInput"),
  endsAt: document.getElementById("endsAtInput")
};

function showAlert(element, message, variant = "danger") {
  element.textContent = message;
  element.className = `alert alert-${variant}`;
}

function hideAlert(element) {
  element.textContent = "";
  element.className = "alert d-none";
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

function renderPoll(poll) {
  const column = document.createElement("div");
  column.className = "col-12";

  const card = document.createElement("article");
  card.className = "card h-100 p-4";

  const header = document.createElement("div");
  header.className = "d-flex align-items-start justify-content-between gap-3";

  const title = document.createElement("h2");
  title.className = "h2 mb-0";
  title.textContent = `${poll.optionA} vs ${poll.optionB}`;

  const badge = document.createElement("span");
  badge.className = `badge ${poll.status === "CLOSED" ? "badge-closed" : "badge-open"}`;
  badge.textContent = poll.status === "CLOSED" ? "Encerrada" : "Aberta";
  header.append(title, badge);

  const date = document.createElement("p");
  date.className = "small text-secondary mt-3 mb-0";
  date.textContent = `Encerra em ${formatDateTime(poll.endsAt)}`;

  card.append(header, date);
  column.append(card);
  return column;
}

async function loadPolls() {
  list.replaceChildren();
  const loading = document.createElement("div");
  loading.className = "col-12";
  loading.textContent = "Carregando enquetes...";
  list.append(loading);

  try {
    const polls = await apiFetch("/polls");
    list.replaceChildren();
    if (polls.length === 0) {
      const empty = document.createElement("div");
      empty.className = "col-12 text-secondary";
      empty.textContent = "Nenhuma enquete por enquanto.";
      list.append(empty);
      return;
    }
    polls.forEach((poll) => list.append(renderPoll(poll)));
  } catch (error) {
    list.replaceChildren();
    showAlert(listAlert, error.message ?? "Não foi possível carregar as enquetes.");
  }
}

newPollButton.addEventListener("click", () => {
  clearFormErrors();
  fields.endsAt.min = toDateTimeLocal(new Date());
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearFormErrors();

  const errors = validate();
  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([name, message]) => setFieldError(name, message));
    showAlert(formAlert, "Revise os campos enviados.");
    return;
  }

  submitButton.disabled = true;
  try {
    await apiFetch("/polls", {
      method: "POST",
      body: JSON.stringify({
        optionA: fields.optionA.value.trim(),
        optionB: fields.optionB.value.trim(),
        endsAt: new Date(fields.endsAt.value).toISOString()
      })
    });
    modal.hide();
    form.reset();
    fields.endsAt.min = toDateTimeLocal(new Date());
    showAlert(listAlert, "Enquete criada com sucesso.", "success");
    await loadPolls();
  } catch (error) {
    const fieldErrors = error.payload?.fieldErrors ?? {};
    Object.entries(fieldErrors).forEach(([name, message]) => setFieldError(name, message));
    showAlert(formAlert, error.message ?? "Não foi possível criar a enquete.");
  } finally {
    submitButton.disabled = false;
  }
});

fields.endsAt.min = toDateTimeLocal(new Date());
loadPolls();
