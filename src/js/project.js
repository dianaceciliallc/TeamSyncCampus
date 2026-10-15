import { getProjects, getUsers, updateProject, getProject, createProject, deleteProject } from "./api.js";
import { checkLogin } from "./auth.js";
import { appUrl, loadComponent, goTo, showAlert, formatDate, getStatusLabel, downloadFile } from "./helpers.js";
import { showUserInHeader, fillCourseFilter, closeMenuOnOutsideClick, headerActions } from "./header.js";
import { renderProject, toggleMilestone } from "./detailView.js";
import { shareProject } from "./cards.js";
import { askProject, askMilestone, askTask, askResource, askConfirm } from "./dialogs.js";
import { bindActions } from "./events.js";
import * as work from "./projects.js";

let users = [];
let user = null;
let project = null;
let searchTimer;

const projectId = new URLSearchParams(window.location.search).get("id");

document.addEventListener("DOMContentLoaded", startProjectPage);

async function startProjectPage() {
    try {
        users = await getUsers();
        user = checkLogin(users);
        if (!user) return;

        await loadComponent(appUrl("ui-components/header.html"), "#site-header");
        await loadComponent(appUrl("ui-components/footer.html"), "#site-footer");
        showUserInHeader(user);
        closeMenuOnOutsideClick();

        const projects = await getProjects();
        const myProjects = projects.filter((p) => p.collaboratorIds.includes(user.id));
        fillCourseFilter(myProjects, "all");
        project = projects.find((p) => p.id === projectId);

        const actions = {
            ...headerActions,
            "open-create-project": createNewProject,
            "search-projects": (input) => {
                clearTimeout(searchTimer);
                searchTimer = setTimeout(() => goTo("dashboard", { q: input.value.trim() }), 600);
            },
            "filter-course": (select) => {
                goTo("dashboard", { course: select.value === "all" ? "" : select.value });
            },
            "back-to-dashboard": () => goTo("dashboard")
        };

        if (!project) {
            showNotFound();
            bindActions(actions);
            return;
        }

        renderProject(project, users, user.id);

        bindActions({
            ...actions,
            "share-project": () => shareProject(projectId),
            "join-project": joinThisProject,
            "edit-project": editThisProject,
            "delete-project": deleteThisProject,
            "add-milestone": addNewMilestone,
            "edit-milestone": editThisMilestone,
            "delete-milestone": deleteThisMilestone,
            "toggle-tasks": (button) => toggleMilestone(button.closest("[data-milestone-id]")),
            "add-task": addNewTask,
            "edit-task": editThisTask,
            "delete-task": deleteThisTask,
            "toggle-task-status": toggleThisTask,
            "add-resource": addNewResource,
            "edit-resource": editThisResource,
            "delete-resource": deleteThisResource,
            "export-report": exportReport
        });
    } catch (error) {
        console.error(error);
        document.querySelector("#project-view").innerHTML =
            '<p class="empty-state">Could not connect to the server. Check the API_URL in js/api.js.</p>';
    }
}

function showNotFound() {
    document.querySelector("#project-view").innerHTML = `
        <nav class="project-view__navigation" aria-label="Project navigation">
            <button class="project-view__back" type="button" data-action="back-to-dashboard">Back to projects</button>
        </nav>
        <p class="empty-state">This project does not exist or was deleted.</p>`;
}

async function saveAndShow(highlightId) {
    work.refreshProject(project);
    try {
        await updateProject(project);
    } catch (error) {
        project = await getProject(projectId);
        renderProject(project, users, user.id);
        throw error;
    }
    renderProject(project, users, user.id, highlightId);
}

function checkMember() {
    if (project.collaboratorIds.includes(user.id)) return true;
    showAlert("Join the project to make changes", "error");
    return false;
}

function checkOwner() {
    if (project.createdBy === user.id) return true;
    showAlert("Only the project owner can do that", "error");
    return false;
}

function getIds(element) {
    const milestone = element.closest("[data-milestone-id]");
    const task = element.closest("[data-task-id]");
    const resource = element.closest("[data-resource-id]");
    return {
        milestoneId: milestone ? milestone.dataset.milestoneId : null,
        taskId: task ? task.dataset.taskId : null,
        resourceId: resource ? resource.dataset.resourceId : null
    };
}

async function createNewProject() {
    const fields = await askProject();
    if (!fields) return;

    const saved = await createProject(work.newProject(fields, user.id));
    goTo("project", { id: saved.id });
}

async function joinThisProject() {
    const ok = await askConfirm("Join Project", `Would you like to join <strong>${project.title}</strong> as a collaborator?`, "Join Project");
    if (!ok) return;

    work.joinProject(project, user.id);
    await saveAndShow();
    showAlert("You joined the project");
}

async function editThisProject() {
    if (!checkOwner()) return;

    const fields = await askProject(project);
    if (!fields) return;

    work.editProject(project, fields);
    await saveAndShow();
    showAlert("Project updated");
}

