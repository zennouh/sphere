import { IExperience, IMember } from './utility/member.js';
import { toRoleEnumValue } from "./utility/helpers.js";


const unassignedMemberKey = "unassignedMemberKey"

let memberId = 0;
let experienceId = 0;

let unassignedMember: IMember[] = [];
let assignedMember: IMember[] = [];

const modal = document.getElementById('modal')!;
const addBtn = document.getElementById('add-member')!;
const form = document.getElementById('form') as HTMLFormElement;
const imgPrev = document.getElementById("preview") as HTMLImageElement;


function saveInlocalStorage() {
  localStorage.setItem(unassignedMemberKey, JSON.stringify(unassignedMember))
}


function getFromLocalStrorage() {
  unassignedMember = JSON.parse(localStorage.getItem(unassignedMemberKey) || "[]") || [];
  unassignedMember.forEach((e) => renderSideBar(e))
}

function previewImage() {
  const imageInput = document.getElementById("image") as HTMLInputElement;

  imageInput.addEventListener("change", () => {

    imgPrev.src = imageInput.value

  });
}

function initModal() {
  addBtn.addEventListener("click", () => {
    modal.classList.remove("is-hidden");
    removeErrorMsg();
    previewImage();
  });

  const closeBtn = document.getElementById("close-modal")!;
  closeBtn.addEventListener("click", closeModal);
}

function closeModal() {
  form.reset();
  removeExpDom()
  imgPrev.src = "./assets/avatars/favatar.webp";
  modal.classList.add("is-hidden");
}

function removeExpDom() {
  document.querySelectorAll(".experiences .experience")!.forEach((e) => e.outerHTML = "");

}

function extractExper(): IExperience[] | null {
  const allExpItems = document.querySelectorAll<HTMLElement>(".experience");
  if (allExpItems.length === 0) return [];

  const experiences: IExperience[] = [];

  allExpItems.forEach((e) => {
    const id = e.id;

    const company = e.querySelector(`#company-${id}`) as HTMLInputElement;
    const role = e.querySelector(`#role-${id}`) as HTMLInputElement;
    const from = new Date((e.querySelector(`#startDate-${id}`) as HTMLInputElement).value);
    const endVal = (e.querySelector(`#endDate-${id}`) as HTMLInputElement).value;
    const to = endVal ? new Date(endVal) : null;

    const inputs = { company, role, from: company, to: company };

    if (validateExperHtmlInputs(inputs)) {
      experiences.push({ id, company: company.value, role: role.value, from, to });
    }
  });

  return experiences.length === 0 ? null : experiences;
}

function experienceGene(id: number): HTMLElement {
  const container = document.createElement("div");
  container.className = "experience";
  container.id = `${id}`;

  const head = document.createElement("div");
  head.className = "exp-head";

  const title = document.createElement("p");
  title.textContent = `Experience`;

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.addEventListener("click", () => container.remove());

  head.appendChild(title);
  head.appendChild(delBtn);

  const createField = (label: string, id: string, type: string) => {
    const group = document.createElement("div");
    group.className = "form__group";

    group.innerHTML = `
      <label class="form__label" for="${id}">${label}</label>
      <input id="${id}" class="input" type="${type}" />
    `;

    return group;
  };

  container.appendChild(head);
  container.appendChild(createField("Company", `company-${id}`, "text"));
  container.appendChild(createField("Role", `role-${id}`, "text"));
  container.appendChild(createField("Start Date", `startDate-${id}`, "date"));
  container.appendChild(createField("End Date", `endDate-${id}`, "date"));

  return container;
}

function initForm() {
  const expBtn = document.querySelector(".btn-add-exp");

  expBtn?.addEventListener("click", () => {
    const exp = experienceGene(experienceId++);
    const container = document.querySelector(".experiences")!;
    container.insertBefore(exp, expBtn);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    removeErrorMsg();

    const nameInput = document.getElementById("name") as HTMLInputElement;
    const emailInput = document.getElementById("email") as HTMLInputElement;
    const phoneInput = document.getElementById("phone") as HTMLInputElement;
    const imageInput = document.getElementById("image") as HTMLInputElement;
    const roleSelect = document.getElementById("role") as HTMLSelectElement;

    const fields = {
      name: nameInput,
      email: emailInput,
      phone: phoneInput,
      image: imageInput
    };

    const valid = validateHtmlInputs(fields);
    const experiences = extractExper();

    if (valid && experiences !== null) {
      const member: IMember = {
        id: memberId++,
        name: nameInput.value,
        role: toRoleEnumValue(roleSelect.value)!,
        email: emailInput.value,
        phone: phoneInput.value,
        image: imageInput.value,
        experience: experiences
      };

      console.log(member);

      unassignedMember.push(member);
      saveInlocalStorage();
      renderSideBar(member);
      closeModal();
    }
  });
}

