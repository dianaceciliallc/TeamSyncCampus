import { htmlCharacters } from "../../utils/utils.mjs";

const statusOptions = {
    "in-progress": { label: "In progress", className: "project-badge--progress" },
    "not-started": { label: "Not started", className: "project-badge--pending" },
    completed: { label: "Completed", className: "project-badge--completed" },
    review: { label: "In review", className: "project-badge--review" },
    open: { label: "Open", className: "project-badge--pending" },
    closed: { label: "Closed", className: "project-badge--closed" }
};

function getDeadlineInfo(deadline) {
    const date = new Date(`${deadline}T00:00:00`);

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

    if (daysLeft < 0) {
        return {
            dateLabel,
            relativeLabel: `Overdue by ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? "day" : "days"}`,
            urgencyLabel: "Overdue",
            urgencyClass: "project-badge--overdue"
        };
    }

    if (daysLeft <= 7) {
        return {
            dateLabel,
            relativeLabel: daysLeft === 0 ? "Due today" : `Due in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`,
            urgencyLabel: "High urgency",
            urgencyClass: "project-badge--urgent"
        };
    }

    if (daysLeft <= 21) {
        return {
            dateLabel,
            relativeLabel: `Due in ${daysLeft} days`,
            urgencyLabel: "Upcoming",
            urgencyClass: "project-badge--upcoming"
        };
    }

    return {
        dateLabel,
        relativeLabel: `Due in ${daysLeft} days`,
        urgencyLabel: "Low urgency",
        urgencyClass: "project-badge--low"
    };
}

export function projectCard(project) {
    const status = statusOptions[project.status] ?? {
        label: project.status ?? "Not started",
        className: "project-badge--pending"
    };
    const deadline = getDeadlineInfo(project.deadline);
    const collaborators = Array.isArray(project.collaborators) ? project.collaborators : [];
    const visibleCollaborators = collaborators.slice(0, 3);
    const remainingCollaborators = collaborators.length - visibleCollaborators.length;

    return `
        <article class="project-card" data-project-id="${htmlCharacters(project.id)}">
            <div class="project-card__header">
                <p class="project-card__course">${htmlCharacters(project.course)}</p>
                <div class="project-card__badges" aria-label="Project status and urgency">
                    <span class="project-badge ${status.className}">${htmlCharacters(status.label)}</span>
                    <span class="project-badge ${deadline.urgencyClass}">${htmlCharacters(deadline.urgencyLabel)}</span>
                </div>
            </div>

            <div class="project-card__deadline">
                <span class="project-card__deadline-label">
                    <span class="project-card__calendar-icon" aria-hidden="true"></span>
                    Due date
                </span>
                <strong class="project-card__deadline-date">${htmlCharacters(deadline.dateLabel)}</strong>
                <span class="project-card__deadline-relative">${htmlCharacters(deadline.relativeLabel)}</span>
            </div>

            <div class="project-card__content">
                <h2 class="project-card__title">${htmlCharacters(project.title)}</h2>
                <p class="project-card__summary">${htmlCharacters(project.summary)}</p>
            </div>

            <div class="project-card__footer">
                <button class="project-card__details" type="button" data-action="view-project">
                    <span class="project-card__info-icon" aria-hidden="true">i</span>
                    View details
                </button>

                <div class="project-card__footer-actions">
                    <div class="project-card__team" role="group" aria-label="Project collaborators">
                        ${visibleCollaborators.map((member) => `
                            <span class="project-card__avatar" role="img" aria-label="${htmlCharacters(member.name)}" title="${htmlCharacters(member.name)}">
                                ${htmlCharacters(member.initials)}
                            </span>
                        `).join("")}
                        ${remainingCollaborators > 0 ? `
                            <span class="project-card__avatar project-card__avatar--more" aria-label="${remainingCollaborators} more collaborators">
                                +${remainingCollaborators}
                            </span>
                        ` : ""}
                    </div>
                    <button class="project-card__share" type="button" data-action="share-project">
                        Share
                    </button>
                </div>
            </div>
        </article>
    `;
}