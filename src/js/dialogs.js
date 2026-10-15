import { escapeHtml, STATUS_LABELS } from "./helpers.js";

function openDialog(title, fields, submitText, isDanger) {
    return new Promise((resolve) => {
        const dialog = document.querySelector("#dialog-root");
        dialog.className = "app-dialog";
        dialog.innerHTML = `
            <form method="dialog" class="app-dialog__form">
                <header class="app-dialog__header">
                    <h2>${title}</h2>
                    <button type="button" class="app-dialog__close" data-action="cancel">&times;</button>
                </header>
                <div class="app-dialog__body">${fields}</div>
                <footer class="app-dialog__actions">
                    <button type="button" class="app-dialog__cancel" data-action="cancel">Cancel</button>
                    <button type="submit" class="app-dialog__submit ${isDanger ? "app-dialog__submit--danger" : ""}">${submitText}</button>
                </footer>
            </form>
        `;

        const form = dialog.querySelector("form");

        function finish(result) {
            dialog.close();
            dialog.innerHTML = "";
            resolve(result);
        }

        for (const button of dialog.querySelectorAll('[data-action="cancel"]')) {
            button.onclick = () => finish(null);
        }
        dialog.oncancel = (event) => {
            event.preventDefault();
            finish(null);
        };
        form.onsubmit = (event) => {
            event.preventDefault();
            finish(Object.fromEntries(new FormData(form)));
        };

        dialog.showModal();
    });
}

function userOptions(users, selectedId) {
    let html = '<option value="">Unassigned</option>';
    for (const user of users) {
        const selected = user.id === selectedId ? "selected" : "";
        html += `<option value="${escapeHtml(user.id)}" ${selected}>${escapeHtml(user.name)}</option>`;
    }
    return html;
}

function statusOptions(selected) {
    let html = "";
    for (const value in STATUS_LABELS) {
        html += `<option value="${value}" ${value === selected ? "selected" : ""}>${STATUS_LABELS[value]}</option>`;
    }
    return html;
}

function textField(id, name, label, value, type = "text", required = true) {
    return `
        <div class="app-dialog__field">
            <label for="dlg-${id}">${label}</label>
            <input type="${type}" id="dlg-${id}" name="${name}" ${required ? "required" : ""} value="${escapeHtml(value)}">
        </div>`;
}


export function askProject(project = {}) {
    const isNew = !project.title;
    const fields = `
        ${textField("course", "course", "Course / Subject", project.course)}
        ${textField("title", "title", "Project Title", project.title)}
        <div class="app-dialog__field">
            <label for="dlg-summary">Summary / Description</label>
            <textarea id="dlg-summary" name="summary" rows="3">${escapeHtml(project.summary)}</textarea>
        </div>
        ${textField("deadline", "deadline", "Project Deadline", project.deadline, "date")}
        <div class="app-dialog__field">
            <label for="dlg-status">Status</label>
            <select id="dlg-status" name="status">${statusOptions(project.status)}</select>
        </div>`;

    return openDialog(isNew ? "Create New Project" : "Edit Project", fields, isNew ? "Create Project" : "Save changes");
}

export function askMilestone(users, milestone = {}) {
    const availability = milestone.availability || {};
    const fields = `
        ${textField("title", "title", "Milestone Title", milestone.title)}
        <div class="app-dialog__field">
            <label for="dlg-description">Description</label>
            <textarea id="dlg-description" name="description" rows="2">${escapeHtml(milestone.description)}</textarea>
        </div>
        <div class="app-dialog__field">
            <label for="dlg-assignee">Owner</label>
            <select id="dlg-assignee" name="assigneeId">${userOptions(users, milestone.assigneeId)}</select>
        </div>
        ${textField("due", "dueDate", "Due Date", milestone.dueDate, "date")}
        ${textField("start", "availabilityStart", "Preferred working hours (start)", availability.start, "time", false)}
        ${textField("end", "availabilityEnd", "Preferred working hours (end)", availability.end, "time", false)}`;

    return openDialog(milestone.title ? "Edit Milestone" : "Add Milestone", fields, "Save");
}

export function askTask(users, task = {}) {
    const fields = `
        ${textField("title", "title", "Task Title", task.title)}
        <div class="app-dialog__field">
            <label for="dlg-assignee">Assignee</label>
            <select id="dlg-assignee" name="assigneeId">${userOptions(users, task.assigneeId)}</select>
        </div>
        ${textField("due", "dueDate", "Due Date", task.dueDate, "date")}`;

    return openDialog(task.title ? "Edit Task" : "Create New Task", fields, "Save");
}

export function askResource(resource = {}) {
    const fields = `
        ${textField("title", "title", "Resource Title", resource.title)}
        ${textField("url", "url", "Link (URL)", resource.url, "url")}`;

    return openDialog(resource.title ? "Edit Resource" : "Add Resource", fields, "Save");
}

export function askConfirm(title, message, buttonText, isDanger = false) {
    return openDialog(title, `<p>${message}</p>`, buttonText, isDanger);
}
