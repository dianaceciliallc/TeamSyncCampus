import { dialogs } from "./handleDialogs.mjs"
import { DIALOG_TYPES } from "../utils/helpers.mjs";

export class DialogSetup {
	constructor(storageService = null) {
		this.storageService = storageService;
	}

	init() {
		document.addEventListener("click", async (e) => {
			const actionBtn = e.target.closest("[data-action]");
			if (!actionBtn) return;

			const action = actionBtn.dataset.action;

			switch (action) {
				case "open-create-project":
					await this.handleCreateProject();
					break;

				case "open-create-task": {
					const milestoneId = actionBtn.dataset.milestoneId;
					await this.handleCreateTask(milestoneId);
					break;
				}

				case "open-edit-task": {
					const taskId = actionBtn.dataset.taskId;
					await this.handleEditTask(taskId);
					break;
				}

				case "open-delete-confirm": {
					const itemTitle = actionBtn.dataset.title;
					await this.handleDeleteConfirm(itemTitle, actionBtn);
					break;
				}

				default:
					break;
			}
		});
	}

	async handleCreateProject() {
		const formData = await dialogs.open(DIALOG_TYPES.CREATE_PROJECT);

		if (!formData) return;

		if (this.storageService) {
            this.storageService.addProject(formData);
            window.location.reload(); // Recarga para reflejar el nuevo proyecto en el dashboard
        }

		console.log("[DialogSetup] New project data received:", formData);

		// Example: If you have your storage service ready:
		// if (this.storageService) {
		//     this.storageService.addProject(formData);
		//     window.location.reload(); // or re-render view
		// }
	}

	async handleCreateTask(milestoneId) {
		const formData = await dialogs.open(DIALOG_TYPES.CREATE_TASK, { milestoneId });

		if (!formData) return;

		console.log("[DialogSetup] New task data received:", { milestoneId, formData });
	}

	async handleEditTask(taskId) {
		const formData = await dialogs.open(DIALOG_TYPES.EDIT_TASK, { task: { id: taskId } });

		if (!formData) return;

		console.log("[DialogSetup] Updated task data received:", formData);
	}

	async handleDeleteConfirm(itemTitle, button) {
		const formData = await dialogs.open(DIALOG_TYPES.DELETE_CONFIRM, { title: itemTitle });

		if (!formData) return;

		console.log("[DialogSetup] Deletion confirmed for:", itemTitle);
	}
}