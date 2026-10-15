import { getInitials } from "./helpers.js";

const API_URL = "https://6acf259703feaa52b21debd5.mockapi.io";

const RANDOM_USER_URL = "https://randomuser.me/api/?key=LO84-0H53-XIUQ-AF3E&results=5&seed=teamsync&nat=us,gb,es&inc=name,email,picture";
export const DEMO_EMAIL = "demo@teamsync.com";
export const DEMO_PASSWORD = "TeamSync123";

async function getList(path) {
    const response = await fetch(`${API_URL}/${path}`);
    if (response.status === 404) return [];
    if (!response.ok) throw new Error("Could not load " + path);
    return await response.json();
}

async function sendData(path, method, body) {
    const response = await fetch(`${API_URL}/${path}`, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
    });
    if (!response.ok) throw new Error("Request failed: " + method + " " + path);
    return await response.json();
}

function cleanProject(project) {
    project.collaboratorIds = project.collaboratorIds || [];
    project.milestones = project.milestones || [];
    project.resources = project.resources || [];
    for (const milestone of project.milestones) {
        milestone.tasks = milestone.tasks || [];
    }
    return project;
}

export async function getProjects() {
    const projects = await getList("projects");
    return projects.map(cleanProject);
}

export async function getProject(id) {
    const response = await fetch(`${API_URL}/projects/${id}`);
    if (!response.ok) return null;
    return cleanProject(await response.json());
}

export async function createProject(project) {
    return cleanProject(await sendData("projects", "POST", project));
}

export function updateProject(project) {
    return sendData(`projects/${project.id}`, "PUT", project);
}

export function deleteProject(id) {
    return sendData(`projects/${id}`, "DELETE");
}

export function getUsers() {
    return getList("users");
}

export function createUser(user) {
    return sendData("users", "POST", user);
}

export async function getRandomAvatar() {
    try {
        const response = await fetch("https://randomuser.me/api/?inc=picture");
        const data = await response.json();
        return data.results[0].picture.thumbnail;
    } catch (error) {
        return "";
    }
}

let seeded = false;

export async function seedIfEmpty() {
    if (seeded) return;
    seeded = true;

    const users = await getUsers();
    if (users.length === 0) {
        await seedUsers();
    }
}

async function seedUsers() {
    const response = await fetch(RANDOM_USER_URL);
    const data = await response.json();
    const users = [];

    for (let i = 0; i < data.results.length; i++) {
        const person = data.results[i];
        const name = person.name.first + " " + person.name.last;

        const user = await createUser({
            name: name,
            initials: getInitials(name),
            email: i === 0 ? DEMO_EMAIL : person.email,
            password: DEMO_PASSWORD,
            avatar: person.picture.thumbnail
        });
        users.push(user);
    }
    return users;
}