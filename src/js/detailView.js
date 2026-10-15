import { 
    escapeHtml, 
    formatDate, 
    getStatusLabel, 
    calculateProgress, 
    avatarHtml, 
    ICON_EDIT, 
    ICON_DELETE
} from "./helpers.js";

let firstRender = true;

function actionButtons(editAction, deleteAction, label) {
    return `
        <div class="project-task__actions">
            <button type="button" class="project-task__btn project-task__btn--edit" data-action="${editAction}" aria-label="Edit ${label}" title="Edit ${label}">${ICON_EDIT}</button>
            <button type="button" class="project-task__btn project-task__btn--delete" data-action="${deleteAction}" aria-label="Delete ${label}" title="Delete ${label}">${ICON_DELETE}</button>
        </div>`;
}

function getUser(users, id) {
    return users.find((user) => user.id === id);
}

function tasksHtml(tasks, users, isMember) {
    let html = "";

    for (const task of tasks) {
        const assignee = getUser(users, task.assigneeId);
        html += `
            <li class="project-task" data-task-id="${escapeHtml(task.id)}">
                <input type="checkbox" class="project-task__checkbox" data-action="toggle-task-status"
                    aria-label="Mark ${escapeHtml(task.title)} as completed"
                    ${task.completed ? "checked" : ""} ${isMember ? "" : "disabled"}>
                <span class="project-task__title">${escapeHtml(task.title)}</span>
                <span class="project-task__assignee">${assignee ? escapeHtml(assignee.name) : "Unassigned"}</span>
                <time class="project-task__date" datetime="${escapeHtml(task.dueDate)}">${formatDate(task.dueDate)}</time>
                <span class="project-task__status">${task.completed ? "Completed" : "Pending"}</span>
                ${isMember ? actionButtons("edit-task", "delete-task", "task") : "<span></span>"}
            </li>`;
    }
    return html;
}

function milestonesHtml(project, users, isMember) {
    if (project.milestones.length === 0) {
        return '<p class="empty-state">No milestones yet. Add the first one to start planning.</p>';
    }

    let html = "";
    project.milestones.forEach((milestone, index) => {
        const owner = getUser(users, milestone.assigneeId);
        const availability = milestone.availability || {};
        const hours = availability.start && availability.end
            ? `<span>Hours: ${escapeHtml(availability.start)} - ${escapeHtml(availability.end)}</span>`
            : "";

        const taskList = milestone.tasks.length === 0
            ? '<p class="empty-state">No tasks in this milestone yet.</p>'
            : `<ul class="project-task-list">${tasksHtml(milestone.tasks, users, isMember)}</ul>`;

        html += `
            <article class="milestone-card${firstRender ? " is-entering" : ""}" data-milestone-id="${escapeHtml(milestone.id)}" style="--i: ${index}">
                <header class="milestone-card__header">
                    <div>
                        <h3>${escapeHtml(milestone.title)}</h3>
                        <p>${escapeHtml(milestone.description)}</p>
                    </div>
                    <div class="milestone-card__header-actions">
                        <span class="milestone-card__status">${getStatusLabel(milestone.status)}</span>
                        ${isMember ? actionButtons("edit-milestone", "delete-milestone", "milestone") : ""}
                        <button type="button" class="milestone-card__toggle" data-action="toggle-tasks" aria-label="Toggle tasks">
                            <span class="chevron-icon">▼</span>
                        </button>
                    </div>
                </header>
                <div class="milestone-card__meta">
                    <span>Owner: ${owner ? escapeHtml(owner.name) : "Unassigned"}</span>
                    <time datetime="${escapeHtml(milestone.dueDate)}">Due ${formatDate(milestone.dueDate)}</time>
                    ${hours}
                </div>
                ${isMember ? '<button type="button" class="milestone-card__add-task" data-action="add-task">+ Add task</button>' : ""}
                ${taskList}
            </article>`;
    });
    return html;
}

