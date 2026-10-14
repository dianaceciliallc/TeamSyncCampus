import { loadComponent } from "./utils/helpers.mjs";
import ProjectDetailView from "./components/ProjectDetailView.js";
import { handleProjectEvents } from "./events/events.js"
import { DialogSetup } from "./dialogs/dialogSetUp.mjs"
import { StorageService } from "./services/storage.mjs";

async function initProjectDetail() {
    await Promise.all([
        loadComponent("../ui-components/header.html", "#site-header"),
        loadComponent("../ui-components/footer.html", "#site-footer")
    ]);

    // 1. Cargamos el JSON inicial como respaldo para el Storage
    const response = await fetch(new URL("../assets/data.json", import.meta.url));
    const initialJson = await response.json();

    // 2. Inicializamos el servicio de almacenamiento local
    const storage = new StorageService(initialJson);
    const data = storage.getData();

    const usersById = new Map((data.users ?? []).map((user) => [user.id, user]));

    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");

    const project = data.projects.find((p) => p.id === projectId) ?? data.projects[0];

    if (project) {
        const collaborators = (project.collaboratorIds ?? [])
            .map((userId) => usersById.get(userId))
            .filter(Boolean);

        const projectWithCollaborators = { ...project, collaborators };

        const view = new ProjectDetailView(projectWithCollaborators, usersById, storage);
        view.render();
    }

    handleProjectEvents();
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch(new URL("../assets/data.json", import.meta.url));
        const initialJson = await response.json();
        const storage = new StorageService(initialJson);

        const dialogSetup = new DialogSetup(storage);
        dialogSetup.init();


        initProjectDetail();
    } catch (error) {
        console.error("Error al inicializar la aplicación:", error);
    }
});