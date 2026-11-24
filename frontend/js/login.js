import { apiFetch } from "./api.js";
import { saveSession } from "./auth.js";

const form = document.getElementById("loginForm");
const alertBox = document.getElementById("formAlert");
const submitButton = document.getElementById("submitButton");
const fields = {
  email: document.getElementById("emailInput"),
  password: document.getElementById("passwordInput")
};

function showAlert(message) {
  alertBox.textContent = message;
  alertBox.classList.remove("d-none");
}

function clearErrors() {
  alertBox.textContent = "";
  alertBox.classList.add("d-none");
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

function validate() {
  const errors = {};
  const email = fields.email.value.trim();

  if (!email) {
    errors.email = "Informe seu e-mail.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Informe um e-mail válido.";
  }
  if (!fields.password.value) errors.password = "Informe sua senha.";
  return errors;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const errors = validate();
  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(([name, message]) => setFieldError(name, message));
    showAlert("Revise os campos enviados.");
    return;
  }

  submitButton.disabled = true;
  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: fields.email.value.trim(),
        password: fields.password.value
      })
    });
    saveSession(data);
    window.location.assign("/");
  } catch (error) {
    showAlert(error.message ?? "Credenciais inválidas.");
  } finally {
    submitButton.disabled = false;
  }
});
