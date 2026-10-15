import { generateId, calculateProgress } from "./helpers.js";

export function newProject(fields, userId) {
    return {
        course: fields.course,
        title: fields.title,
        summary: fields.summary,
        deadline: fields.deadline,
        status: fields.status,
        createdBy: userId,
        progress: 0,
        collaboratorIds: [userId],
        milestones: [],
        resources: []
    };
}

export function refreshProject(project) {
    for (const milestone of project.milestones) {
        const total = milestone.tasks.length;
        if (total === 0) continue;

        let done = 0;
        for (const task of milestone.tasks) {
            if (task.completed) done++;
        }

        if (done === total) {
            milestone.status = "completed";
        } else if (done > 0) {
            milestone.status = "in-progress";
        } else {
            milestone.status = "not-started";
        }
    }

    project.progress = calculateProgress(project);

    if (project.progress === 100) {
        project.status = "completed";
    } else if (project.progress > 0 && project.status !== "in-progress") {
        project.status = "in-progress";
    }
}

export function findMilestone(project, milestoneId) {
    return project.milestones.find((m) => m.id === milestoneId);
}

export function findTask(project, milestoneId, taskId) {
    const milestone = findMilestone(project, milestoneId);
    if (!milestone) return undefined;
    return milestone.tasks.find((t) => t.id === taskId);
}

export function findResource(project, resourceId) {
    return project.resources.find((r) => r.id === resourceId);
}

export function editProject(project, fields) {
    project.course = fields.course;
    project.title = fields.title;
    project.summary = fields.summary;
    project.deadline = fields.deadline;
    project.status = fields.status;
}

export function joinProject(project, userId) {
    if (!project.collaboratorIds.includes(userId)) {
        project.collaboratorIds.push(userId);
    }
}

export function addMilestone(project, fields) {
    const milestone = {
        id: generateId("milestone"),
        title: fields.title,
        description: fields.description,
        assigneeId: fields.assigneeId,
        dueDate: fields.dueDate,
        availability: { start: fields.availabilityStart, end: fields.availabilityEnd },
        status: "not-started",
        tasks: []
    };
    project.milestones.push(milestone);
    return milestone;
}

export function editMilestone(project, milestoneId, fields) {
    const milestone = findMilestone(project, milestoneId);
    milestone.title = fields.title;
    milestone.description = fields.description;
    milestone.assigneeId = fields.assigneeId;
    milestone.dueDate = fields.dueDate;
    milestone.availability = { start: fields.availabilityStart, end: fields.availabilityEnd };
}

export function deleteMilestone(project, milestoneId) {
    project.milestones = project.milestones.filter((m) => m.id !== milestoneId);
}

export function addTask(project, milestoneId, fields) {
    const task = {
        id: generateId("task"),
        title: fields.title,
        assigneeId: fields.assigneeId,
        dueDate: fields.dueDate,
        completed: false
    };
    findMilestone(project, milestoneId).tasks.push(task);
    return task;
}

export function editTask(project, milestoneId, taskId, fields) {
    const task = findTask(project, milestoneId, taskId);
    task.title = fields.title;
    task.assigneeId = fields.assigneeId;
    task.dueDate = fields.dueDate;
}

export function deleteTask(project, milestoneId, taskId) {
    const milestone = findMilestone(project, milestoneId);
    milestone.tasks = milestone.tasks.filter((t) => t.id !== taskId);
}

export function toggleTask(project, milestoneId, taskId) {
    const task = findTask(project, milestoneId, taskId);
    task.completed = !task.completed;
}

export function addResource(project, fields) {
    const resource = { id: generateId("resource"), title: fields.title, url: fields.url };
    project.resources.push(resource);
    return resource;
}

export function editResource(project, resourceId, fields) {
    const resource = findResource(project, resourceId);
    resource.title = fields.title;
    resource.url = fields.url;
}

export function deleteResource(project, resourceId) {
    project.resources = project.resources.filter((r) => r.id !== resourceId);
}