function renderSideBar(member: IMember) {
  const container = document.getElementById("member-list")!;
  const div = document.createElement("div");

  div.className = "member";
  div.draggable = true;
  div.id = `${member.id}`;
  div.dataset.type = member.role;

  div.innerHTML = `
    <div class="info">
      <img src="${member.image}" alt="avatar" />
      <div class="person-info">
        <div class="name">${member.name}</div>
        <div class="post">${member.role.toUpperCase()}</div>
      </div>
    </div>
    <div class="edit-btn">Edit</div>
  `;
  div.querySelector(".edit-btn")!.addEventListener("click", () => {
    openDetailModal(member);
  });
  container.appendChild(div);
}

function validateHtmlInputs(inputs: { [k: string]: HTMLInputElement }) {
  let ok = true;

  Object.entries(inputs).forEach(([key, input]) => {
    if (input.value.trim() === "") {
      addErrorMessage(input, `Please enter a valid ${key}`, key);
      ok = false;
    }
  });

  return ok;
}

function validateExperHtmlInputs(inputs: { [k: string]: HTMLInputElement }) {
  let ok = true;

  if (!inputs.company.value.trim()) {
    addErrorMessage(inputs.company, "Please enter a valid company", "company");
    ok = false;
  }
  if (!inputs.role.value.trim()) {
    addErrorMessage(inputs.role, "Please enter a valid role", "role");
    ok = false;
  }

  return ok;
}

function addErrorMessage(el: HTMLElement, msg: string, cls: string) {
  removeSpecificError(el.parentElement!);

  const d = document.createElement("div");
  d.className = `error-msg ${cls}`;
  d.textContent = msg;

  el.parentElement!.appendChild(d);
}

function removeSpecificError(parent: HTMLElement) {
  parent.querySelector(".error-msg")?.remove();
}

function removeErrorMsg() {
  document.querySelectorAll(".error-msg").forEach((e) => e.remove());
}
getFromLocalStrorage()
initModal();
initForm();

////////////////////////////////////////////////////////

function openDetailModal(member: IMember) {
  const modal = document.getElementById("detail-modal")!;
  modal.classList.remove("is-hidden");

 
  console.log(member);
  
  // Fill the modal fields
  (document.getElementById("detail-img") as HTMLImageElement).src = member.image;
  (document.getElementById("detail-name") as HTMLElement).textContent = member.name;
  (document.getElementById("detail-role") as HTMLElement).textContent = member.role.toUpperCase();
  (document.getElementById("detail-email") as HTMLElement).textContent = member.email;
  (document.getElementById("detail-phone") as HTMLElement).textContent = member.phone;

  // Experience rendering
  const expList = document.getElementById("detail-experience-list")!;
  expList.innerHTML = "";

  if (member.experience.length === 0) {
    expList.innerHTML = "<p>No experience recorded.</p>";
  } else {
    member.experience.forEach(exp => {
      const div = document.createElement("div");
      div.className = "detail-exp";

      div.innerHTML = `
        <p><strong>Company:</strong> ${exp.company}</p>
        <p><strong>Role:</strong> ${exp.role}</p>
        <p><strong>From:</strong> ${new Date(exp.from).toLocaleDateString()}</p>
        <p><strong>To:</strong> ${exp.to ? new Date(exp.to).toLocaleDateString() : "Present"}</p>
        <hr />
      `;

      expList.appendChild(div);
    });
  }
}

function initDetailModal() {
  const modal = document.getElementById("detail-modal")!;
  const closeBtn = document.getElementById("detail-close-btn")!;

  closeBtn.addEventListener("click", () => {
    modal.classList.add("is-hidden");
  });

  modal.querySelector(".modal__overlay")!.addEventListener("click", () => {
    modal.classList.add("is-hidden");
  });
}
initDetailModal();

