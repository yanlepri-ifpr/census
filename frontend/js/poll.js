import { apiFetch } from "./api.js";
import { formatDateTime } from "./ui.js";

const details = document.getElementById("pollDetails");
const alertBox = document.getElementById("pollAlert");

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

function renderOption(label, value) {
  const column = document.createElement("div");
  column.className = "col-md-6";

  const option = createElement("div", "poll-option p-4 h-100");
  option.append(createElement("span", "small text-secondary d-block mb-2", label));
  option.append(createElement("strong", "fs-5", value));
  column.append(option);
  return column;
}

function renderPoll(poll) {
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
}

function renderInvalidId() {
  details.replaceChildren();
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
    showAlert(
      error.status === 404
        ? "Enquete não encontrada."
        : error.message ?? "Não foi possível carregar a enquete."
    );
  }
}

loadPoll();
