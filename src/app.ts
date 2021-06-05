////Drag and drop interfaces
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dragHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}


/// Project types

enum ProjectStatus { Active, Finished }
class Project {
    constructor(public id: string, public title: string, public description: string, public people: number, public status: ProjectStatus) {
    }
}

///Project state management class
type Listener = (items: Project[]) => void;

class ProjectState {
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
const projectState = ProjectState.Instance;

//auto bind decorator
function autoBind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }
    return adjDescriptor;
}

///validation method
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().length !== 0;
    }
    if (validatableInput.minLength != null && typeof validatableInput.value === "string") {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value === "string") {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
    }
    if (validatableInput.min != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value >= validatableInput.min
    }
    if (validatableInput.max != null && typeof validatableInput.value === "number") {
        isValid = isValid && validatableInput.value <= validatableInput.max
    }
    return isValid
}

//Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement>{
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
        this.templateElement = <HTMLTemplateElement> document.getElementById(templateId)!;
        this.hostElement = <T> document.getElementById(hostElementId)!;
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = <U> importedNode.firstElementChild!;
        if (newElementId)
            this.element.id = newElementId;
        this.attach(insertAtStart);
    }
    private attach(insertAtBeginning: boolean) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? "afterbegin" : "beforeend", this.element);
    }
    abstract configure(): void;
    abstract renderContent(): void;
}

//ProjectItem class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    private project: Project;

    get persons() {
        if (this.project.people === 1) {
            return "1 person"
        }
        else
            return `${this.project.people} persons`
    }

    constructor(hostId: string, project: Project) {
        super("single-project", hostId, false, project.id)
        this.project = project
        this.configure();
        this.renderContent();
    }

    dragStartHandler(event: DragEvent) {
        event.dataTransfer!.setData("text/plain", this.project.id)
        event.dataTransfer!.effectAllowed = "move"
    }

    dragEndHandler(_: DragEvent) {
        console.log("DragEnd")
    }

    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler.bind(this))
        this.element.addEventListener('dragend', this.dragEndHandler.bind(this))
    }

    renderContent() {
        this.element.querySelector("h2")!.textContent = this.project.title;
        this.element.querySelector("h3")!.textContent = this.persons + " assigned";
        this.element.querySelector("p")!.textContent = this.project.description;
    }
}


//Project list class
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
        super('project-list', 'app', false, `${type}-projects-lists`);
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }
    @autoBind
    dragOverHandler(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault();
            const listEl = this.element.querySelector("ul")!
            listEl.classList.add("droppable")
        }

    }
    @autoBind
    dragHandler(event: DragEvent) {
        const prjId = event.dataTransfer!.getData("text/plain")
        projectState.moveProject(prjId, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished)
    }
    @autoBind
    dragLeaveHandler(_: DragEvent) {
        const listEl = this.element.querySelector("ul")!
        listEl.classList.remove("droppable")

    }



    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler)
        this.element.addEventListener('dragleave', this.dragLeaveHandler)
        this.element.addEventListener('drop', this.dragHandler)


        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => this.type === "active" ? (prj.status === ProjectStatus.Active) : (prj.status === ProjectStatus.Finished))
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        })
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";

    }

    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listEl.innerHTML = ""
        for (const prjItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector("ul")!.id, prjItem)
        }
    }
}


//project Input class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super("project-input", "app", true, "user-input")
        this.titleInputElement = <HTMLInputElement> this.element.querySelector("#title");
        this.descriptionInputElement = <HTMLInputElement> this.element.querySelector("#description");
        this.peopleInputElement = <HTMLInputElement> this.element.querySelector("#people");

        this.configure();
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredPeople = this.peopleInputElement.value
        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        }
        const descValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }
        const peopleValidatable: Validatable = {
            value: enteredPeople,
            required: true,
            min: 1
        }

        if (!validate(titleValidatable) || !validate(descValidatable) || !validate(peopleValidatable)) {
            alert("Invalid input, pleases try again")
        }
        else {
            return [enteredTitle, enteredDescription, parseFloat(enteredPeople)]
        }
    }

    private clearInputs() {
        this.titleInputElement.value = ""
        this.descriptionInputElement.value = ""
        this.peopleInputElement.value = ""
    }

    @autoBind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInputs()
        }
    }

    configure() {
        this.element.addEventListener("submit", this.submitHandler)//.bind(this))
    }

    renderContent() { }
}

const prjInput = new ProjectInput();
const activePrjLists = new ProjectList("active");
const finishedPrjLists = new ProjectList("finished");
