import "./reset.css";
import "./styles.css";
import { projectDisplay } from "./project-display.js";
import { taskDisplay } from "./task-display.js";

const manageProject = () => {
    let projectList = [{ "Default Project": [] }];
    let selectedProject = 0;

    function create(title) {
        const project = { [title]: [] };
        projectList.push(project);
    }

    function edit(projectIndex, newTitle) {
        if (projectIndex >= projectList.length || 
            projectIndex < 0 ||
            !Number.isInteger(projectIndex)) {
                console.log("Invalid value!");
                return;
        }

        const currentTasks = Object.values(projectList[projectIndex])[0];
        const editedProject = {[newTitle] : currentTasks};
        projectList[projectIndex] = editedProject;
    }

    function remove(projectIndex) {
        if (projectIndex >= projectList.length || 
            projectIndex < 0 ||
            !Number.isInteger(projectIndex)) {
                console.log("Invalid value!");
                return;
        }

        projectList.splice(projectIndex, 1);

        if (selectedProject > projectIndex ||
            selectedProject === projectIndex && 
            selectedProject > projectList.length-1) {
            selectedProject -= 1;
        }

        if (!projectList.length) {
            projectList.push({ "Default Project": [] }); // To always make sure there's the default project.
        }
    }

    function select(projectIndex) {
        if (projectIndex >= projectList.length || 
            projectIndex < 0 ||
            !Number.isInteger(projectIndex)) {
                console.log("Invalid value!");
                return;
        }

        selectedProject = projectIndex;
    }

    function populateStorage() {
        localStorage.setItem("projects", JSON.stringify(projectList));
    }

    function getStorage() {
        if (!localStorage.getItem("projects")) {
            populateStorage();
        } else {
            projectList = JSON.parse(localStorage.getItem("projects"));
        }   
    }

    const getProjectList = () => projectList;
    const getSelectedProject = () => selectedProject;

    return { create, edit, remove, select, getSelectedProject, 
        getProjectList, populateStorage, getStorage };
}

const project = manageProject();

const manageTask = () => {
    const getTasksArray = () => {
        const currentProject = project.getProjectList()[project.getSelectedProject()];
        return Object.values(currentProject)[0];
    };
    
    function create(title, description, dueDate, priority, notes, ...checklist) {
        const tasksArray = getTasksArray();

        const formattedChecklist = checklist.map(item => {
            return {[item]: "not completed"};
        });

        const list = [
            { "Title:": title },
            { "Description:": description },
            { "Due Date:": dueDate },
            { "Priority:": priority },
            { "Notes:": notes },
            { "Checklist:": checklist },
            { "Completed:": false }
        ];

        tasksArray.push(list);
    }

    function edit(taskIndex, property, newValue) {
        const tasksArray = getTasksArray();

        if (taskIndex >= tasksArray.length || 
            taskIndex < 0 ||
            !Number.isInteger(taskIndex)) {
                console.log("Invalid value!");
                return;
        }

        let validProperties = [
            "title", "description", "dueDate",
            "priority", "notes"
        ] 

        if (validProperties.includes(property)) {
            tasksArray[taskIndex][0][property] = newValue;
        }
    }

    function remove(taskIndex) {
        const TasksArray = getTasksArray();

        if (taskIndex >= TasksArray.length || 
            taskIndex < 0 ||
            !Number.isInteger(taskIndex)) {
                console.log("Invalid value!");
                return;
        }

        TasksArray.splice(taskIndex, 1);
    }

    function editChecklist(taskIndex, checklistItemIndex, newItem) {
        const tasksArray = getTasksArray();
        
        if (taskIndex >= tasksArray.length || 
            taskIndex < 0 ||
            !Number.isInteger(taskIndex)) {
                console.log("Invalid value!");
                return;
        }

        const currentCompletion = Object.values(tasksArray[taskIndex]["checklist"][checklistItemIndex])[0];
        const editedChecklistItem = {[newItem] : currentCompletion};
        tasksArray[taskIndex]["checklist"][checklistItemIndex] = editedChecklistItem;
    }

    function markCompletion(taskIndex) {
        const tasksArray = getTasksArray();

        if (taskIndex >= tasksArray.length || 
            taskIndex < 0 ||
            !Number.isInteger(taskIndex)) {
                console.log("Invalid value!");
                return;
        }

        tasksArray[taskIndex]["completed"] = !tasksArray[taskIndex]["completed"];
    }

    return { remove, create, edit, editChecklist, markCompletion, getTasksArray };
}

const task = manageTask();

project.getStorage();
projectDisplay();
const taskDisplayInstance = taskDisplay();
taskDisplayInstance.updateTasks();

export { task, project, taskDisplayInstance };