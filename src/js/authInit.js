import { seedIfEmpty } from "./api.js";
import { loginUser, registerUser, isLoggedIn, goAfterLogin } from "./auth.js";
import { bindActions } from "./events.js";

document.addEventListener("DOMContentLoaded", startAuthPage);

async function startAuthPage() {
    if (isLoggedIn()) {
        goAfterLogin();
        return;
    }

    const button = document.querySelector('button[type="submit"]');
    const alertBox = document.querySelector('[role="alert"]');

    button.disabled = true;
    try {
        await seedIfEmpty();
    } catch (error) {
        console.error(error);
        alertBox.textContent = "Could not connect to the server. Check the API_URL in js/api.js.";
        alertBox.hidden = false;
    }
    button.disabled = false;

    bindActions({
        login: (form) => submitForm(form, loginUser),
        register: (form) => submitForm(form, registerUser)
    });
}

async function submitForm(form, sendFunction) {
    const alertBox = form.querySelector('[role="alert"]');
    const button = form.querySelector('button[type="submit"]');
    const values = Object.fromEntries(new FormData(form));

    alertBox.hidden = true;
    button.disabled = true;

    try {
        await sendFunction(values);
        goAfterLogin();
    } catch (error) {
        alertBox.textContent = error.message;
        alertBox.hidden = false;
        button.disabled = false;
    }
}
