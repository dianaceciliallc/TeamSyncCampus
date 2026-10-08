import { loadComponent } from "./ui/render.js";
import { projectCard } from "./ui/components/projectCard.mjs";

await Promise.all([
    loadComponent("./ui-components/header.html", "#site-header"),
    loadComponent("./ui-components/footer.html", "#site-footer"),
    loadComponent("./ui-components/dashboard.html", "#main-content")
]);

async function toJSON () {
    const response = await fetch(new URL("../assets/data.json", import.meta.url));
    const data = await response.json();
    return data
}

const data = await toJSON();


const projectListElements = document.querySelector("#projects-list");
const usersById = new Map(data.users.map((user) => [user.id, user]));

const coursesSelect = document.querySelector(".courses-select");
const courses = [...new Set(data.projects.map((project) => project.course))];

for (const course of courses) {
    const option = document.createElement("option");
    option.value = course;
    option.textContent = course;
    coursesSelect.append(option);
}

projectListElements.innerHTML = data.projects
    .map((project) => {
        const collaborators = (project.collaboratorIds ?? [])
            .map((userId) => usersById.get(userId))
            .filter(Boolean);
        return projectCard({ ...project, collaborators });
    })
    .join("");