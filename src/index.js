import './reset.css';
import './styles.css';
import { projectDisplay } from './project-display.js';
import { taskDisplay } from './task-display.js';

const manageProject = () => {
  let projectList = [
    {
      'Default Project': [],
      latestDueDate: null,
      id: 0,
    },
  ];

  let selectedProject = 0;

  function create(title) {
    const project = {
      [title]: [],
      latestDueDate: null,
      id: projectList.length,
    };

    projectList.push(project);
    sortProjectsByLatestDueDate();
  }

  function edit(projectIndex, newTitle) {
    const currentTasks = Object.values(projectList[projectIndex])[0];
    const editedProject = { [newTitle]: currentTasks };
    projectList[projectIndex] = editedProject;

    sortProjectsByLatestDueDate();
  }

  function remove(projectIndex) {
    projectList.splice(projectIndex, 1);

    if (selectedProject >= projectList.length) {
      selectedProject = projectList.length - 1;
    }

    if (!projectList.length) {
      // To always make sure there's the default project.
      projectList.push({
        'Default Project': [],
        latestDueDate: null,
        id: 0,
      });
      selectedProject = 0;
    }

    sortProjectsByLatestDueDate();
  }

  function select(projectIndex) {
    selectedProject = projectIndex;
  }

  function updateLatestDueDate(projectIndex) {
    const tasks = Object.values(projectList[projectIndex])[0];
    let latestDate = null;

    tasks.forEach(task => {
      if (task[2]['Due Date:']) {
        const dueDate = task[2]['Due Date:'];
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
      }
      if (dateA === null) {
        return -1;
      }
      if (dateB === null) {
        return 1;
      }

      return new Date(dateB) - new Date(dateA);
    });

    const newSelectedIndex = projectList.findIndex(
      project => project.id === previousSelectedId,
    );
    select(newSelectedIndex);
  }

  function populateStorage() {
    localStorage.setItem('projects', JSON.stringify(projectList));
  }

  function getStorage() {
    if (!localStorage.getItem('projects')) {
      populateStorage();
    } else {
      projectList = JSON.parse(localStorage.getItem('projects'));
    }
  }

  const getProjectList = () => projectList;
  const getSelectedProject = () => selectedProject;

  return {
    create,
    edit,
    remove,
    select,
    getSelectedProject,
    getProjectList,
    populateStorage,
    getStorage,
    updateLatestDueDate,
    sortProjectsByLatestDueDate,
  };
};

const project = manageProject();

const manageTask = () => {
  const getTasksArray = () => {
    const currentProject =
      project.getProjectList()[project.getSelectedProject()];
    return Object.values(currentProject)[0];
  };

  function create(title, description, dueDate, priority, notes, ...checklist) {
    const tasksArray = getTasksArray();

    const formattedChecklist = checklist.map(item => ({
      [item]: 'not completed',
    }));

    const date = dueDate ? new Date(`${dueDate}T00:00:00`) : null;

    const list = [
      { 'Title:': title },
      { 'Description:': description },
      { 'Due Date:': date },
      { 'Priority:': priority },
      { 'Notes:': notes },
      { 'Checklist:': checklist },
      { 'Completed:': false },
    ];

    tasksArray.push(list);
    sortTasksByDueDate();
    project.updateLatestDueDate(project.getSelectedProject());
    project.sortProjectsByLatestDueDate();
  }

  function edit(taskIndex, property, newValue) {
    const tasksArray = getTasksArray();

    const validProperties = [
      'title',
      'description',
      'dueDate',
      'priority',
      'notes',
    ];

    if (validProperties.includes(property)) {
      tasksArray[taskIndex][0][property] = newValue;
    }

    sortTasksByDueDate();
    project.updateLatestDueDate(project.getSelectedProject());
    project.sortProjectsByLatestDueDate();
  }

  function remove(taskIndex) {
    const tasksArray = getTasksArray();

    tasksArray.splice(taskIndex, 1);
    sortTasksByDueDate();
    project.updateLatestDueDate(project.getSelectedProject());
    project.sortProjectsByLatestDueDate();
  }

  function editChecklist(taskIndex, checklistItemIndex, newItem) {
    const tasksArray = getTasksArray();

    const currentCompletion = Object.values(
      tasksArray[taskIndex].checklist[checklistItemIndex],
    )[0];
    const editedChecklistItem = { [newItem]: currentCompletion };
    tasksArray[taskIndex].checklist[checklistItemIndex] = editedChecklistItem;
  }

  function markCompletion(taskIndex) {
    const tasksArray = getTasksArray();

    tasksArray[taskIndex].completed = !tasksArray[taskIndex].completed;
  }

  function sortTasksByDueDate() {
    const tasksArray = getTasksArray();

    tasksArray.sort((a, b) => {
      const dateA = a[2]['Due Date:'];
      const dateB = b[2]['Due Date:'];

      if (dateA && dateB) {
        return dateA - dateB;
      }

      if (dateA) {
        return -1;
      }

      if (dateB) {
        return 1;
      }

      return 0;
    });
  }

  return {
    remove,
    create,
    edit,
    editChecklist,
    markCompletion,
    getTasksArray,
    sortTasksByDueDate,
  };
};

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
