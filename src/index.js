import "./reset.css";
import "./styles.css";

const manageProject = () => {
    const projectList = [{ "Default": [] }];
    let selectedProject = 0;

    function create(title) {
        const project = { [title]: [] };
        projectList.push(project);
    }

    function remove(projectIndex) {
        if (projectIndex > projectList.length-1 || 
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
    }

    function select(projectIndex) {
        if (projectIndex > projectList.length-1 || 
            projectIndex < 0 ||
            !Number.isInteger(projectIndex)) {
                console.log("Invalid value!");
                return;
        }

        selectedProject = projectIndex;
    }

    const getProjectList = () => projectList;
    const getSelectedProject = () => selectedProject;

    return { create, remove, select, 
        getSelectedProject, getProjectList };
}

const project = manageProject();

const manageToDo = () => {
    
    function create(title, description, dueDate, priority, notes, ...checklist) {
        const currentProject = project.getProjectList()[project.getSelectedProject()];

        const formattedChecklist = checklist.map(item => {
            return {[item]: "not completed"};
        });

        const list = { 
            title, 
            description, 
            dueDate, 
            priority, 
            notes, 
            checklist: [formattedChecklist],
            completed: false
        }

        for (const toDosArray in currentProject) {
            currentProject[toDosArray].push(list);
        }
    }

    function edit(toDoIndex, property, newValue) {
        const currentProject = project.getProjectList()[project.getSelectedProject()];

        for (const toDosArray in currentProject) {
            if (toDoIndex > currentProject[toDosArray].length-1 || 
                toDoIndex < 0 ||
                !Number.isInteger(toDoIndex)) {
                    console.log("Invalid value!");
                    return;
            }

            currentProject[toDosArray][toDoIndex][property] = newValue;
        }
    }

    function remove(toDoIndex) {
        const currentProject = project.getProjectList()[project.getSelectedProject()];

        for (const toDosArray in currentProject) {
            if (toDoIndex > currentProject[toDosArray].length-1 || 
                toDoIndex < 0 ||
                !Number.isInteger(toDoIndex)) {
                    console.log("Invalid value!");
                    return;
            }

            currentProject[toDosArray].splice(toDoIndex, 1);
        }
    }

    return { remove, create, edit };
}

const task = manageToDo();