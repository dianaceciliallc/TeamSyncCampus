const APP_ROOT = new URL("../", import.meta.url);

export function appUrl(path) {
    return new URL(path, APP_ROOT).href;
}

const PAGES = {
    dashboard: "index.html",
    project: "project/project-detail.html",
    login: "auth-pages/login.html",
    register: "auth-pages/register.html"
};

export function goTo(page, params = {}) {
    const url = new URL(PAGES[page] || page, APP_ROOT);
    for (const key in params) {
        if (params[key]) {
            url.searchParams.set(key, params[key]);
        }
    }
    window.location.href = url.href;
}

export async function loadComponent(path, selector) {
    const element = document.querySelector(selector);
    if (!element) return;

    try {
        const response = await fetch(path);
        element.innerHTML = await response.text();
    } catch (error) {
        console.error("Could not load " + path, error);
    }
}

export function escapeHtml(text) {
    return String(text === undefined || text === null ? "" : text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function formatDate(dateString) {
    if (!dateString) return "No date set";

    const date = new Date(dateString + "T00:00:00");
    if (isNaN(date.getTime())) return "No date set";

    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export const STATUS_LABELS = {
    "not-started": "Not started",
    "in-progress": "In progress",
    "completed": "Completed"
};

export function getStatusLabel(status) {
    return STATUS_LABELS[status] || "Not started";
}

export function generateId(prefix) {
    return prefix + "-" + Date.now().toString(36) + Math.floor(Math.random() * 1000);
}

export function getInitials(name) {
    const words = name.trim().split(" ");
    let initials = words[0][0];
    if (words.length > 1) {
        initials += words[words.length - 1][0];
    }
    return initials.toUpperCase();
}

export function calculateProgress(project) {
    let total = 0;
    let done = 0;

    for (const milestone of project.milestones) {
        for (const task of milestone.tasks) {
            total++;
            if (task.completed) done++;
        }
    }

    if (total === 0) return 0;
    return Math.round((done / total) * 100);
}

export function showAlert(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = "toast toast--" + type;
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.append(toast);

    setTimeout(() => toast.remove(), 2800);
}

export function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type: type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

export function avatarHtml(user) {
    if (user.avatar) {
        return `<img class="avatar-photo" src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}">`;
    }
    return escapeHtml(user.initials);
}

export const ICON_EDIT = `
    <svg class="icon-pencil" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>`;

export const ICON_DELETE = `
    <svg class="icon-close" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`;
