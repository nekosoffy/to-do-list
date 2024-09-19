import "./reset.css";
import "./styles.css";

const projectList = [{ "Default": [] }];
let activeProject = 0;

const manageToDo = () => {
    const project = projectList[activeProject];
    
    function create(title, description, dueDate, priority, notes) {
        const list = {title, description, dueDate, priority, notes};
        for (const toDosArray in project) {
            project[toDosArray].push(list);
        }
    }

    function edit(toDoIndex, property, newValue) {
        for (const toDosArray in project) {
            if (toDoIndex > project[toDosArray].length || 
                toDoIndex < 0 ||
                !Number.isInteger(toDoIndex)) {
                    console.log("Invalid value!");
                    return;
            }
            project[toDosArray][toDoIndex][property] = newValue;
        }
    }

    function remove(toDoIndex) {
        for (const toDosArray in project) {
            if (toDoIndex > project[toDosArray].length || 
                toDoIndex < 0 ||
                !Number.isInteger(toDoIndex)) {
                    console.log("Invalid value!");
                    return;
            }
            project[toDosArray].splice(toDoIndex, 1);
        }
    }

    return { remove, create, edit };
}

const manageProject = () => {
    function create(title) {
        const project = { [title]: [] };
        projectList.push(project);
    }

    function remove(projectIndex) {
        if (projectIndex > projectList.length || 
            projectIndex < 0 ||
            !Number.isInteger(projectIndex)) {
                console.log("Invalid value!");
                return;
        }
        projectList.splice(projectIndex, 1);
    }

    return { create, remove };
}