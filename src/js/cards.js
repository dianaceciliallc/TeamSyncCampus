import { escapeHtml, showAlert, avatarHtml } from "./helpers.js";

const STATUS_BADGES = {
    "in-progress": { label: "In progress", className: "project-badge--progress" },
    "not-started": { label: "Not started", className: "project-badge--pending" },
    "completed": { label: "Completed", className: "project-badge--completed" }
};

function getDeadlineInfo(deadline) {
    const date = new Date(deadline + "T11:59:00");

    if (!deadline || isNaN(date.getTime())) {
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

    const info = {
        dateLabel: date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
        relativeLabel: "Due in " + daysLeft + " days",
        urgencyLabel: "Low urgency",
        urgencyClass: "project-badge--low"
    };

    if (daysLeft < 0) {
        const late = Math.abs(daysLeft);
        info.relativeLabel = "Overdue by " + late + (late === 1 ? " day" : " days");
        info.urgencyLabel = "Overdue";
        info.urgencyClass = "project-badge--overdue";
    } else if (daysLeft <= 7) {
        info.relativeLabel = daysLeft === 0 ? "Due today" : "Due in " + daysLeft + (daysLeft === 1 ? " day" : " days");
        info.urgencyLabel = "High urgency";
        info.urgencyClass = "project-badge--urgent";
    } else if (daysLeft <= 21) {
        info.urgencyLabel = "Upcoming";
        info.urgencyClass = "project-badge--upcoming";
    }

    return info;
}

function collaboratorsHtml(collaborators) {
    let html = "";

    for (const person of collaborators.slice(0, 2)) {
        html += `
            <span class="project-card__avatar" role="img" aria-label="${escapeHtml(person.name)}" title="${escapeHtml(person.name)}">
                ${avatarHtml(person)}
            </span>`;
    }

    const extra = collaborators.length - 2;
    if (extra > 0) {
        html += `<span class="project-card__avatar project-card__avatar--more" aria-label="${extra} more collaborators">+${extra}</span>`;
    }
    return html;
}

export function createProjectCard(project, collaborators, animate) {
    const status = STATUS_BADGES[project.status] || STATUS_BADGES["not-started"];
    const deadline = getDeadlineInfo(project.deadline);

    return `
        <article class="project-card${animate ? " is-entering" : ""}" data-project-id="${escapeHtml(project.id)}">
            <div class="project-card__header">
                <p class="project-card__course">${escapeHtml(project.course)}</p>
                <div class="project-card__badges" aria-label="Project status and urgency">
                    <span class="project-badge ${status.className}">${status.label}</span>
                    <span class="project-badge ${deadline.urgencyClass}">${deadline.urgencyLabel}</span>
                </div>
            </div>

            <div class="project-card__deadline">
                <span class="project-card__deadline-label">
                    <span class="project-card__calendar-icon" aria-hidden="true"></span>
                    Due date
                </span>
                <strong class="project-card__deadline-date">${deadline.dateLabel}</strong>
                <span class="project-card__deadline-relative">${deadline.relativeLabel}</span>
            </div>

            <div class="project-card__content">
                <h2 class="project-card__title">${escapeHtml(project.title)}</h2>
                <p class="project-card__summary">${escapeHtml(project.summary)}</p>
            </div>

            <div class="project-card__footer">
                <button class="project-card__details" type="button" data-action="view-project">
                    <span class="project-card__info-icon" aria-hidden="true">i</span>
                    View details
                </button>

                <div class="project-card__footer-actions">
                    <div class="project-card__team" role="group" aria-label="Project collaborators">
                        ${collaboratorsHtml(collaborators)}
                    </div>
                    <button class="project-card__share" type="button" data-action="share-project">Share</button>
                </div>
            </div>
        </article>
    `;
}

export async function shareProject(projectId) {
    const url = new URL("project/project-detail.html", new URL("../", import.meta.url));
    url.searchParams.set("id", projectId);

    try {
        await navigator.clipboard.writeText(url.href);
        showAlert("Project link copied to clipboard");
    } catch (error) {
        showAlert("Could not copy the link", "error");
    }
}
