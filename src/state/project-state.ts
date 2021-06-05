import { Project, ProjectStatus } from "../models/project.js";

type Listener = (items: Project[]) => void;

export class ProjectState {
    public static instance: ProjectState
    private projects: Project[] = [];
    private listeners: Listener[] = []

    private constructor() { }
    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active)


        this.projects.push(newProject);
        this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find(prj => prj.id === projectId)
        if (project) {
            project.status = newStatus;
            this.updateListeners();
        }


    }
    private updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    static get Instance() {
        if (this.instance) {
            return this.instance
        }
        this.instance = new ProjectState();
        return this.instance;
    }
}

export const projectState = ProjectState.Instance;

