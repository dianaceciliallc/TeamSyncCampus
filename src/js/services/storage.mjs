const STORAGE_KEY = "teamsync_projects_data";

export class StorageService {
    constructor(initialData = null) {
        this.initialData = initialData;
    }

    // Obtener todos los datos (proyectos y usuarios)
    getData() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("[StorageService] Error parsing localStorage data:", e);
            }
        }
        
        // Si no hay datos guardados, usamos los iniciales y los guardamos por primera vez
        if (this.initialData) {
            this.saveData(this.initialData);
            return this.initialData;
        }

        return { projects: [], users: [] };
    }

    // Guardar todos los datos en localStorage
    saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("[StorageService] Error saving to localStorage:", e);
        }
    }

    // Añadir un nuevo proyecto
    addProject(newProjectData) {
        const data = this.getData();
        
        const project = {
            id: `project-${Date.now()}`,
            course: newProjectData.course,
            title: newProjectData.title,
            summary: newProjectData.summary,
            deadline: newProjectData.deadline,
            status: newProjectData.status || "not-started",
            progress: 0,
            collaboratorIds: [],
            milestones: [],
            resources: []
        };

        data.projects.push(project);
        this.saveData(data);
        return project;
    }

    // Actualizar el estado de una tarea (completada / pendiente) y recalcular progreso
    toggleTaskStatus(projectId, milestoneId, taskId) {
        const data = this.getData();
        const project = data.projects.find(p => p.id === projectId);
        if (!project) return null;

        const milestone = (project.milestones ?? []).find(m => m.id === milestoneId);
        if (!milestone) return null;

        const task = (milestone.tasks ?? []).find(t => t.id === taskId);
        if (!task) return null;

        // Alternar estado
        task.completed = !task.completed;

        // Recalcular progreso general del proyecto
        project.progress = this.calculateProgress(project);

        this.saveData(data);
        return project;
    }

    // Método auxiliar para calcular el porcentaje de avance
    calculateProgress(project) {
        const milestones = project.milestones ?? [];
        let totalTasks = 0;
        let completedTasks = 0;

        for (const milestone of milestones) {
            const tasks = milestone.tasks ?? [];
            for (const task of tasks) {
                totalTasks++;
                if (task.completed) {
                    completedTasks++;
                }
            }
        }

        if (totalTasks === 0) return 0;
        return Math.round((completedTasks / totalTasks) * 100);
    }
}