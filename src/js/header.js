import { escapeHtml } from "./helpers.js";
import { logout } from "./auth.js";

export function showUserInHeader(user) {
    for (const element of document.querySelectorAll("[data-user-initials]")) {
        if (user.avatar) {
            element.innerHTML = `<img class="avatar-photo" src="${escapeHtml(user.avatar)}" alt="">`;
        } else {
            element.textContent = user.initials;
        }
    }
    for (const element of document.querySelectorAll("[data-user-name]")) {
        element.textContent = user.name;
    }
    for (const element of document.querySelectorAll("[data-user-email]")) {
        element.textContent = user.email;
    }
}

export function fillCourseFilter(projects, selected) {
    const select = document.querySelector('[data-action="filter-course"]');
    if (!select) return;

    const courses = [];
    for (const project of projects) {
        if (project.course && !courses.includes(project.course)) {
            courses.push(project.course);
        }
    }
    courses.sort();

    select.innerHTML = '<option value="all">All</option>';
    for (const course of courses) {
        select.innerHTML += `<option value="${escapeHtml(course)}">${escapeHtml(course)}</option>`;
    }

    select.value = courses.includes(selected) ? selected : "all";
}

export function setSearchValue(text) {
    const input = document.querySelector('[data-action="search-projects"]');
    if (input) input.value = text;
}

function toggleProfileMenu(open) {
    const menu = document.querySelector(".profile-menu");
    const button = document.querySelector('[data-action="toggle-profile-menu"]');
    if (!menu || !button) return;

    if (open === undefined) {
        open = !menu.classList.contains("is-open");
    }
    menu.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
}

export function closeMenuOnOutsideClick() {
    document.addEventListener("click", (event) => {
        if (!event.target.closest(".profile-menu-wrapper")) toggleProfileMenu(false);
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") toggleProfileMenu(false);
    });
}

export const headerActions = {
    "toggle-profile-menu": () => toggleProfileMenu(),
    "sign-out": () => logout()
};
