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
    const projectTitle = selectId("project-title");
    const cancelBtn = select(".project-form .cancel-btn");
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
            !firstProject.contains(deleteBtn)) { // Allows deleting default project after there is at least another one.
                const buttonWrapper = select(".button-wrapper");
                const newButtonWrapper = document.createElement("div");
                newButtonWrapper.classList.add("button-wrapper");
                firstProject.removeChild(buttonWrapper);
                const editBtn = create("button", newButtonWrapper, "", "edit-btn", "Edit");
                const deleteBtn = create("button", newButtonWrapper, "", "delete-btn", "Delete"); 
                editBtn.classList.add("hidden");
                deleteBtn.classList.add("hidden");
                firstProject.appendChild(newButtonWrapper);
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
        highlightProject();
    }

    function handleSubmit(event) {
        if (editMode === false) {
            event.preventDefault();
            console.log(projectTitle);
            project.create(projectTitle.value);
            hideForm();
            projectForm.classList.add("hidden");
            updateProjects();
            highlightProject();
        } else {
            event.preventDefault();
            project.edit(currentIndex, projectTitle.value);
            hideForm();
            updateProjects();
            highlightProject();
        }
    }

    function handleClick(event) {
        const target = event.target;
        currentIndex = parseInt(target.closest("[data-index]").dataset.index);
        project.select(currentIndex);
        highlightProject();
        if (target.classList.contains("edit-btn") && allowInteraction) {
            allowInteraction = false;
            const editForm = projectForm.cloneNode(true);
            projectsContainer.appendChild(editForm);
            editForm.addEventListener("submit", handleSubmit);
            const newLabel = selectAll("[for=project-title]");
            const editProjectTitle = selectAll("#project-title");
            newLabel.forEach(el => el.textContent = "New title:");
            const currentTitle = Object.keys(project.getProjectList()[currentIndex])[0];
            const currentProject = target.closest(".project-wrapper");
            editProjectTitle.forEach(el => el.value = currentTitle); // Set the input's content to default to the current title when editing.
            editForm.classList.remove("hidden");
            currentProject.replaceWith(editForm);

            const newCancelBtn = selectAll(".project-form .cancel-btn");
            newCancelBtn[1].addEventListener("click", hideForm);

            editMode = true;
        } else if (target.classList.contains("delete-btn") && allowInteraction) {
            const wrapper = target.closest(".project-wrapper");
            console.log(wrapper);
            fadeOut(wrapper);
            project.remove(currentIndex);
            updateProjects();  
            taskDisplayInstance.updateTasks();
            highlightProject();
            showProjectTitle(project.getSelectedProject());
        } else if (allowInteraction) {
            highlightProject();
            project.select(currentIndex);
            taskDisplayInstance.updateTasks();
            showProjectTitle(currentIndex);
        }
    }

    function showProjectTitle(index) {
        const h2 = select("h2");
        h2.textContent = Object.keys(project.getProjectList()[index])[0];
    }

    function highlightProject() {
        const wrappers = projectsContainer.childNodes;
        wrappers.forEach(el => el.removeAttribute("id"));
        const index = project.getSelectedProject() + 1;
        wrappers[index].id = "selected-project";
    }

    function fadeOut(target) {
        let opacity = 1;
        let interval = setInterval(function () {
            if (opacity > 0) {
                opacity -= 0.1;
                target.style.opacity = opacity;
            } else {
                clearInterval(interval);
            }
        }, 1100);
    }

    newProjectBtn.addEventListener("click", showForm);
    projectForm.addEventListener("submit", handleSubmit);
    cancelBtn.addEventListener("click", hideForm);

    return { showProjectTitle, updateProjects, allowInteraction, highlightProject };
}

export { projectDisplay, select, selectId, create, allowInteraction, changeInteraction };