import { htmlCharacters, DIALOG_TYPES } from "../utils/helpers.mjs";

export const dialogTemplates = {
    [DIALOG_TYPES.CREATE_PROJECT]: (data = {}) => ({
        title: "Create New Project",
        submitText: "Create Project",
        fields: `
            <div class="app-dialog__field">
                <label for="project-course">Course / Subject</label>
                <input type="text" id="project-course" name="course" required placeholder="e.g. Web Architecture" />
            </div>
            <div class="app-dialog__field">
                <label for="project-title">Project Title</label>
                <input type="text" id="project-title" name="title" required placeholder="e.g. Final Project Portal" />
            </div>
            <div class="app-dialog__field">
                <label for="project-summary">Summary / Description</label>
                <textarea id="project-summary" name="summary" rows="3" placeholder="Brief project description..."></textarea>
            </div>
            <div class="app-dialog__field">
                <label for="project-deadline">Project Deadline</label>
                <input type="date" id="project-deadline" name="deadline" required />
            </div>
            <div class="app-dialog__field">
                <label for="project-status">Initial Status</label>
                <select id="project-status" name="status">
                    <option value="Not started">Not started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                </select>
            </div>
        `
    }),

    [DIALOG_TYPES.CREATE_TASK]: (data = {}) => ({
        title: "Create New Task",
        submitText: "Save Task",
        fields: `
            <div class="app-dialog__field">
                <label for="task-title">Task Title</label>
                <input type="text" id="task-title" name="title" required placeholder="e.g. Research references" />
            </div>
            <div class="app-dialog__field">
                <label for="task-assignee">Assignee</label>
                <select id="task-assignee" name="assigneeId">
                    <option value="">Unassigned</option>
                    ${(data.users || []).map(user => `
                        <option value="${htmlCharacters(user.id)}">${htmlCharacters(user.name)}</option>
                    `).join("")}
                </select>
            </div>
            <div class="app-dialog__field">
                <label for="task-due-date">Due Date</label>
                <input type="date" id="task-due-date" name="dueDate" required />
            </div>
        `
    }),

    [DIALOG_TYPES.EDIT_TASK]: (data = {}) => ({
        title: "Edit Task",
        submitText: "Update",
        fields: `
            <input type="hidden" name="id" value="${htmlCharacters(data.task?.id ?? "")}" />
            <div class="app-dialog__field">
                <label for="task-title">Task Title</label>
                <input type="text" id="task-title" name="title" value="${htmlCharacters(data.task?.title ?? "")}" required />
            </div>
            <div class="app-dialog__field">
                <label for="task-assignee">Assignee</label>
                <select id="task-assignee" name="assigneeId">
                    <option value="">Unassigned</option>
                    ${(data.users || []).map(user => `
                        <option value="${htmlCharacters(user.id)}" ${data.task?.assigneeId === user.id ? "selected" : ""}>
                            ${htmlCharacters(user.name)}
                        </option>
                    `).join("")}
                </select>
            </div>
            <div class="app-dialog__field">
                <label for="task-due-date">Due Date</label>
                <input type="date" id="task-due-date" name="dueDate" value="${htmlCharacters(data.task?.dueDate ?? "")}" required />
            </div>
        `
    }),

    [DIALOG_TYPES.DELETE_CONFIRM]: (data = {}) => ({
        title: "Confirm Deletion",
        submitText: "Delete",
        isDanger: true,
        fields: `
            <p>Are you sure you want to delete <strong>${htmlCharacters(data.title ?? "this item")}</strong>? This action cannot be undone.</p>
        `
    }),
    
    [DIALOG_TYPES.JOIN_PROJECT_CONFIRM]: (data = {}) => ({
        title: "Join Project",
        submitText: "Join Project",
        fields: `
            <input type="hidden" name="projectId" value="${htmlCharacters(data.projectId ?? "")}" />
            <p>Would you like to join the project <strong>${htmlCharacters(data.projectTitle ?? "this project")}</strong> as a collaborator?</p>
        `
    }),
};