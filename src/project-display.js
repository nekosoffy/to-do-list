import { format } from 'date-fns';
import { project, taskDisp } from './index.js';

// Helper functions
const select = target => document.querySelector(target);
const selectAll = target => document.querySelectorAll(target);
const selectId = target => document.getElementById(target);

function create(name, parent, id, htmlClass, text) {
  const element = document.createElement(name);

  if (id !== undefined && id !== '') {
    element.id = id;
  }

  if (htmlClass !== undefined && htmlClass !== '') {
    element.classList.add(htmlClass);
  }

  if (text !== undefined && text !== '') {
    element.textContent = text;
  }

  parent.appendChild(element);

  return element;
}
//

let allowInteraction = true;
const changeInteraction = () => (allowInteraction = !allowInteraction);

const projectDisplay = () => {
  const newProjectBtn = selectId('new-project');
  const projectForm = select('.project-form');
  const formInput = select('.project-form input');
  const label = select('[for=project-title]');
  const projectTitle = selectId('project-title');
  const cancelBtn = select('.project-form .cancel-btn');
  const projectsContainer = selectId('projects-container');

  let editMode = false;
  let currentIndex = null;

  function updateProjects() {
    projectsContainer.replaceChildren();
    projectsContainer.appendChild(projectForm);
    project.getProjectList().forEach((project, index) => {
      const tasks = Object.values(project)[0];
      let notCompleted = 0;

      tasks.forEach(task => {
        if (!task['Completed:']) notCompleted++;
      });

      const wrapper = document.createElement('section');
      const buttonWrapper = document.createElement('div');
      const textWrapper = document.createElement('ul');

      wrapper.classList.add('project-wrapper');
      wrapper.setAttribute('data-index', index);
      wrapper.addEventListener('click', handleClick);
      wrapper.addEventListener('mouseenter', showButtons);
      wrapper.addEventListener('mouseleave', hideButtons);

      buttonWrapper.classList.add('button-wrapper');

      const title = create('li', textWrapper);
      create('h2', title, '', 'project-title', `${Object.keys(project)[0]}`);

      if (notCompleted > 0) {
        const counter = create('li', textWrapper);
        create('span', counter, '', 'task-counter', notCompleted);

        if (notCompleted < 2) {
          create('span', counter, '', '', ' incomplete task');
        } else {
          create('span', counter, '', '', ' incomplete tasks');
        }
      }

      if (Object.values(project)[1]) {
        const dueDate = create('li', textWrapper);
        create('span', dueDate, '', '', `Earliest due date: `);
        create(
          'span',
          dueDate,
          '',
          'duedate-text',
          `${format(Object.values(project)[1], 'yyyy/MM/dd')}`,
        );
      }

      const editBtn = create('button', buttonWrapper, '', 'edit-btn', 'Edit');
      editBtn.classList.add('hidden');

      if (
        index !== 0 ||
        Object.values(project)[0].length ||
        Object.keys(project)[0] !== 'Default Project'
      ) {
        const deleteBtn = create(
          'button',
          buttonWrapper,
          '',
          'delete-btn',
          'Delete',
        ); // Check if project is not the default one before adding a delete button.
        deleteBtn.classList.add('hidden');
      }

      wrapper.appendChild(textWrapper);
      wrapper.appendChild(buttonWrapper);
      projectForm.after(wrapper);
    });

    const firstProject = select('[data-index="0"]');
    const secondProject = select('[data-index="1"]');
    const deleteBtn = select('.delete-btn');

    if (
      projectsContainer.contains(secondProject) &&
      !firstProject.querySelector('.delete-btn')
    ) {
      // Allows deleting default project after there is at least another one.
      const buttonWrapper = firstProject.querySelector('.button-wrapper');

      if (buttonWrapper) {
        // Ensure buttonWrapper exists before removing
        const newButtonWrapper = document.createElement('div');
        newButtonWrapper.classList.add('button-wrapper');

        firstProject.removeChild(buttonWrapper);
        create(
          'button',
          newButtonWrapper,
          '',
          'edit-btn',
          'Edit',
        ).classList.add('hidden');
        create(
          'button',
          newButtonWrapper,
          '',
          'delete-btn',
          'Delete',
        ).classList.add('hidden');

        firstProject.appendChild(newButtonWrapper);
      }
    }

    project.populateStorage();
  }

  function hideButtons(event) {
    const { target } = event;
    const currentWrapper = target.closest('[data-index]');
    const buttons = currentWrapper.querySelectorAll('button');
    buttons.forEach(el => el.classList.add('hidden'));
    currentWrapper.classList.remove('hovered');
  }

  function showButtons(event) {
    if (allowInteraction) {
      const { target } = event;
      const currentWrapper = target.closest('[data-index]');
      const buttons = currentWrapper.querySelectorAll('button');
      buttons.forEach(el => el.classList.remove('hidden'));
      currentWrapper.classList.add('hovered');
    }
  }

  function showForm() {
    if (allowInteraction) {
      projectsContainer.scrollTo(0, 0);
      newProjectBtn.classList.add('hidden');
      projectForm.classList.remove('removed');
      formInput.focus();
      allowInteraction = false;
    }
  }

  function hideForm() {
    newProjectBtn.classList.remove('hidden');
    projectForm.reset();
    projectForm.classList.add('removed');
    label.textContent = 'Name your project:';
    editMode = false;
    currentIndex = null;
    allowInteraction = true;
    updateProjects();
    highlightProject();
  }

  function handleSubmit(event) {
    if (editMode === false) {
      event.preventDefault();
      project.create(projectTitle.value);
      hideForm();
      projectForm.classList.add('removed');
      updateProjects();
      highlightProject();
    } else {
      event.preventDefault();
      const formsSelector = document.querySelectorAll('#project-title');
      project.edit(currentIndex, formsSelector[1].value);
      hideForm();
      updateProjects();
      highlightProject();
    }
  }

  function handleClick(event) {
    const { target } = event;
    currentIndex = parseInt(target.closest('[data-index]').dataset.index);
    if (target.classList.contains('edit-btn') && allowInteraction) {
      allowInteraction = false;
      const editForm = projectForm.cloneNode(true);
      projectsContainer.appendChild(editForm);
      editForm.addEventListener('submit', handleSubmit);
      const newLabel = selectAll('[for=project-title]');
      const formsSelector = selectAll('#project-title');
      newLabel.forEach(el => (el.textContent = 'New title:'));
      const currentTitle = Object.keys(
        project.getProjectList()[currentIndex],
      )[0];
      const currentProject = target.closest('.project-wrapper');
      formsSelector.forEach(el => (el.value = currentTitle)); // Set the input's content to default to the current title when editing.
      editForm.classList.remove('removed');
      currentProject.replaceWith(editForm);

      const newCancelBtn = selectAll('.project-form .cancel-btn');
      newCancelBtn[1].addEventListener('click', hideForm);

      editMode = true;
    } else if (target.classList.contains('delete-btn') && allowInteraction) {
      const wrapper = target.closest('.project-wrapper');
      fadeOut(wrapper);
      project.remove(currentIndex);
      updateProjects();
      taskDisp.updateTasks();
      highlightProject();
      showProjectTitle(project.getSelectedProject());
    } else if (allowInteraction) {
      project.select(currentIndex);
      highlightProject();
      taskDisp.updateTasks();
      showProjectTitle(currentIndex);
    }
  }

  function showProjectTitle(index) {
    const h3 = select('h3');
    h3.textContent = Object.keys(project.getProjectList()[index])[0];
  }

  function highlightProject() {
    if (allowInteraction) {
      let wrappers = projectsContainer.querySelectorAll('.project-wrapper');
      wrappers = [...wrappers];
      wrappers = wrappers.reverse();
      wrappers.forEach(el => el.removeAttribute('id'));
      const index = project.getSelectedProject();
      wrappers[index].id = 'selected-project';
    }
  }

  function fadeOut(target) {
    let opacity = 1;
    const interval = setInterval(() => {
      if (opacity > 0) {
        opacity -= 0.1;
        target.style.opacity = opacity;
      } else {
        clearInterval(interval);
      }
    }, 1100);
  }

  newProjectBtn.addEventListener('click', showForm);
  projectForm.addEventListener('submit', handleSubmit);
  cancelBtn.addEventListener('click', hideForm);

  return {
    showProjectTitle,
    updateProjects,
    allowInteraction,
    highlightProject,
    updateProjects,
  };
};

export {
  projectDisplay,
  select,
  selectId,
  create,
  allowInteraction,
  changeInteraction,
};
