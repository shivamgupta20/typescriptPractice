import { autoBind } from "../decorators/autoBind.js";
import { projectState } from "../state/project-state.js";
import { Validatable, validate } from "../util/validation.js";
import { Component } from "./base-component.js";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
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