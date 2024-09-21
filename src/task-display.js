import { project, task } from "./index.js"
import { select, selectId, selectAll, create, allowInteraction, changeInteraction } from "./project-display.js"

const taskDisplay = () => {
    const newTaskBtn = selectId("new-task");
    const taskForm = selectId("task-form");
    const cancelBtn = select("#task-form .cancel-btn");
    const checklistConfirmBtn = selectId("new-checklist");
    const fieldset = select("#task-form fieldset");
    const itemInput = select("#checklist-item");
    const ul = select("#task-form ul");

    function showForm() {
        if (allowInteraction === true) {
            taskForm.classList.remove("hidden");
            newTaskBtn.classList.add("hidden");
            changeInteraction();
        }
    }

    function hideForm() {
        const deleteAllBtnSelector = selectId("delete-checklist"); 
        taskForm.classList.add("hidden");
        newTaskBtn.classList.remove("hidden");
        taskForm.reset();
        changeInteraction();
        if (taskForm.contains(deleteAllBtnSelector)) {
            ul.replaceChildren();
            deleteAllBtnSelector.remove();
        }
    }
       
    function handleNewChecklistItem() {
        if (itemInput.value !== "") {
            const text = itemInput.value;
            itemInput.value = "";
            const deleteAllBtn = document.createElement("button"); 
            const deleteAllBtnSelector = selectId("delete-checklist");
            
            if (!fieldset.contains(deleteAllBtnSelector)) {
                deleteAllBtn.id = "delete-checklist";
                deleteAllBtn.setAttribute("type","button");
                deleteAllBtn.textContent = "Delete checklist";
                fieldset.appendChild(deleteAllBtn);
            }

            const newLi = document.createElement("li");
            const span = document.createElement("span");
            const remove = document.createElement("button")
            
            span.textContent = text;
            remove.setAttribute("type", "button");
            remove.textContent = "Delete";
            remove.id = "checklist-item-delete";

            newLi.appendChild(span);
            newLi.appendChild(remove);
            ul.appendChild(newLi);
        }
    }

    function handleChecklistBtnClick(event) {
        const fieldset = select("#task-form fieldset");
        const button = event.target;
        const li = select("#task-form li");
        
        if (button.id === "delete-checklist") {
            ul.replaceChildren();
        }

        if (button.id === "checklist-item-delete") {
            button.closest("li").remove();
        }

        if (button.id === "checklist-item-edit") {
            const itemInput = document.createElement("input");
            const confirm = document.createElement("button");
            const cancel = document.createElement("button");

            itemInput.required = true;
            itemInput.setAttribute("type", "text");
            itemInput.id = "checklist-item";
            button.closest("li").replaceChildren();
        }
    }

    function handleSubmit(event) {
        event.preventDefault();

        const inputs = taskForm.querySelectorAll("input", "select", "textarea"); // Getting the form values, except for priority and checklist.
        const checklistItems = fieldset.querySelectorAll("span");
        const checklistValues = Array.from(checklistItems).map(input => input.textContent);
        const inputValues = Array.from(inputs).map(input => input.value);
        const sel = document.querySelector("select");
        const selectedOption = sel.options[sel.selectedIndex].text;

        inputValues.pop(); // Removing the residual value of the form's checklist text input.
        inputValues.splice(3, 0, selectedOption); // Inserting the priority after getting it.

        for (const el of checklistValues) {
            inputValues.push(el); // Placing each checklist item along with the other values.
        }
        
        hideForm();
        task.create(...inputValues);
    }

    taskForm.addEventListener("submit", handleSubmit);
    newTaskBtn.addEventListener("click", showForm);
    cancelBtn.addEventListener("click", hideForm);
    checklistConfirmBtn.addEventListener("click", handleNewChecklistItem);
    fieldset.addEventListener("click", handleChecklistBtnClick);
}

export { taskDisplay };