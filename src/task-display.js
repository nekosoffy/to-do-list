import { project, task, projectDisp } from "./index.js"
import { select, selectId, create, allowInteraction, changeInteraction } from "./project-display.js"
import { format } from "date-fns";

const taskDisplay = () => {
    const newTaskBtn = selectId("new-task");
    const taskForm = selectId("task-form");
    const cancelBtn = select("#task-form .cancel-btn");
    const checklistConfirmBtn = selectId("new-checklist-button");
    const fieldset = select("#task-form fieldset");
    const itemInput = select("#new-checklist-item");
    const ul = select(".checklist");
    const tasksContainer = select("#tasks-container");
    let currentIndex = null;
    
    function showForm() {
        if (allowInteraction){
            taskForm.classList.remove("removed");
            newTaskBtn.classList.add("hidden");
            changeInteraction();
        }
        
    }

    function hideForm() {
        const deleteAllBtnSelector = selectId("delete-checklist"); 
        taskForm.classList.add("removed");
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
            const wrapper = document.createElement("article");
            const ul = document.createElement("ul");
            const newFieldset = document.createElement("fieldset");
            const checklistUl = document.createElement("ul");
            
            wrapper.classList.add("task-wrapper");
            wrapper.setAttribute("data-index", index);
            wrapper.addEventListener("click", handleClick);

            const nextElements = ["Notes:", "Priority:"]; 

            for (let element of task) {
                if (Object.keys(element)[0] === "Title:" && 
                Object.values(element)[0] !== "") {
                    
                    const li = document.createElement("li");
                    li.classList.add("title-li");
                    create("h4", li, "", "item-value", ` ${Object.values(element)[0]}`);
                    ul.appendChild(li);

                } else if (Object.keys(element)[0] === "Description:" && 
                Object.values(element)[0] !== "") {

                    const li = document.createElement("li");
                    li.classList.add("task-li");
                    create("p", li, "", "item-description", ` ${Object.values(element)[0]}`);
                    ul.appendChild(li);

                } else if (Object.keys(element)[0] === "Due Date:") {

                    if (Object.values(element)[0]) {
                    const li = document.createElement("li");
                    li.classList.add("task-li");
                    create("span", li, "", "item-title", Object.keys(element)[0]);
                    create("span", li, "", "item-value", ` ${format(Object.values(element)[0], "yyyy/MM/dd")}`);
                    ul.appendChild(li);
                    }
            
                } else if (nextElements.includes(Object.keys(element)[0]) && 
                Object.values(element)[0] !== "") {

                    const li = document.createElement("li");
                    li.classList.add("task-li");
                    create("span", li, "", "item-title", Object.keys(element)[0]);
                    create("span", li, "", "item-value", ` ${Object.values(element)[0]}`);
                    ul.appendChild(li);

                } else if (
                    Object.keys(element)[0] === "Checklist:" &&
                    Object.values(element)[0].length) {

                        hasChecklist = true;
                        create("legend", newFieldset, "checklist-title", "", "Checklist");

                    for (let item of Object.values(element)[0]) {;
                        const li = document.createElement("li");
                        li.classList.add("checklist-li");
                        const checklistItemBtn = create("button", li, "", "checklist-status");
                        checklistItemBtn.addEventListener("click", completeChecklistItem);
                        create("p", li, "", "checklist-item", item);
                        checklistUl.appendChild(li);
                    }
                }
            }    

            wrapper.appendChild(ul);

            if (hasChecklist) {
                newFieldset.appendChild(checklistUl);
                wrapper.appendChild(newFieldset);
            }
        
            create("button", wrapper, "", "delete-btn", "Delete");
            tasksContainer.appendChild(wrapper);
        });

        projectDisp.updateProjects();
        projectDisp.highlightProject();
        project.populateStorage();
    }
       
    function handleNewChecklistItem() {
        if (itemInput.value !== "") {
            const text = itemInput.value.at(0).toUpperCase() + itemInput.value.slice(1);
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
            newLi.classList.add("added-checklist-li");
            const p = document.createElement("p");
            p.classList.add("added-checklist-item");
            const remove = document.createElement("button");
            
            p.textContent = `• ${text}`;
            remove.setAttribute("type", "button");
            remove.textContent = "Delete";
            remove.id = "checklist-item-delete";

            newLi.appendChild(p);
            newLi.appendChild(remove);
            ul.appendChild(newLi);
        }
    }

    function handleChecklistBtnClick(event) {
        const button = event.target;
        const deleteAllBtn = selectId("delete-checklist");
    
        if (button.id === "delete-checklist") {
            ul.replaceChildren();
            deleteAllBtn.remove();
        }
        if (button.id === "checklist-item-delete") {
            button.closest("li").remove();
            
            if (ul.length = 0) {
                deleteAllBtn.remove();
            }
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        const inputs = taskForm.querySelectorAll("input, textarea"); // Getting the form values.
        const sel = document.querySelector("select");
        const selectedOption = sel.options[sel.selectedIndex].text;
        const checklistItems = fieldset.querySelectorAll("p");

        const inputValues = Array.from(inputs).map(input => input.value);
        const checklistValues = Array.from(checklistItems).map(input => input.textContent);

        inputValues.pop(); // Removing the residual value of the form's checklist text input.
        inputValues.splice(3, 0, selectedOption); // Inserting the priority after getting it.

        for (let el of checklistValues) {
            el = el.slice(2);
            inputValues.push(el); // Placing each checklist item along with the other values.
        }

        hideForm();
        task.create(...inputValues);
        updateTasks();
    }

    function completeChecklistItem(event) {
        const button = event.target;
        const item = button.nextElementSibling;

        if (item.classList.contains("checked")) {
            item.classList.remove("checked");
            button.classList.remove("pressed");
        } else {
            item.classList.add("checked");
            button.classList.add("pressed");
        }
        
    }

    fieldset.addEventListener("click", handleChecklistBtnClick);
    taskForm.addEventListener("submit", handleSubmit);
    newTaskBtn.addEventListener("click", showForm);
    cancelBtn.addEventListener("click", hideForm);
    checklistConfirmBtn.addEventListener("click", handleNewChecklistItem);

    return { updateTasks };
}

export { taskDisplay };