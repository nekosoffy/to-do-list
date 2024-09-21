import { project } from "./index.js";

// Helper functions
const select = (target) => document.querySelector(target);
const selectId = (target) => document.getElementById(target);
const selectAll = (target) => document.querySelectorAll(target);

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
const changeInteraction = () => !allowInteraction;

const projectDisplay = () => {
    const newProjectBtn = selectId("new-project");
    const projectForm = selectId("project-form");
    const cancelBtn = select("#project-form .cancel-btn");
    const label = select("[for=project-title]");
    const projectTitle = selectId("project-title");
    const projectsContainer = selectId("projects-container");
    const wrapper = select(".project-wrapper");
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

    function showForm() {
        if (allowInteraction === true) {
            projectForm.classList.remove("hidden");
            newProjectBtn.classList.add("hidden");
            allowInteraction = false;
        }
    }

    function hideForm () {
        projectForm.classList.add("hidden");
        newProjectBtn.classList.remove("hidden");
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
        const button = event.target;
        currentIndex = parseInt(button.closest("[data-index]").dataset.index);
        if (button.classList.contains("edit-btn") && allowInteraction === true) {
            label.textContent = "New title:";
            const currentTitle = Object.keys(project.getProjectList()[currentIndex])[0];
            projectTitle.value = currentTitle; // Set the input's content to default to the current title when editing.
            showForm();
            editMode = true;
        } else if (button.classList.contains("delete-btn")) {
            project.remove(currentIndex);
            updateProjects();
        } else if (allowInteraction === true) {
            project.select(currentIndex);
        }
    }

    newProjectBtn.addEventListener("click", showForm);
    projectForm.addEventListener("submit", handleSubmit);
    cancelBtn.addEventListener("click", hideForm);

    updateProjects();
}

export { projectDisplay, select, selectId, selectAll, create, changeInteraction, allowInteraction };