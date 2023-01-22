import { closeModal } from './modal.js'

let tasksList = JSON.parse(localStorage.getItem('mg.tasksList')) || []
let subjectsList = JSON.parse(localStorage.getItem('mg.subjectsList')) || []
let defaultSortField = localStorage.getItem('mg.defaultSortField') || 'name'

/*
 FUNCTIONS
 */

const sortableColumns = document.querySelectorAll('[data-sortable]')
sortableColumns.forEach(column => {
	column.addEventListener('click', e => {
		sortableColumns.forEach(c => c.classList.remove('active'))
		const field = e.target.dataset.sortable
		const asc = !column.classList.contains('asc')
		sortTasksBy(field, asc)
		if (asc) {
			column.classList.add('asc')
			column.classList.remove('desc')
		} else {
			column.classList.add('desc')
			column.classList.remove('asc')
		}
		column.classList.toggle('active')
	})
	if (column.dataset.sortable === defaultSortField) {
		column.click()
	}
})

const addTaskForm = document.querySelector('#add-task-form')
addTaskForm.addEventListener('submit', e => {
	e.preventDefault()
	const data = new FormData(e.target)
	// create new task with form data
	const newTask = createNewTask(data)
	// add new task to tasks list
	tasksList.push(newTask)
	// reset form, close modal and save and render
	addTaskForm.reset()
	closeModal(addTaskForm.closest('.modal'))
	saveAndRender()
})

const addSubjectForm = document.querySelector('#add-subject-form')
addSubjectForm.addEventListener('submit', e => {
	e.preventDefault()
	const data = new FormData(e.target)
	const newSubject = createNewSubject(data)
	subjectsList.push(newSubject)
	addSubjectForm.reset()
	closeModal(addSubjectForm.closest('.modal'))
	saveAndRender()
})

function save() {
	localStorage.setItem('mg.tasksList', JSON.stringify(tasksList))
	localStorage.setItem('mg.subjectsList', JSON.stringify(subjectsList))
	localStorage.setItem('mg.defaultSortField', defaultSortField)
}

function render() {
	renderTasksList()
	renderSubjectsList()
}

function saveAndRender() {
	save()
	render()
}

function createNewTask(formData) {
	return {
		id: Date.now().toString(),
		name: formData.get('task-name'),
		description: formData.get('task-description'),
		subject: formData.get('task-subject'),
		dueDate: formData.get('task-due-date'),
		priority: formData.get('task-priority'),
		completedAt: null,
		creationDate: new Date().toISOString()
	}
}

function createNewSubject(formData) {
	return {
		id: Date.now().toString(),
		name: formData.get('subject-name')
	}
}

function renderTasksList() {
	const tasksListElement = document.querySelector('#tasks-list')
	const taskItemTemplate = document.querySelector('#task-item-template')

	while (tasksListElement.firstChild !== null) {
		tasksListElement.removeChild(tasksListElement.firstChild)
	}

	// set tasks count
	const tasksCountElement = document.querySelector('[data-task-count]')
	tasksCountElement.textContent = tasksList.length

	tasksList.forEach(task => {
		const taskTemplate = document.importNode(taskItemTemplate.content, true)
		taskTemplate.querySelector('[data-task-id]').id = task.id
		taskTemplate.querySelector('[data-task-id]').classList.toggle('completed', task.completedAt !== null)
		taskTemplate.querySelector('[data-task-name]').textContent = task.name
		taskTemplate.querySelector('[data-task-description]').textContent = task.description
		taskTemplate.querySelector('[data-task-subject]').textContent = getSubjectName(task.subject)
		taskTemplate.querySelector('[data-task-due-date]').textContent = task.dueDate
		taskTemplate.querySelector('[data-task-priority]').textContent = task.priority

		const terminateTaskButton = taskTemplate.querySelector('#terminate-task-button')
		terminateTaskButton.addEventListener('click', e => {
			const id = e.target.closest('[data-task-id]').id
			tasksList = tasksList.map(task => {
				if (task.id === id) {
					task.completedAt = new Date().toISOString()
					const taskElement = document.getElementById(task.id)
					taskElement.classList.add('completed')
				}
				return task
			})
			saveAndRender()
		})

		const deleteTaskButton = taskTemplate.querySelector('#delete-task-button')
		deleteTaskButton.addEventListener('click', e => {
			const id = e.target.closest('[data-task-id]').id
			tasksList = tasksList.filter(task => task.id !== id)
			saveAndRender()
		})

		if (task.completedAt !== null) {
			const actionsElement = taskTemplate.querySelector('[data-task-actions]')
			actionsElement.firstElementChild.remove()
			const completedAtElement = document.createElement('span')
			completedAtElement.textContent = `Completed at ${new Date(task.completedAt).toLocaleString()}`
			actionsElement.insertBefore(completedAtElement, actionsElement.firstChild)
			actionsElement.style.color = 'rgb(30, 234, 0)'
		}
		tasksListElement.appendChild(taskTemplate)
	})
}

function renderSubjectsList() {
	const subjectsListElement = document.querySelector('#task-subject')

	// remove all options except the first one
	while (subjectsListElement.lastElementChild !== subjectsListElement.firstElementChild) {
		subjectsListElement.removeChild(subjectsListElement.lastChild)
	}

	subjectsList.forEach(subject => {
		const subjectElement = document.createElement('option')
		subjectElement.value = subject.id
		subjectElement.textContent = subject.name
		subjectsListElement.appendChild(subjectElement)
	})
}

function getSubjectName(subject) {
	return subjectsList.find(s => s.id === subject)?.name || 'Aucune'
}

function sortTasksBy(field, asc = true) {
	defaultSortField = field
	tasksList.sort((a, b) => {
		if (asc) {
			return a[field] > b[field] ? 1 : -1
		} else {
			return a[field] < b[field] ? 1 : -1
		}
	})
	saveAndRender()
}
