export async function loadComponent(path, selector) {
    const element = document.querySelector(selector);
    
    if (!element) {
        console.error(`[loadComponent] Target selector not found in the DOM: "${selector}"`);
        return false;
    }

    try {
        const response = await fetch(path);
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} (${response.statusText})`);
        }

        const html = await response.text();
        element.innerHTML = html;
        return true;

    } catch (error) {
        console.error(`[loadComponent] Failed to load component from path "${path}":`, error);
        
        element.innerHTML = `
            <div style="padding: 1rem; margin: 1rem 0; background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; border-radius: 6px; font-family: sans-serif;">
                <strong>Loading Error:</strong> Could not load component <code>${path}</code>.
            </div>
        `;
        return false;
    }
}

export function htmlCharacters(value) {
    const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(value ?? "").replace(/[&<>"']/g, (character) => entities[character]);
}

export function formatDate(deadline) {
    const date = new Date(`${deadline}T00:00:00`);

    if (!date || Number.isNaN(date.getTime())) {
        return "No date set";
    }

    return new Intl.DateTimeFormat("en", {
        month: "long",
        day: "numeric",
        year: "numeric"
    }).format(date);
}

export function safeResourceUrl(href) {
    if (!href) return "";

    if (href.startsWith("/") || href.startsWith("./") || href.startsWith("../")) {
        return href;
    }
    try {
        const url = new URL(href);
        return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
        return "";
    }
}
export function navigate(projectId, baseUrl = "/src/project/project-detail.html") {
    if (!projectId) return;

    const params = new URLSearchParams({ id: projectId });
    window.location.href = `${baseUrl}?${params.toString()}`;
}

export const DIALOG_TYPES = {
    CREATE_PROJECT: "CREATE_PROJECT",
    CREATE_TASK: "CREATE_TASK",
    EDIT_TASK: "EDIT_TASK",
    DELETE_CONFIRM: "DELETE_CONFIRM",
    CREATE_MILESTONE: "CREATE_MILESTONE",
    JOIN_PROJECT_CONFIRM: "JOIN_PROJECT_CONFIRM"
};

export function calculateProjectProgress(project) {
    const milestones = project.milestones ?? [];
    let totalTasks = 0;
    let completedTasks = 0;

    for (const milestone of milestones) {
        const tasks = milestone.tasks ?? [];
        for (const task of tasks) {
            totalTasks++;
            if (task.completed) {
                completedTasks++;
            }
        }
    }

    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
}