async function deleteThisProject() {
    if (!checkOwner()) return;

    const ok = await askConfirm("Confirm Deletion", `Are you sure you want to delete <strong>${project.title}</strong>? This cannot be undone.`, "Delete", true);
    if (!ok) return;

    await deleteProject(project.id);
    goTo("dashboard");
}

async function addNewMilestone() {
    if (!checkMember()) return;

    const fields = await askMilestone(members());
    if (!fields) return;

    const milestone = work.addMilestone(project, fields);
    await saveAndShow(milestone.id);
    showAlert("Milestone added");
}

async function editThisMilestone(button) {
    if (!checkMember()) return;

    const { milestoneId } = getIds(button);
    const fields = await askMilestone(members(), work.findMilestone(project, milestoneId));
    if (!fields) return;

    work.editMilestone(project, milestoneId, fields);
    await saveAndShow(milestoneId);
    showAlert("Milestone updated");
}

async function deleteThisMilestone(button) {
    if (!checkMember()) return;

    const { milestoneId } = getIds(button);
    const milestone = work.findMilestone(project, milestoneId);
    const ok = await askConfirm("Confirm Deletion", `Delete <strong>${milestone.title}</strong>?`, "Delete", true);
    if (!ok) return;

    work.deleteMilestone(project, milestoneId);
    await saveAndShow();
    showAlert("Milestone deleted");
}

async function addNewTask(button) {
    if (!checkMember()) return;

    const { milestoneId } = getIds(button);
    const fields = await askTask(members());
    if (!fields) return;

    const task = work.addTask(project, milestoneId, fields);
    await saveAndShow(task.id);
    showAlert("Task added");
}

async function editThisTask(button) {
    if (!checkMember()) return;

    const { milestoneId, taskId } = getIds(button);
    const fields = await askTask(members(), work.findTask(project, milestoneId, taskId));
    if (!fields) return;

    work.editTask(project, milestoneId, taskId, fields);
    await saveAndShow(taskId);
    showAlert("Task updated");
}

async function deleteThisTask(button) {
    if (!checkMember()) return;

    const { milestoneId, taskId } = getIds(button);
    const task = work.findTask(project, milestoneId, taskId);
    const ok = await askConfirm("Confirm Deletion", `Delete <strong>${task.title}</strong>?`, "Delete", true);
    if (!ok) return;

    work.deleteTask(project, milestoneId, taskId);
    await saveAndShow();
    showAlert("Task deleted");
}

async function toggleThisTask(checkbox) {
    if (!checkMember()) {
        checkbox.checked = !checkbox.checked;
        return;
    }

    const { milestoneId, taskId } = getIds(checkbox);
    work.toggleTask(project, milestoneId, taskId);
    await saveAndShow();
}


async function addNewResource() {
    if (!checkMember()) return;

    const fields = await askResource();
    if (!fields) return;

    const resource = work.addResource(project, fields);
    await saveAndShow(resource.id);
    showAlert("Resource added");
}

async function editThisResource(button) {
    if (!checkMember()) return;

    const { resourceId } = getIds(button);
    const fields = await askResource(work.findResource(project, resourceId));
    if (!fields) return;

    work.editResource(project, resourceId, fields);
    await saveAndShow(resourceId);
    showAlert("Resource updated");
}

async function deleteThisResource(button) {
    if (!checkMember()) return;

    const { resourceId } = getIds(button);
    const resource = work.findResource(project, resourceId);
    const ok = await askConfirm("Confirm Deletion", `Delete <strong>${resource.title}</strong>?`, "Delete", true);
    if (!ok) return;

    work.deleteResource(project, resourceId);
    await saveAndShow();
    showAlert("Resource deleted");
}


function members() {
    return users.filter((u) => project.collaboratorIds.includes(u.id));
}

function csvCell(value) {
    return '"' + String(value).replace(/"/g, '""') + '"';
}

function exportReport() {
    const rows = [["Project", "Milestone", "Task", "Assignee", "Due date", "Status"]];

    for (const milestone of project.milestones) {
        for (const task of milestone.tasks) {
            const assignee = users.find((u) => u.id === task.assigneeId);
            rows.push([
                project.title,
                milestone.title,
                task.title,
                assignee ? assignee.name : "Unassigned",
                formatDate(task.dueDate),
                task.completed ? "Completed" : "Pending"
            ]);
        }
    }

    rows.push([]);
    rows.push(["Project status", getStatusLabel(project.status)]);
    rows.push(["Overall progress", project.progress + "%"]);
    rows.push(["Deadline", formatDate(project.deadline)]);

    let csv = "";
    for (const row of rows) {
        csv += row.map(csvCell).join(",") + "\n";
    }

    downloadFile("project-report.csv", csv, "text/csv;charset=utf-8");
    showAlert("Report downloaded");
}