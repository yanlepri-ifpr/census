import { apiFetch } from "./api.js";

const form = document.getElementById("registerForm");
const alertBox = document.getElementById("formAlert");
const submitButton = document.getElementById("submitButton");
const fields = {
  name: document.getElementById("nameInput"),
  email: document.getElementById("emailInput"),
  password: document.getElementById("passwordInput"),
  passwordConfirmation: document.getElementById("passwordConfirmationInput")
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
  const name = fields.name.value.trim();
  const email = fields.email.value.trim();
  const password = fields.password.value;
  const confirmation = fields.passwordConfirmation.value;

  if (!name) errors.name = "Informe seu nome.";
  if (!email) {
    errors.email = "Informe seu e-mail.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Informe um e-mail válido.";
  }
  if (password.length < 8 || password.length > 64) {
    errors.password = "A senha deve ter de 8 a 64 caracteres.";
  } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password)) {
    errors.password = "Use maiúscula, minúscula, número e símbolo.";
  }
  if (confirmation !== password) {
    errors.passwordConfirmation = "As senhas não conferem.";
  }
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
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        password: fields.password.value,
        passwordConfirmation: fields.passwordConfirmation.value
      })
    });
    window.location.assign("/login.html");
  } catch (error) {
    const fieldErrors = error.payload?.fieldErrors ?? {};
    Object.entries(fieldErrors).forEach(([name, message]) => setFieldError(name, message));
    showAlert(error.message ?? "Não foi possível concluir o cadastro.");
  } finally {
    submitButton.disabled = false;
  }
});
