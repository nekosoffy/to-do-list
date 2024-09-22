import { project, task } from "./index.js"
import { select, selectId, create, allowInteraction, changeInteraction } from "./project-display.js"

const taskDisplay = () => {
    const newTaskBtn = selectId("new-task");
    const taskForm = selectId("task-form");
    const cancelBtn = select("#task-form .cancel-btn");
    const checklistConfirmBtn = selectId("new-checklist");
    const fieldset = select("#task-form fieldset");
    const itemInput = select("#checklist-item");
    const ul = select("#task-form ul");
    const tasksContainer = select("#tasks-container");
    let currentIndex = null;
    
    function showForm() {
        if (allowInteraction){
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

    function handleClick(event) {
        const button = event.target;
        currentIndex = parseInt(button.closest("[data-index]").dataset.index);
        if (button.classList.contains("delete-btn")) {
            task.remove(currentIndex);
            updateTasks();
        }
    }

    function updateTasks() {
        tasksContainer.replaceChildren();
        tasksContainer.appendChild(taskForm);
    
        const tasks = Object.values(project.getProjectList()[project.getSelectedProject()])[0];
        
        tasks.forEach((task, index) => {
            let hasChecklist = false;
            const wrapper = document.createElement("div");
            const ul = document.createElement("ul");
            const newFieldset = document.createElement("fieldset");
            const checklistUl = document.createElement("ul");
            
            wrapper.classList.add("task-wrapper");
            wrapper.setAttribute("data-index", index);
            wrapper.addEventListener("click", handleClick);

            const firstElements = ["Title:", "Description:", "Due Date:", "Notes:", "Priority:"]; 

            for (let element of task) {
                if (firstElements.includes(Object.keys(element)[0]) && 
                Object.values(element)[0] !== "") {
                    
                    const li = document.createElement("li");
                    create("span", li, "", "item-title", Object.keys(element)[0]);
                    create("span", li, "", "item-value", ` ${Object.values(element)[0]}`);
                    ul.appendChild(li);

                } else if (
                    Object.keys(element)[0] === "Checklist:" &&
                    Object.values(element)[0].length) {

                        hasChecklist = true;
                        create("legend", newFieldset, "checklist-title", "", "Checklist");

                    for (let item of Object.values(element)[0]) {
                        const li = document.createElement("li");
                        create("button", li, "", "checklist-status");
                        create("span", li, "", "checklist-item", Object.keys(item)[0]);
                        checklistUl.appendChild(li);
                    }
                }
            }    

            wrapper.appendChild(ul);

            if (hasChecklist) {
                newFieldset.appendChild(checklistUl);
                wrapper.appendChild(newFieldset);
            }
            
        
            create("button", wrapper, "", "edit-btn", "Edit");
            create("button", wrapper, "", "delete-btn", "Delete");
            tasksContainer.appendChild(wrapper);
        });

        project.populateStorage();
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
        const button = event.target;
        const deleteAllBtn = selectId("delete-checklist");
        const li = select("#task-form li");
    
        if (button.id === "delete-checklist") {
            ul.replaceChildren();
            deleteAllBtn.remove();
        }
        if (button.id === "checklist-item-delete") {
            button.closest("li").remove();
            
            if (!fieldset.contains(li)) {
                ul.replaceChildren();
                deleteAllBtn.remove();
            }
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        const inputs = taskForm.querySelectorAll("input", "select", "textarea"); // Getting the form values.
        const sel = document.querySelector("select");
        const selectedOption = sel.options[sel.selectedIndex].text;
        const checklistItems = fieldset.querySelectorAll("span");

        const inputValues = Array.from(inputs).map(input => input.value);
        const checklistValues = Array.from(checklistItems).map(input => input.textContent);

        inputValues.pop(); // Removing the residual value of the form's checklist text input.
        inputValues.splice(3, 0, selectedOption); // Inserting the priority after getting it.

        for (const el of checklistValues) {
            inputValues.push(el); // Placing each checklist item along with the other values.
        }

        hideForm();
        task.create(...inputValues);
        updateTasks();
    }
    
    fieldset.addEventListener("click", handleChecklistBtnClick);
    taskForm.addEventListener("submit", handleSubmit);
    newTaskBtn.addEventListener("click", showForm);
    cancelBtn.addEventListener("click", hideForm);
    checklistConfirmBtn.addEventListener("click", handleNewChecklistItem);

    return { updateTasks };
}

export { taskDisplay };