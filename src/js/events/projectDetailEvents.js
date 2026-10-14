/* import ProjectDetailView from "./ProjectDetailView.js";
import { loadComponent } from "./utils.mjs";

export function initializeProjectNavigation(projects, usersById, showDashboard) {
    document.addEventListener("click", async (event) => {
        const actionButton = event.target.closest("[data-action]");

        if (!actionButton) {
            return;
        }

        if (actionButton.dataset.action === "view-project") {
            const projectId = actionButton.closest("[data-project-id]")?.dataset.projectId;
            const project = projects.find((item) => item.id === projectId);

            if (!project) {
                return;
            }

            const collaborators = (project.collaboratorIds ?? [])
                .map((userId) => usersById.get(userId))
                .filter(Boolean);

            await loadComponent("./ui-components/project-view.html", "#main-content");
            ProjectDetailView({ ...project, collaborators }, usersById).render();
        }

        if (actionButton.dataset.action === "back-to-dashboard") {
            await loadComponent("./ui-components/dashboard.html", "#main-content");
            showDashboard();
        }
    });
} */

export function handleProjectDetailClick(event) {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const action = actionButton.dataset.action;

    if (action === "toggle-tasks") {
        console.log("presionaste el toggle")
        const milestoneCard = actionButton.closest(".milestone-card");

        if (milestoneCard) {
            const taskList = milestoneCard.querySelector(".project-task-list");

            if (taskList) {
                taskList.hidden = !taskList.hidden;
                actionButton.classList.toggle("is-collapsed", taskList.hidden);
            }
        }
    }

    if (action === "toggle-task-status") {
        const taskItem = actionButton.closest(".project-task");
        const statusLabel = taskItem?.querySelector(".project-task__status");
        const isChecked = actionButton.checked;

        if (statusLabel) {
            statusLabel.textContent = isChecked ? "Completed" : "Pending";
        }
    }

    if (action === "add-milestone") {
        console.log("Abrir modal/formulario para nuevo milestone");
    }
}