function resourcesHtml(project, isMember) {
    if (project.resources.length === 0) {
        return '<li class="empty-state">No resources shared yet.</li>';
    }

    let html = "";
    for (const resource of project.resources) {
        const actions = isMember ? actionButtons("edit-resource", "delete-resource", "resource") : "";
        const validLink = resource.url.startsWith("http://") || resource.url.startsWith("https://");

        const content = validLink
            ? `<a href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(resource.title)}</a>`
            : `${escapeHtml(resource.title)} <span>Invalid link</span>`;

        html += `<li class="resource-list__item" data-resource-id="${escapeHtml(resource.id)}">${content}${actions}</li>`;
    }
    return html;
}

function teamHtml(project, members) {
    if (members.length === 0) {
        return '<p class="empty-state">No collaborators yet.</p>';
    }

    let html = "";
    for (const member of members) {
        let hours = "Hours not set";
        const milestone = project.milestones.find((m) => m.assigneeId === member.id && m.availability && m.availability.start);
        if (milestone) {
            hours = milestone.availability.start + " - " + milestone.availability.end;
        }

        html += `
            <article class="project-team-member">
                <span class="project-team-member__initials" aria-hidden="true">${avatarHtml(member)}</span>
                <div class="project-team-member__details">
                    <span class="project-team-member__name">${escapeHtml(member.name)}</span>
                    <span class="project-team-member__availability">${escapeHtml(hours)}</span>
                </div>
            </article>`;
    }
    return html;
}

function contributionsHtml(project, members) {
    if (members.length === 0) {
        return '<p class="empty-state">Join the project to start contributing.</p>';
    }

    let html = "";
    for (const member of members) {
        let assigned = 0;
        let done = 0;
        for (const milestone of project.milestones) {
            for (const task of milestone.tasks) {
                if (task.assigneeId === member.id) {
                    assigned++;
                    if (task.completed) done++;
                }
            }
        }
        html += `
            <div class="contribution-item">
                <span class="contribution-item__member">${escapeHtml(member.name)}</span>
                <span class="contribution-item__count">${done} of ${assigned} tasks completed</span>
            </div>`;
    }
    return html;
}

function setText(selector, text) {
    const element = document.querySelector(selector);
    if (element) element.textContent = text;
}

function setHtml(selector, html) {
    const element = document.querySelector(selector);
    if (element) element.innerHTML = html;
}

function showButton(action, visible) {
    for (const button of document.querySelectorAll(`[data-action="${action}"]`)) {
        button.hidden = !visible;
    }
}

export function renderProject(project, users, userId, highlightId) {
    const isMember = project.collaboratorIds.includes(userId);
    const isOwner = project.createdBy === userId;
    const members = users.filter((user) => project.collaboratorIds.includes(user.id));
    const progress = calculateProgress(project);

    setText("#project-course", project.course);
    setText("#project-title", project.title);
    setText("#project-summary", project.summary);
    setText("#project-status", getStatusLabel(project.status));
    setText("#project-deadline", formatDate(project.deadline));
    setText("#project-progress-label", progress + "%");

    const progressBar = document.querySelector("#project-progress-bar");
    progressBar.value = progress;
    progressBar.textContent = progress + "%";

    setHtml("#milestone-list", milestonesHtml(project, users, isMember));
    setHtml("#resource-list", resourcesHtml(project, isMember));
    setHtml("#project-team-list", teamHtml(project, members));
    setHtml("#contribution-list", contributionsHtml(project, members));

    showButton("add-milestone", isMember);
    showButton("add-resource", isMember);
    showButton("edit-project", isOwner);
    showButton("delete-project", isOwner);
    showButton("join-project", !isMember);

    firstRender = false;

    if (highlightId) {
        const item = document.querySelector(
            `[data-milestone-id="${highlightId}"], [data-task-id="${highlightId}"], [data-resource-id="${highlightId}"]`
        );
        if (item) item.classList.add("is-new");
    }
}

export function toggleMilestone(eventElement) {
    const card = eventElement.closest(".milestone-card");
    if (!card) return;
    
    card.classList.toggle("is-collapsed");
    
    const tasksList = card.querySelector(".project-task-list");
    if (tasksList) {
        tasksList.classList.toggle("hide-tasks");
    }
}