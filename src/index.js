import "./reset.css";
import "./styles.css";

const projectList = [{ "Default": [] }];
let activeProject = 0;

const toDo = () => {
    const i = activeProject;
    const project = projectList[i];
    
    function create(title, description, dueDate, priority, notes) {
        const list = {title, description, dueDate, priority, notes};
        for (const key in project) {
            project[key].push(list);
        }
    }

    function remove(index) {
        for (const key in project) {
            if (index > project[key].length || 
                index < 0 ||
                !Number.isInteger(index)) {
                    console.log("Invalid value!");
                    return;
            }
            project[key].splice(index, 1);
        }
    }

    return { remove, create };
}

function createProject(title) {
    const project = { [title]: [] };
    projectList.push(project);
}