import { htmlCharacters, formatDate, safeResourceUrl, calculateProjectProgress } from "../utils/helpers.mjs";

export default class ProjectDetailView {
    constructor(project, usersById = new Map(), storageService = null) {
        this.project = project;
        this.usersById = usersById;
        this.storageService = storageService;
    }

    renderTasks(tasks = []) {
        return tasks.map((task) => {
            const assignee = this.usersById.get(task.assigneeId);
            return `
            <li class="project-task" data-task-id="${htmlCharacters(task.id)}">
                <input 
                    type="checkbox" 
                    class="project-task__checkbox" 
                    data-action="toggle-task-status" 
                    ${task.completed ? "checked" : ""} 
                />
                <span class="project-task__title">${htmlCharacters(task.title)}</span>
                <span class="project-task__assignee">${htmlCharacters(assignee?.name ?? "Unassigned")}</span>
                <time class="project-task__date" datetime="${htmlCharacters(task.dueDate)}">
                    ${htmlCharacters(formatDate(task.dueDate))}
                </time>

                <span class="project-task__status">${task.completed ? "Completed" : "Pending"}</span>

                <div class="project-task__actions">
                    <button type="button" class="project-task__btn project-task__btn--edit" data-action="edit-task" aria-label="Edit task" title="Edit task">
                        <svg class="icon-pencil" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button type="button" class="project-task__btn project-task__btn--delete" data-action="delete-task" aria-label="Delete task" title="Delete task">
                        <svg class="icon-close" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </li>
        `;
        }).join("");
    }

    renderMilestones() {
        const milestones = this.project.milestones ?? [];

        return milestones.map((milestone) => {
            const tasksHtml = this.renderTasks(milestone.tasks);
            const assignee = this.usersById.get(milestone.assigneeId);

            return `
            <article class="milestone-card" data-milestone-id="${htmlCharacters(milestone.id)}">
                <header class="milestone-card__header">
                    <div>
                        <h3>${htmlCharacters(milestone.title)}</h3>
                        <p>${htmlCharacters(milestone.description)}</p>
                    </div>

                    <div class="milestone-card__header-actions">
                        <span class="milestone-card__status">${htmlCharacters(milestone.status)}</span>
                        <button type="button" class="milestone-card__toggle" data-action="toggle-tasks" aria-label="Toggle tasks">
                            <span class="chevron-icon">▼</span>
                        </button>
                    </div>
                </header>
                <div class="milestone-card__meta">
                    <span>Owner: ${htmlCharacters(assignee?.name ?? "Unassigned")}</span>
                    <time datetime="${htmlCharacters(milestone.dueDate)}">
                        Due ${htmlCharacters(formatDate(milestone.dueDate))}
                    </time>
                </div>
                <ul class="project-task-list">${tasksHtml}</ul>
            </article>
        `;
        }).join("");
    }

    renderResources() {
        const resources = this.project.resources ?? [];

        return resources.map((resource) => {
            const url = safeResourceUrl(resource.url);

            if (!url) {
                return `<li class="resource-list__item">${htmlCharacters(resource.title)} <span>Invalid link</span></li>`;
            }

            return `
                <li class="resource-list__item">
                    <a href="${htmlCharacters(url)}" target="_blank" rel="noopener noreferrer">
                        ${htmlCharacters(resource.title)}
                    </a>
                </li>
            `;
        }).join("");
    }

    renderCollabs() {
        const collaborators = this.project.collaborators ?? [];

        if (collaborators.length === 0) return "";

        return collaborators.map((member) => `
        <article class="project-team-member">
            <span class="project-team-member__initials" aria-hidden="true">${htmlCharacters(member.initials)}</span>
            <span class="project-team-member__name">${htmlCharacters(member.name)}</span>
        </article>
    `).join("");
    }

    render() {
        if (!this.project) return;

        const projectView = document.querySelector("#project-view");
        if (projectView) projectView.dataset.projectId = this.project.id;

        const course = document.querySelector("#project-course");
        if (course) course.textContent = this.project.course ?? "";

        const title = document.querySelector("#project-title");
        if (title) title.textContent = this.project.title ?? "Untitled project";

        const summary = document.querySelector("#project-summary");
        if (summary) summary.textContent = this.project.summary ?? "";

        const status = document.querySelector("#project-status");
        if (status) status.textContent = this.project.status ?? "Not started";

        const deadline = document.querySelector("#project-deadline");
        if (deadline) deadline.textContent = formatDate(this.project.deadline);

        const progressValue = calculateProjectProgress(this.project);
        const progressBar = document.querySelector("#project-progress-bar");
        if (progressBar) {
            progressBar.value = progressValue;
            progressBar.textContent = `${progressValue}%`;
        }

        const progressLabel = document.querySelector("#project-progress-label");
        if (progressLabel) progressLabel.textContent = `${progressValue}%`;

        const milestoneList = document.querySelector("#milestone-list");
        if (milestoneList) milestoneList.innerHTML = this.renderMilestones();

        const resourceList = document.querySelector("#resource-list");
        if (resourceList) resourceList.innerHTML = this.renderResources();

        const teamList = document.querySelector("#project-team-list");
        if (teamList) teamList.innerHTML = this.renderCollabs();
    }

}