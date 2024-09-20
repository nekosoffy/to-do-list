import { task, project } from "./index.js";

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

const projectDisplay = () => {
    const newProjectBtn = selectId("new-project");
    const projectDialog = selectId("project-dialog");
    const projectForm = selectId("project-form");
    const cancelBtn = select(".cancel-btn");
    const projectTitle = selectId("project-title");
    const projectsContainer = selectId("projects-container");
    const wrapper = select(".project-wrapper");
    let editMode = false;
    let currentIndex = null;

    function updateProjects() {
        projectsContainer.replaceChildren();
        project.getProjectList().forEach((project, index) => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("project-wrapper");
            wrapper.setAttribute("data-index", index);
            wrapper.addEventListener("click", handleBtnClick);
            create("p", wrapper, "", "", `${Object.keys(project)[0]}`);
            create("button", wrapper, "", "edit-btn", "Edit");
            projectsContainer.appendChild(wrapper);
        })
    }

    function handleSubmit() {
        if (editMode === false) {
            project.create(projectTitle.value);
            updateProjects();
            projectForm.reset();
        } else {
            project.edit(currentIndex, projectTitle.value);
            editMode = false;
            currentIndex = null;
            updateProjects();
            projectForm.reset();
        }
    }

    function handleBtnClick(event) {
        const button = event.target;
        currentIndex = parseInt(button.closest("[data-index]").dataset.index);
        if (button.classList.contains("edit-btn")) {
            const currentTitle = Object.keys(project.getProjectList()[currentIndex])[0];
            projectTitle.value = currentTitle; // Set the input's content to default to the current title when editing.
            projectDialog.showModal();
            editMode = true;
        }
    }

    newProjectBtn.addEventListener("click", () => projectDialog.showModal());
    cancelBtn.addEventListener("click", () => {
        projectDialog.close();
        projectForm.reset();
    });
    projectForm.addEventListener("submit", handleSubmit);

    updateProjects();
}

export { projectDisplay };