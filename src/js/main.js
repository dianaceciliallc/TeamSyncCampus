import { StorageService } from "./services/storage.mjs";
import { loadComponent, navigate } from "./utils/helpers.mjs";
import { ProjectCard } from "./components/ProjectCard.mjs";
import { handleProjectEvents } from "./events/events.js";
import { DialogSetup } from "./dialogs/dialogSetUp.mjs"

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await initLayout();

        const response = await loadInitialData();

        const storage = new StorageService(response);
        const data = storage.getData();

        const dialogSetup = new DialogSetup(storage);
        dialogSetup.init();

        setupDashboard(data, storage);
    } catch (error) {
        console.error("Error al inicializar la aplicación:", error);
    }
});

async function initLayout() {
    await Promise.all([
        loadComponent("./ui-components/header.html", "#site-header"),
        loadComponent("./ui-components/footer.html", "#site-footer"),
        loadComponent("./ui-components/dashboard.html", "#main-content"),
    ]);
}

async function loadInitialData() {
    const response = await fetch(new URL("../assets/data.json", import.meta.url));
    return await response.json();
}

function setupDashboard(data, storage) {
    const usersById = new Map(data.users.map((user) => [user.id, user]));

    setupCoursesFilter(data.projects);

    renderProjectsList(data.projects, usersById);

    handleProjectEvents(data.projects, usersById, () => {
        renderProjectsList(data.projects, usersById);
    }, storage);
}

function setupCoursesFilter(projects) {
    const coursesSelect = document.querySelector(".courses-select");
    if (!coursesSelect) return;

    const courses = [...new Set(projects.map((project) => project.course))];

    for (const course of courses) {
        const option = document.createElement("option");
        option.value = course;
        option.textContent = course;
        coursesSelect.append(option);
    }
}

function renderProjectsList(projects, usersById) {
    const projectListElements = document.querySelector("#projects-list");
    if (!projectListElements) return;

    projectListElements.onclick = (e) => {
        const bttnProject = e.target.closest('button[data-action="view-project"]');
        if (bttnProject) {
            const card = bttnProject.closest(".project-card");
            const projectId = card?.dataset.projectId;
            navigate(projectId);
        }

        const shareBttn = e.target.closest('button[data-action="share-project"]');
        console.log("presionaste", shareBttn)
        if (shareBttn) {
            const card = shareBttn.closest(".project-card");
            const projectId = card?.dataset.projectId;

            ProjectCard.shareProject(projectId);
        }
    };

    projectListElements.innerHTML = projects
        .map((project) => {
            const collaborators = (project.collaboratorIds ?? [])
                .map((userId) => usersById.get(userId))
                .filter(Boolean);
            return new ProjectCard({ ...project, collaborators }).init();
        })
        .join("");
}