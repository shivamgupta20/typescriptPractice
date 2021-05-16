//auto bind decorator
function autoBind(_target: any, _methodName: string, descriptor: PropertyDescriptor){
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get(){
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }
    return adjDescriptor;
}

///validation method
interface Validatable{
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable){
    let isValid = true;
    if(validatableInput.required){
        isValid = isValid && validatableInput.value.toString().length !==0;
    }
    if(validatableInput.minLength!=null && typeof validatableInput.value === "string"){
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength
    }
    if(validatableInput.maxLength!=null && typeof validatableInput.value === "string"){
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
    }
    if(validatableInput.min != null && typeof validatableInput.value === "number"){
        isValid = isValid && validatableInput.value >= validatableInput.min
    }
    if(validatableInput.max != null && typeof validatableInput.value === "number"){
        isValid = isValid && validatableInput.value <= validatableInput.max
    }
    return isValid
}

//project Input class
class ProjectInput{
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor(){
        this.templateElement = <HTMLTemplateElement>document.getElementById("project-input")!;
        this.hostElement = <HTMLDivElement>document.getElementById("app")!;
        
        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = <HTMLFormElement>importedNode.firstElementChild!
        this.element.id = "user-input"

        this.titleInputElement = <HTMLInputElement> this.element.querySelector("#title");
        this.descriptionInputElement = <HTMLInputElement> this.element.querySelector("#description");
        this.peopleInputElement = <HTMLInputElement> this.element.querySelector("#people");
        
        this.configure();
        this.attach();
    }

    private gatherUserInput(): [string, string, number] | void{
        const enteredTitle =  this.titleInputElement.value
        const enteredDescription =  this.descriptionInputElement.value
        const enteredPeople =  this.peopleInputElement.value
        const titleValidatable : Validatable = {
            value: enteredTitle,
            required: true
        }
        const descValidatable : Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }
        const peopleValidatable : Validatable = {
            value: enteredPeople,
            required: true,
            min:1
        }
        
        if(!validate(titleValidatable) || !validate(descValidatable) || !validate(peopleValidatable)){
            alert("Invalid input, pleases try again")
        }
        else{
            return [enteredTitle, enteredDescription, parseFloat(enteredPeople)]
        }
    }

    private clearInputs(){
        this.titleInputElement.value = ""
        this.descriptionInputElement.value = ""
        this.peopleInputElement.value = ""
    }

    @autoBind
    private submitHandler(event: Event){
        event.preventDefault();
        const userInput=this.gatherUserInput();
        if(Array.isArray(userInput)){
            const [title, description, people] = userInput;
            console.log(title, description, people)
            this.clearInputs()
        }


        console.log(this.titleInputElement.value)
        console.log(this.descriptionInputElement.value)
        console.log(this.peopleInputElement.value)
    }
    
    private configure(){
        this.element.addEventListener("submit", this.submitHandler)//.bind(this))
    }

    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}

const prjInput = new ProjectInput();