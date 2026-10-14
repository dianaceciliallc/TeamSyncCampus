import { htmlCharacters } from "../utils/helpers.mjs";

export class ProjectCard {
    static STATUS_OPTIONS = {
        "in-progress": { label: "In progress", className: "project-badge--progress" },
        "not-started": { label: "Not started", className: "project-badge--pending" },
        completed: { label: "Completed", className: "project-badge--completed" },
    }

    constructor(project) {
        this.project = project;
        this.status = this.getStatus();
        this.deadline = this.getDeadLineInfo();
    }

    init() {
        return `
            <article class="project-card" data-project-id="${htmlCharacters(this.project.id)}">
                <div class="project-card__header">
                    <p class="project-card__course">${htmlCharacters(this.project.course)}</p>
                    <div class="project-card__badges" aria-label="Project status and urgency">
                        <span class="project-badge ${this.status.className}">${htmlCharacters(this.status.label)}</span>
                        <span class="project-badge ${this.deadline.urgencyClass}">${htmlCharacters(this.deadline.urgencyLabel)}</span>
                    </div>
                </div>

                <div class="project-card__deadline">
                    <span class="project-card__deadline-label">
                        <span class="project-card__calendar-icon" aria-hidden="true"></span>
                        Due date
                    </span>
                    <strong class="project-card__deadline-date">${htmlCharacters(this.deadline.dateLabel)}</strong>
                    <span class="project-card__deadline-relative">${htmlCharacters(this.deadline.relativeLabel)}</span>
                </div>

                <div class="project-card__content">
                    <h2 class="project-card__title">${htmlCharacters(this.project.title)}</h2>
                    <p class="project-card__summary">${htmlCharacters(this.project.summary)}</p>
                </div>

                <div class="project-card__footer">
                    <button class="project-card__details" type="button" data-action="view-project">
                        <span class="project-card__info-icon" aria-hidden="true">i</span>
                        View details
                    </button>

                    <div class="project-card__footer-actions">
                        <div class="project-card__team" role="group" aria-label="Project collaborators">
                            ${this.renderCollabs()}
                        </div>
                        <button class="project-card__share" type="button" data-action="share-project">
                            Share
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    getStatus() {
        return ProjectCard.STATUS_OPTIONS[this.project.status] ?? {
            label: this.project.status ?? "Not started",
            className: "project-badge--pending"
        };
    }

    getDeadLineInfo() {
        const { deadline } = this.project;
        const date = new Date(`${deadline}T11:59:00`);

        if (!deadline || Number.isNaN(date.getTime())) {
            return {
                dateLabel: "No deadline set",
                relativeLabel: "Add a due date to track urgency",
                urgencyLabel: "No deadline",
                urgencyClass: "project-badge--pending"
            };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil((date - today) / 86400000);
        const dateLabel = new Intl.DateTimeFormat("en", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(date);

        const deadlineInfo = {
            dateLabel,
            relativeLabel: `Due in ${daysLeft} days`,
            urgencyLabel: "Low urgency",
            urgencyClass: "project-badge--low"
        };

        switch (true) {
            case daysLeft < 0: {
                const absDays = Math.abs(daysLeft);
                deadlineInfo.relativeLabel = `Overdue by ${absDays} ${absDays === 1 ? "day" : "days"}`;
                deadlineInfo.urgencyLabel = "Overdue";
                deadlineInfo.urgencyClass = "project-badge--overdue";
                break;
            }
            case daysLeft <= 7:
                deadlineInfo.relativeLabel = daysLeft === 0 ? "Due today" : `Due in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`;
                deadlineInfo.urgencyLabel = "High urgency";
                deadlineInfo.urgencyClass = "project-badge--urgent";
                break;

            case daysLeft <= 21:
                deadlineInfo.urgencyLabel = "Upcoming";
                deadlineInfo.urgencyClass = "project-badge--upcoming";
                break;
        }

        return deadlineInfo;
    }

    renderCollabs() {
        const collaborators = Array.isArray(this.project.collaborators) ? this.project.collaborators : [];
        const visible = collaborators.slice(0, 2);
        const remaining = collaborators.length - visible.length;

        const avatarsHtml = visible.map((member) => `
            <span class="project-card__avatar" role="img" aria-label="${htmlCharacters(member.name)}" title="${htmlCharacters(member.name)}">
                ${htmlCharacters(member.initials)}
            </span>
        `).join("");

        const remainingHtml = remaining > 0 ? `
            <span class="project-card__avatar project-card__avatar--more" aria-label="${remaining} more collaborators">
                +${remaining}
            </span>
        ` : "";

        return `${avatarsHtml}${remainingHtml}`;
    }

    static async shareProject(projectId) {
        const url = new URL("./project/project-detail.html", window.location.href);
        url.searchParams.set("id", projectId);

        try {
            await navigator.clipboard.writeText(url.toString());
            console.log("¡Enlace copiado al portapapeles:", url.toString());

            alert("¡Enlace del proyecto copiado al portapapeles!");
        } catch (error) {
            console.error("Error al copiar al portapapeles:", error);
        }
    }
}