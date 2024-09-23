import "./reset.css";
import "./styles.css";
import { projectDisplay } from "./project-display.js";
import { taskDisplay } from "./task-display.js";

const manageProject = () => {
    let projectList = [ 
        { 
            "Default Project": [],
            latestDueDate: null,
            id: 1
        }
    ];

    let selectedProject = 0;

    function create(title) {
        const project = { 
            [title]: [],
            latestDueDate: null,
            id: projectList.length
        };


        projectList.push(project);

        console.log(projectList);

        sortProjectsByLatestDueDate();

        console.log(projectList);
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

        sortProjectsByLatestDueDate();
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
            selectedProject >= projectList.length) {
            selectedProject -= 1;
        }

        if (!projectList.length) { // To always make sure there's the default project.
            projectList.push( 
                { 
                    "Default Project": [],
                    latestDueDate: null,
                    id: 1
                }
            ); 
            selectedProject = 0;
        }

        sortProjectsByLatestDueDate();
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

    function updateLatestDueDate(projectIndex) {
        const tasks = Object.values(projectList[projectIndex])[0];
        let latestDate = null;
    
        tasks.forEach(task => {
            if (task[2]["Due Date:"]) {
                const dueDate = task[2]["Due Date:"];
                if (!latestDate || dueDate < latestDate) {
                    latestDate = dueDate;
                }
            }
        });
    
        projectList[projectIndex].latestDueDate = latestDate;
    }

    function sortProjectsByLatestDueDate() {
        const previousSelectedId = projectList[selectedProject].id;
        
        projectList.sort((a, b) => {
            const dateA = a.latestDueDate;
            const dateB = b.latestDueDate;
    
            if (dateA === null && dateB === null) {
                return 0;
            } else if (dateA === null) {
                return -1;
            } else if (dateB === null) {
                return 1;
            }
    
            return new Date(dateB) - new Date(dateA);
            
        });

        const newSelectedIndex = projectList.findIndex(project => project.id === previousSelectedId);
        select(newSelectedIndex);
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

    return { create, edit, remove, select, getSelectedProject, getProjectList, 
    populateStorage, getStorage, updateLatestDueDate, sortProjectsByLatestDueDate };
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

        const date = dueDate ? new Date(dueDate + 'T00:00:00') : null;

        const list = [
            { "Title:": title },
            { "Description:": description },
            { "Due Date:": date },
            { "Priority:": priority },
            { "Notes:": notes },
            { "Checklist:": checklist },
            { "Completed:": false }
        ];

        console.log(project.getProjectList());

        tasksArray.push(list);
        sortTasksByDueDate();
        project.updateLatestDueDate(project.getSelectedProject());
        project.sortProjectsByLatestDueDate();

        console.log(project.getProjectList());
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

        sortTasksByDueDate();
        project.updateLatestDueDate(project.getSelectedProject());
        project.sortProjectsByLatestDueDate();
    }

    function remove(taskIndex) {
        const tasksArray = getTasksArray();

        if (taskIndex >= tasksArray.length || 
            taskIndex < 0 ||
            !Number.isInteger(taskIndex)) {
                console.log("Invalid value!");
                return;
        }

        tasksArray.splice(taskIndex, 1);
        sortTasksByDueDate();
        project.updateLatestDueDate(project.getSelectedProject());
        project.sortProjectsByLatestDueDate();
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

    function sortTasksByDueDate() {
        const tasksArray = getTasksArray();
        tasksArray.sort((a, b) => {
            const dueDateA = new Date(a[2]["Due Date:"]);
            const dueDateB = new Date(b[2]["Due Date:"]);
    
            if (isNaN(dueDateA) && isNaN(dueDateB)) {
                return 0;
            } else if (isNaN(dueDateA)) {
                return 1;
            } else if (isNaN(dueDateB)) {
                return -1;
            }
    
            return dueDateA - dueDateB;
        });
    }

    return { remove, create, edit, editChecklist, markCompletion, getTasksArray, sortTasksByDueDate };
}

const task = manageTask();

project.getStorage();
const projectDisp = projectDisplay();
const taskDisp = taskDisplay();
project.sortProjectsByLatestDueDate();
task.sortTasksByDueDate();
projectDisp.updateProjects();
projectDisp.showProjectTitle(0);
projectDisp.highlightProject();
taskDisp.updateTasks();

export { task, project, taskDisp, projectDisp };