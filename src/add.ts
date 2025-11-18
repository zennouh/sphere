import { IExperience, IMember } from './utility/member.js'
import { toRoleEnumValue } from "./utility/helpers.js";


let id = 0;

let expId = 0;

let unassignedMember: IMember[] = []

// 

let assignedMember: IMember[] = []

const modal = document.getElementById('modal')
const addBtn = document.getElementById('add-member')
const form = document.getElementById('form')
const imgPrev = document.getElementById("preview") as HTMLImageElement;

function previewImage() {
  const image = document.getElementById("image") as HTMLInputElement;
  image.addEventListener("change", () => {
    imgPrev.src = image.value
  })
}


function showModel() {
  addBtn?.addEventListener('click', () => {
    modal?.classList.remove('is-hidden')
    previewImage()
    // close()
    onShowModel()
  })
}

function extractExper(): IExperience[] {
  let experiences: IExperience[] = [];
  const allExps = document.querySelectorAll<HTMLElement>(".experience")
  allExps.forEach((e) => {
    const id = e.id;
    const company = (e.querySelector("#company") as HTMLInputElement).value
    const role = (e.querySelector("#role") as HTMLInputElement).value
    const from = new Date((e.querySelector("#startDate") as HTMLInputElement).value)
    const end: string | null = (e.querySelector("#endDate") as HTMLInputElement).value
    const to = end ? new Date(end) : null
    const exp: IExperience = { id, company, role, from, to }
    experiences.push(exp)
  })


  return experiences;
}

function onShowModel() {
  const experBtn = document.querySelector(".btn-add-exp");
  experBtn?.addEventListener("click", (e) => {
    const exp = experienceGene(id++)
    const allExp = document.querySelector(".experiences")
    allExp?.insertBefore(exp, experBtn);
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const select = document.getElementById("role") as HTMLSelectElement | null

    const roleValue = toRoleEnumValue(select?.value || "")!
    const nameValue = (document.getElementById("name")! as HTMLInputElement)
    const emailValue = (document.getElementById("email") as HTMLInputElement)
    const phoneValue = (document.getElementById("phone") as HTMLInputElement)
    const imageValue = (document.getElementById("image") as HTMLInputElement)
    const htmlinputsElems: { [i: string]: HTMLInputElement } = { namei: nameValue, email: emailValue, phone: phoneValue, image: imageValue }
    const experiences = extractExper();

    const member: IMember = { id: id++, name: nameValue.value, role: roleValue, image: imageValue.value, email: emailValue.value, phone: phoneValue.value, experience: experiences };


    let result = validateHtmlInputs(htmlinputsElems)
    if (result) {

      unassignedMember.push(member);
      renderSideBar(member);
      imgPrev.src = "./assets/avatars/favatar.webp";
      (form as HTMLFormElement).reset()

    }

  })
}

function experienceGene(id: number): HTMLElement {
  const experience = document.createElement("div")
  experience.className = "experience"
  experience.id = `${id}`
  experience.innerHTML += `
               <div class='exp-head'>
                 <p>Experience ${id + 1}</p>
                 <button>delete</button>
               </div>
                <div class="form__group">
                  <label class="form__label" for="company">Company</label>
                  <input
                    type="text"
                    id="company"
                    class="input"
                    placeholder="Enter Company name"
                  />
                </div>
                <div class="form__group">
                  <label class="form__label" for="role">Role</label>
                  <input
                    type="text"
                    id="role"
                    class="input"
                    placeholder="Enter your role"
                  />
                </div>
                <div class="form__group">
                  <label class="form__label" for="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    class="input"
                    placeholder="Enter Company name"
                  />
                </div>
                <div class="form__group">
                  <label class="form__label" for="startDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    class="input"
                    placeholder="Enter Company name"
                  />
                </div>
               
          
  `;

  // experiences.push({company: "", role: "", from: new Date(), to: new Date()})
  return experience;
}


function renderSideBar(member: IMember) {
  const memberList = document.getElementById("member-list")
  const memberDiv = document.createElement("div")
  memberDiv.className = "member"
  memberDiv.draggable = true;
  memberDiv.id = `${member.id}`;
  memberDiv.dataset.type = member.role;

  const infoDiv = document.createElement("div")
  infoDiv.className = "info"
  infoDiv.innerHTML += `<img src="${member.image}" alt="avatar" />
            <div class="person-info">
              <div class="name">${member.name}</div>
              <div class="post">${member.role.toUpperCase()}</div>
            </div>`

  const editBtn = document.createElement("div")
  editBtn.className = "edit-btn"
  editBtn.textContent = "Edit"

  memberDiv.appendChild(infoDiv)
  memberDiv.appendChild(editBtn)
  memberList?.appendChild(memberDiv)
}


function validateHtmlInputs(inputs: { [i: string]: HTMLInputElement }): boolean {

  let isValid = true;
  removeErrorMsg()

  if (inputs.namei.value == "") {
    addErrorMessage(inputs.namei, "Please enter a valid name", "name")
    isValid = false;
  }
  if (inputs.email.value == "") {
    isValid = false;
    addErrorMessage(inputs.email, "Please enter a valid email", "email")
  }
  if (inputs.image.value == "") {
    isValid = false;
    addErrorMessage(inputs.image, "Please enter a valid image", "image")
  }
  if (inputs.phone.value == "") {
    isValid = false;
    addErrorMessage(inputs.phone, "Please enter a valid phone", "phone")
  }

  return isValid
}

function addErrorMessage(ele: HTMLElement, stringError: string, type: string) {
  const div = document.createElement("div")
  div.innerHTML = stringError
  div.className = type
  div.classList.add("error-msg")
  const parent = ele.parentElement!;
  parent.appendChild(div)
}

function removeErrorMsg() {
  document.querySelectorAll(`.form__group .error-msg`)?.forEach((e) => e.remove());
}

/// khas ndir Promise bach n7ayd callback hell
function close() {
  const closeBtn = document.getElementById('close-modal')
  closeBtn?.addEventListener('click', () => {
    (form as HTMLFormElement).reset()
    console.log('click')

    modal?.classList.add('is-hidden')
    addBtn?.removeEventListener('click', () => {
      console.log('listen has end')
    })
  })
}

showModel()

