import { getUsers, createUser, getRandomAvatar } from "./api.js";
import { goTo, getInitials } from "./helpers.js";

const SESSION_KEY = "teamsync_user_id";

export async function registerUser(values) {
    const name = values.name.trim();
    const email = values.email.trim().toLowerCase();
    const password = values.password;

    if (name.length < 2) throw new Error("Please enter your full name.");
    if (!email.includes("@") || !email.includes(".")) throw new Error("Please enter a valid email address.");
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    if (password !== values.confirmPassword) throw new Error("Passwords do not match.");

    const users = await getUsers();
    const exists = users.find((user) => user.email === email);
    if (exists) throw new Error("An account with this email already exists.");

    const newUser = await createUser({
        name: name,
        initials: getInitials(name),
        email: email,
        password: password,
        avatar: await getRandomAvatar()
    });

    localStorage.setItem(SESSION_KEY, newUser.id);
}

export async function loginUser(values) {
    const email = values.email.trim().toLowerCase();

    const users = await getUsers();
    const user = users.find((u) => u.email === email && u.password === values.password);
    if (!user) throw new Error("Invalid email or password.");

    localStorage.setItem(SESSION_KEY, user.id);
}

export function logout() {
    localStorage.removeItem(SESSION_KEY);
    goTo("login");
}

export function isLoggedIn() {
    return localStorage.getItem(SESSION_KEY) !== null;
}

export function checkLogin(users) {
    const id = localStorage.getItem(SESSION_KEY);
    const user = users.find((u) => u.id === id);

    if (!user) {
        localStorage.removeItem(SESSION_KEY);
        goTo("login", { redirect: window.location.pathname + window.location.search });
        return null;
    }
    return user;
}

export function goAfterLogin() {
    const redirect = new URLSearchParams(window.location.search).get("redirect");

    if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
        window.location.href = redirect;
    } else {
        goTo("dashboard");
    }
}
