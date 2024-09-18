import "./reset.css";
import "./styles.css";

const projectList = [{ default: [] }];
let activeProject = 0;

function createToDoList(title, description, dueDate, priority, notes) {
    const list = { title, description, dueDate, priority, notes };
    const i = activeProject;
    const project = projectList[i];
    
    for (const key in project) {
        project[key].push(list);
    }
}