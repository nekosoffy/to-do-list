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
    const projectForm = select(".project-form");
    const formInput = select(".project-form input");
    const label = select("[for=project-title]");
    const cancelBtn = select(".project-form .cancel-btn");
    const projectTitle = selectId("project-title");
    const projectsContainer = selectId("projects-container");
    let editMode = false;
    let currentIndex = null;

    function updateProjects() {
        projectsContainer.replaceChildren();
        projectsContainer.appendChild(projectForm);
        project.getProjectList().forEach((project, index) => {
            const wrapper = document.createElement("div");
            const buttonWrapper = document.createElement("div");

            wrapper.classList.add("project-wrapper");
            wrapper.setAttribute("data-index", index);
            wrapper.addEventListener("click", handleClick);
            wrapper.addEventListener("mouseenter", showButtons);
            wrapper.addEventListener("mouseleave", hideButtons);

            buttonWrapper.classList.add("button-wrapper");

            create("p", wrapper, "", "project-title", `${Object.keys(project)[0]}`);
            const editBtn = create("button", buttonWrapper, "", "edit-btn", "Edit");
            editBtn.classList.add("hidden");
            
            if (index !== 0 ||
                Object.values(project)[0].length ||
                Object.keys(project)[0] !== "Default Project") { 
                const deleteBtn = create("button", buttonWrapper, "", "delete-btn", "Delete"); // Check if project is not the default one before adding a delete button.
                deleteBtn.classList.add("hidden");
            }

            wrapper.appendChild(buttonWrapper);
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

    function hideButtons(event) {
        const target = event.target;
        const currentWrapper = target.closest("[data-index]");
        const buttons = currentWrapper.querySelectorAll("button");
        buttons.forEach(el => el.classList.add("hidden"));
    }

    function showButtons(event) {
        const target = event.target;
        const currentWrapper = target.closest("[data-index]");
        const buttons = currentWrapper.querySelectorAll("button");
        buttons.forEach(el => el.classList.remove("hidden"));
    }

    function showForm() {
        if (allowInteraction) {
            projectsContainer.scrollTo(0, 0);
            newProjectBtn.classList.add("hidden");
            projectForm.classList.remove("hidden");
            formInput.focus();
            allowInteraction = false;
        }
    }

    function hideForm () {
        newProjectBtn.classList.remove("hidden");
        projectForm.reset();
        projectForm.classList.add("hidden");
        label.textContent = "Name your project:";
        editMode = false;
        currentIndex = null;
        allowInteraction = true;
        updateProjects();
    }

    function handleSubmit(event) {
        if (editMode === false) {
            event.preventDefault();
            project.create(projectTitle.value);
            hideForm();
            projectForm.classList.add("hidden");
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
            allowInteraction = false;
            const editForm = projectForm.cloneNode(true);
            projectsContainer.appendChild(editForm);
            editForm.addEventListener("submit", handleSubmit);
            const newLabel = selectAll("[for=project-title]");
            newLabel.forEach(el => el.textContent = "New title:");
            const currentTitle = Object.keys(project.getProjectList()[currentIndex])[0];
            const currentProject = target.closest(".project-wrapper");
            projectTitle.value = currentTitle; // Set the input's content to default to the current title when editing.
            editForm.classList.remove("hidden");
            currentProject.replaceWith(editForm);

            const newCancelBtn = selectAll(".project-form .cancel-btn");
            newCancelBtn[1].addEventListener("click", hideForm);

            editMode = true;
        } else if (target.classList.contains("delete-btn") && allowInteraction) {
            project.remove(currentIndex);
            updateProjects();
        } else if (allowInteraction) {
            const wrappers = projectsContainer.childNodes;
            wrappers.forEach(el => el.classList.remove("selected"));
            (target.closest("[data-index]")).classList.add("selected");
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