import { IMember } from './utility/member.js'

let unassignedMember: IMember[] = []

let assignedMember: IMember[] = []

const modal = document.getElementById('modal')
const addBtn = document.getElementById('add-member')
const form = document.getElementById('form')

function showModel() {
  addBtn?.addEventListener('click', () => {
    modal?.classList.remove('is-hidden')
    close()
    onShowModel()
  })
}

function onShowModel() {
  form?.addEventListener('submit', () => {})
}

function createExperInputs() {
  const experiences = document.getElementsByClassName('experiences')[0]

  const roleDiv = document.createElement('div')
  const roleLabel = document.createElement('label')
  const roleInput = document.createElement('input')

  roleDiv.appendChild(roleLabel)
  roleDiv.appendChild(roleInput)
}

/// khas ndir Promise bach n7ayd callback hell
function close() {
  const closeBtn = document.getElementById('close-modal')
  closeBtn?.addEventListener('click', () => {
    console.log('click')

    modal?.classList.add('is-hidden')
    addBtn?.removeEventListener('click', () => {
      console.log('listen has end')
    })
  })
}

showModel()
