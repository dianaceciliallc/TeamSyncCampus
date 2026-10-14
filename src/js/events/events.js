import ProjectDetailView from "../components/ProjectDetailView.js";
import { loadComponent } from "../utils/helpers.mjs";
import { handleProjectDetailClick } from "./projectDetailEvents.js";

export function handleProjectEvents(projects, usersById, showDashboard, storageService) {
    document.addEventListener("click", async (event) => {
        const actionButton = event.target.closest("[data-action]");

        if (!actionButton) return;

        const action = actionButton.dataset.action;

        if (action === "view-project") {
            const projectId = actionButton.closest("[data-project-id]")?.dataset.projectId;
            
            // Obtenemos los datos más frescos del storage si está disponible, o del array
            const currentProjects = storageService ? storageService.getData().projects : projects;
            const project = currentProjects.find((item) => item.id === projectId);

            if (!project) return;

            const collaborators = (project.collaboratorIds ?? [])
                .map((userId) => usersById.get(userId))
                .filter(Boolean);

            await loadComponent("./project/project-view.html", "#project-main");
            
            const detailView = new ProjectDetailView({ ...project, collaborators }, usersById, storageService);
            detailView.render();
            return;
        }

        if (action === "back-to-dashboard") {
            window.location.href = "../index.html";
            return;
        }

        // Si estamos dentro del detalle del proyecto, manejamos las acciones de las tareas
        const projectView = event.target.closest("#project-view");
        if (projectView) {
            const checkbox = event.target.closest('input[data-action="toggle-task-status"]');
            if (checkbox && storageService) {
                const taskItem = checkbox.closest(".project-task");
                const taskId = taskItem?.dataset.taskId;
                const milestoneCard = checkbox.closest(".milestone-card");
                const milestoneId = milestoneCard?.dataset.milestoneId;
                const projectId = projectView.dataset.projectId;

                if (projectId && milestoneId && taskId) {
                    // 1. Actualizamos el estado en el Storage (esto también recalcula el progreso)
                    const updatedProject = storageService.toggleTaskStatus(projectId, milestoneId, taskId);

                    if (updatedProject) {
                        const collaborators = (updatedProject.collaboratorIds ?? [])
                            .map((userId) => usersById.get(userId))
                            .filter(Boolean);

                        // 2. Re-renderizamos la vista de detalles al instante con los datos nuevos
                        const detailView = new ProjectDetailView({ ...updatedProject, collaborators }, usersById, storageService);
                        detailView.render();
                    }
                }
            } else {
                // Para cualquier otro clic dentro del detalle (como expandir hitos)
                handleProjectDetailClick(event);
            }
        }
    });
}