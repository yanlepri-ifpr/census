export const TOKEN_KEY = "census.token";
export const USER_KEY = "census.user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken()) && Boolean(getCurrentUser());
}

export function saveSession(data) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  setupHeader();
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  setupHeader();
}

export function requireAuth() {
  if (isAuthenticated()) return true;
  window.location.assign("/login.html");
  return false;
}

function setVisible(element, visible) {
  if (visible) {
    element.classList.remove("d-none");
    element.classList.add("d-flex");
  } else {
    element.classList.add("d-none");
    element.classList.remove("d-flex");
  }
}

export function setupHeader() {
  const guestLinks = document.getElementById("guestLinks");
  const userLinks = document.getElementById("userLinks");
  const userEmail = document.getElementById("userEmail");
  const logoutLink = document.getElementById("logoutLink");
  if (!guestLinks || !userLinks) return;

  if (!getToken()) {
    localStorage.removeItem(USER_KEY);
  }

  const user = getCurrentUser();
  if (user) {
    setVisible(guestLinks, false);
    setVisible(userLinks, true);
    userEmail.textContent = user.email ?? "";
  } else {
    setVisible(guestLinks, true);
    setVisible(userLinks, false);
    userEmail.textContent = "";
  }

  if (logoutLink) {
    logoutLink.onclick = (event) => {
      event.preventDefault();
      clearSession();
      window.location.assign("/");
    };
  }
}

setupHeader();
