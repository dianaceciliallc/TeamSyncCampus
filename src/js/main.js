import { getProjects, getUsers, createProject } from "./api.js";
import { checkLogin } from "./auth.js";
import { appUrl, loadComponent, goTo, showAlert } from "./helpers.js";
import { showUserInHeader, fillCourseFilter, setSearchValue, closeMenuOnOutsideClick, headerActions } from "./header.js";
import { createProjectCard, shareProject } from "./cards.js";
import { askProject } from "./dialogs.js";
import { newProject } from "./projects.js";
import { bindActions } from "./events.js";

let users = [];
let projects = [];
let user = null;

let query = "";
let course = "all";

document.addEventListener("DOMContentLoaded", startDashboard);

async function startDashboard() {
    try {
        users = await getUsers();
        user = checkLogin(users);
        if (!user) return;

        await loadComponent(appUrl("ui-components/header.html"), "#site-header");
        await loadComponent(appUrl("ui-components/footer.html"), "#site-footer");
        await loadComponent(appUrl("ui-components/dashboard.html"), "#main-content");

        showUserInHeader(user);
        closeMenuOnOutsideClick();

        const allProjects = await getProjects();
        projects = allProjects.filter((p) => p.collaboratorIds.includes(user.id));

        const params = new URLSearchParams(window.location.search);
        query = params.get("q") || "";
        course = params.get("course") || "all";

        setSearchValue(query);
        fillCourseFilter(projects, course);
        course = document.querySelector('[data-action="filter-course"]').value;
        renderDashboard(true);

        bindActions({
            ...headerActions,
            "open-create-project": createNewProject,
            "view-project": (button) => goTo("project", { id: getProjectId(button) }),
            "share-project": (button) => shareProject(getProjectId(button)),
            "search-projects": (input) => {
                query = input.value;
                renderDashboard(false);
            },
            "filter-course": (select) => {
                course = select.value;
                renderDashboard(false);
            }
        });
    } catch (error) {
        console.error(error);
        document.querySelector("#main-content").innerHTML =
            '<p class="empty-state">Could not connect to the server. Check the API_URL in js/api.js.</p>';
    }
}

function getProjectId(button) {
    return button.closest("[data-project-id]").dataset.projectId;
}

async function createNewProject() {
    const fields = await askProject();
    if (!fields) return;

    const saved = await createProject(newProject(fields, user.id));
    projects.push(saved);
    showAlert("Project created");

    query = "";
    course = "all";
    setSearchValue("");
    fillCourseFilter(projects, course);
    renderDashboard(false);
}

function matchesSearch(project) {
    const text = query.trim().toLowerCase();
    if (text === "") return true;

    const words = [project.title, project.summary, project.course];

    for (const id of project.collaboratorIds) {
        const person = users.find((u) => u.id === id);
        if (person) words.push(person.name);
    }
    for (const milestone of project.milestones) {
        words.push(milestone.title);
        for (const task of milestone.tasks) {
            words.push(task.title);
        }
    }
    for (const resource of project.resources) {
        words.push(resource.title);
    }

    return words.join(" ").toLowerCase().includes(text);
}

function renderDashboard(animate) {
    const container = document.querySelector("#projects-list");
    const emptyMessage = document.querySelector("#projects-empty");

    let html = "";
    let shown = 0;

    for (const project of projects) {
        if (course !== "all" && project.course !== course) continue;
        if (!matchesSearch(project)) continue;

        const collaborators = project.collaboratorIds
            .map((id) => users.find((u) => u.id === id))
            .filter((person) => person);

        html += createProjectCard(project, collaborators, animate);
        shown++;
    }

    container.innerHTML = html;
    emptyMessage.hidden = shown > 0;

    if (projects.length === 0) {
        emptyMessage.textContent = 'No projects yet. Create one, or open a link a teammate shared with you and join the project.';
    } else {
        emptyMessage.textContent = "No projects match your search or selected course.";
    }
}