import { project, taskDisplayInstance } from "./index.js";

// Helper functions
const select = (target) => document.querySelector(target);
const selectAll = (target) => document.querySelectorAll(target);
const selectId = (target) => document.getElementById(target);

function create(name, parent, id, htmlClass, text) {
    const element = document.createElement(name);

    if (id !== undefined &&
        id !== "") {
        element.id = id;
    }

    if (htmlClass !== undefined &&
        htmlClass !== "") {
        element.classList.add(htmlClass);
    }

    if (text !== undefined &&
        text !== "") {
        element.textContent = text;
    }

    parent.appendChild(element);
    
    return element;
}
//

let allowInteraction = true;
const changeInteraction = () => allowInteraction = !allowInteraction;

const projectDisplay = () => {
    const newProjectBtn = selectId("new-project");
    const projectForm = selectId("project-form");
    const formInput = select("#project-form input");
    const cancelBtn = select("#project-form .cancel-btn");
    const label = select("[for=project-title]");
    const projectTitle = selectId("project-title");
    const projectsContainer = selectId("projects-container");
    let editMode = false;
    let currentIndex = null;

    function updateProjects() {
        projectsContainer.replaceChildren();
        projectsContainer.appendChild(projectForm);
        project.getProjectList().forEach((project, index) => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("project-wrapper");
            wrapper.setAttribute("data-index", index);
            wrapper.addEventListener("click", handleClick);
            create("p", wrapper, "", "", `${Object.keys(project)[0]}`);
            create("button", wrapper, "", "edit-btn", "Edit");
            
            if (index !== 0 ||
                Object.values(project)[0].length ||
                Object.keys(project)[0] !== "Default Project") { 
                    create("button", wrapper, "", "delete-btn", "Delete"); // Check if project is not the default one before adding a delete button.
            }

            projectsContainer.appendChild(wrapper);
        })

        const firstProject = select('[data-index="0"]');
        const secondProject = select('[data-index="1"]');
        const deleteBtn = select(".delete-btn");

        if (projectsContainer.contains(secondProject) && 
            !firstProject.contains(deleteBtn)) {
                create("button", firstProject, "", "delete-btn", "Delete"); // Allows deleting default project after there being another one.
        }

        project.populateStorage();
    }

    function hideButtons() {
        const editBtn = selectAll(".project-wrapper .edit-btn");
        const deleteBtn = selectAll(".project-wrapper .delete-btn");
        editBtn.forEach(el => el.classList.add("hidden"));
        deleteBtn.forEach(el => el.classList.add("hidden"));
        newProjectBtn.classList.add("hidden");
    }

    function showButtons() {
        const editBtn = selectAll(".project-wrapper .edit-btn");
        const deleteBtn = selectAll(".project-wrapper .delete-btn");
        editBtn.forEach(el => el.classList.remove("hidden"));
        deleteBtn.forEach(el => el.classList.remove("hidden"));
        newProjectBtn.classList.remove("hidden");
    }

    function showForm() {
        if (allowInteraction) {
            hideButtons();
            projectForm.classList.remove("hidden");
            formInput.focus();
            allowInteraction = false;
        }
    }

    function hideForm () {
        showButtons();
        projectForm.classList.add("hidden");
        projectForm.reset();
        label.textContent = "Name your project:";
        editMode = false;
        currentIndex = null;
        allowInteraction = true;
    }

    function handleSubmit(event) {
        if (editMode === false) {
            event.preventDefault();
            project.create(projectTitle.value);
            hideForm();
            updateProjects();
        } else {
            event.preventDefault();
            project.edit(currentIndex, projectTitle.value);
            hideForm();
            updateProjects();
        }
    }

    function handleClick(event) {
        const target = event.target;
        currentIndex = parseInt(target.closest("[data-index]").dataset.index);
        if (target.classList.contains("edit-btn") && allowInteraction) {
            projectsContainer.scrollTo(0, 0);
            label.textContent = "New title:";
            const currentTitle = Object.keys(project.getProjectList()[currentIndex])[0];
            projectTitle.value = currentTitle; // Set the input's content to default to the current title when editing.
            showForm();
            editMode = true;
        } else if (target.classList.contains("delete-btn") && allowInteraction) {
            project.remove(currentIndex);
            updateProjects();
        } else if (allowInteraction) {
            project.select(currentIndex);
            taskDisplayInstance.updateTasks();
            showProjectTitle(currentIndex);
        }
    }

    function showProjectTitle(index) {
        const h2 = select("h2");
        h2.textContent = Object.keys(project.getProjectList()[index])[0];
    }

    newProjectBtn.addEventListener("click", showForm);
    projectForm.addEventListener("submit", handleSubmit);
    cancelBtn.addEventListener("click", hideForm);

    return { showProjectTitle, updateProjects, allowInteraction };
}

export { projectDisplay, select, selectId, create, allowInteraction, changeInteraction };