import { IExperience, IMember, IAMember, inputFields } from './utility/mytypes.js';
import { checkRoomeAndRole, stringValidate, toRoleEnumValue, toRoomEnumValue } from "./utility/helpers.js";


const unassignedMemberKey = "unassignedMemberKey"
const assignedMemberKey = "assignedMemberKey"

let memberId = 0;
let experienceId = 0;

let unassignedMembers: IMember[] = [];
let assignedMembers: IAMember[] = [];

const modal = document.getElementById('modal')!;
const addBtn = document.getElementById('add-member')!;
const form = document.getElementById('form') as HTMLFormElement;
const imgPrev = document.getElementById("preview") as HTMLImageElement;


function saveInlocalStorage(key: string = unassignedMemberKey, arr = unassignedMembers) {
  localStorage.setItem(key, JSON.stringify(arr))
}

function getFromLocalStrorage(key: string = unassignedMemberKey) {
  unassignedMembers = JSON.parse(localStorage.getItem(key) || "[]") || [];

  const l = document.getElementById("member-list");
  l!.innerHTML = `<p class='no-members ${unassignedMembers.length == 0 ? "" : "is-hidden"}'>No member here</p>`;

  unassignedMembers.forEach((e) => renderSideBar(e))
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
  document.querySelectorAll(".experiences .experience").forEach((e) => (e as HTMLElement).outerHTML = "");
}

function extractExper(): IExperience[] | null {
  const allExpItems = document.querySelectorAll<HTMLElement>(".experience");
  if (allExpItems.length === 0) return [];

  const experiences: IExperience[] = [];

  allExpItems.forEach((e) => {
    const id = e.id;

    const company = e.querySelector(`#company-${id}`) as HTMLInputElement;
    const role = e.querySelector(`#role-${id}`) as HTMLInputElement;
    const from = ((e.querySelector(`#startDate-${id}`) as HTMLInputElement));
    const endVal = (e.querySelector(`#endDate-${id}`) as HTMLInputElement);
    const to = endVal && endVal.value ? new Date(endVal.value) : null;

    const inputs = { company, role, from: from, to: endVal };

    if (validateExperHtmlInputs(inputs)) {
      experiences.push({ id, company: company.value, role: role.value, from: new Date(from.value), to });
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


      document.getElementById("member-list p")?.classList.add("is-hidden")
      unassignedMembers.push(member);
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
        <div class="post">${(member.role as unknown as string).toUpperCase()}</div>
        <div class= "member-btns">
          <div class="edit-btn">Edit</div>
          <div class="detail-btn">Details</div>
          <div class="delete-btn">Delete</div>
        </div>
      </div>
    </div>
  `;
  document.querySelector("#member-list p")?.classList.add("is-hidden")
  div.querySelector(".detail-btn")!.addEventListener("click", () => {
    openDetailModal(member);
  });
  div.querySelector(".edit-btn")!.addEventListener("click", () => {
    const modale = createModal(member);
    modale.classList.remove("is-hidden");
  });
  div.querySelector(".delete-btn")!.addEventListener("click", () => {
    div.remove()
    const indexOf = unassignedMembers.indexOf(member);
    if (indexOf > -1) {
      unassignedMembers.splice(indexOf, 1)
    }
    saveInlocalStorage()
    if (unassignedMembers.length == 0) {
      document.querySelector("#member-list p")?.classList.remove("is-hidden")
    }
  });
  div!.addEventListener('dragstart', (e) => {
    const memberName = member.name
    const image = member.image
    const dataTransfer = (e as DragEvent).dataTransfer
    dataTransfer?.setData('type', member.role)
    dataTransfer?.setData('name', memberName!)
    dataTransfer?.setData('image', image!)
    dataTransfer?.setData('role', member.role!)
    dataTransfer?.setData('email', member.email!)
    dataTransfer?.setData('phone', member.phone!)
    dataTransfer?.setData('expers', JSON.stringify(member.experience))
    dataTransfer?.setData('id', `${member.id}`)
  })
  container.appendChild(div);
}

function validateHtmlInputs(inputs: { [k: string]: HTMLInputElement }) {
  let ok = true;

  Object.entries(inputs).forEach(([key, input]) => {
    console.log("[key, value]: ", [key, input]);

    if (!stringValidate(input.value.trim(), key as inputFields)) {
      addErrorMessage(input, `Please enter a valid ${key}`, key);
      ok = false;
    }
  });

  return ok;
}

function validateExperHtmlInputs(inputs: { [k: string]: HTMLInputElement }) {
  let ok = true;

  if (!stringValidate(inputs.company.value, "name")) {
    addErrorMessage(inputs.company, "Please enter a valid company", "company");
    ok = false;
  }
  if (!stringValidate(inputs.role.value.trim(), "name")) {
    addErrorMessage(inputs.role, "Please enter a valid role", "role");
    ok = false;
  }


  if (!inputs.from.value.trim()) {
    addErrorMessage(inputs.from, "Please enter a valid start date", "startDate");
    ok = false;
  } else if (new Date(inputs.from.value) > new Date(Date.now())) {
    addErrorMessage(inputs.from, "Please enter a valid range date", "startDate");
    ok = false;
  }

  if (inputs.to && inputs.to.value && new Date(inputs.from.value) > new Date(inputs.to.value)) {
    addErrorMessage(inputs.to, "Please end should be great than start date", "endDate");
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



function openDetailModal(member: IMember) {
  const modal = document.getElementById("detail-modal")!;
  modal.classList.remove("is-hidden");



  (document.getElementById("detail-img") as HTMLImageElement).src = member.image;
  (document.getElementById("detail-name") as HTMLElement).textContent = member.name;
  (document.getElementById("detail-role") as HTMLElement).textContent = (member.role as unknown as string).toUpperCase();
  (document.getElementById("detail-email") as HTMLElement).textContent = member.email;
  (document.getElementById("detail-phone") as HTMLElement).textContent = member.phone;

  const expList = document.getElementById("detail-experience-list")!;
  expList.innerHTML = "";

  if (!member.experience || member.experience.length === 0) {
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

function onDrop(e: DragEvent) {
  e.preventDefault()
  const canvas = document.getElementById('canvas')!
  const dataTransfer = (e as DragEvent).dataTransfer
  const memberType = dataTransfer?.getData('role') || ''
  const memberName = dataTransfer?.getData('name') || 'unkown'
  const memberImage = dataTransfer?.getData('image') || 'img'
  const memberEmail = dataTransfer?.getData('email') || 'email'
  const memberPhone = dataTransfer?.getData('phone') || 'phone'
  const memberExpers = JSON.parse(dataTransfer?.getData("expers") || "[]") as IExperience[]
  const id = dataTransfer?.getData('id') || ''

  const member = document.getElementById(id)

  const zone = document.elementFromPoint(
    e.clientX,
    e.clientY
  ) as HTMLElement | null

  if (!zone || zone.tagName !== 'polygon') {
    alert('Please drag to valid room')
    return
  }

  const isAllowed = checkRoomeAndRole(
    toRoleEnumValue(memberType)!,
    toRoomEnumValue(zone.dataset.room!)
  )

  if (!isAllowed) {
    alert('You drag wrong member to zone')
    return
  }

  const rect = canvas.getBoundingClientRect()
  const newEl = createStackElement(
    e,
    rect,
    memberName,
    memberImage,
    memberType,
    id,
    memberEmail,
    memberPhone,
    memberExpers
  )

  member?.remove()
  canvas.appendChild(newEl)
}

function dragAndDrop() {
  const canvas = document.getElementById('canvas')

  assignedMembers.push(...JSON.parse(localStorage.getItem(assignedMemberKey) || "[]"));


  assignedMembers.forEach((m: IAMember) => {
    const ele = initStackElements(m);
    canvas?.appendChild(ele)
  })


  canvas?.addEventListener('dragover', (e) => {
    e.preventDefault()
  })

  canvas?.addEventListener('drop', onDrop)
}

function createStackElement(
  e: DragEvent,
  rect: DOMRect,
  memberName: string,
  memberImage: string,
  memberType: string,
  id: string,
  memberEmail: string,
  memberPhone: string,
  memberExpers: IExperience[]
) {

  // console.log("------------------------------------");

  // const newEle = document.createElement('div')
  // return newEle;
 

  const mem: IMember = {
    id: +id,
    image: memberImage,
    name: memberName,
    email: memberEmail,
    phone: memberPhone,
    role: toRoleEnumValue(memberType)!,
    experience: memberExpers,
  };

  const oldAssign = assignedMembers.find((a) => a.id === +id);
  if (oldAssign) {
    const idx = assignedMembers.indexOf(oldAssign!);
    if (idx > -1) assignedMembers.splice(idx, 1);
  }

  let assignMem = {
    left: 0, top: 0, ...mem
  };
  assignedMembers.push(assignMem);

  const unIndex = unassignedMembers.findIndex((u) => u.id == assignMem.id);
  if (unIndex > -1) {
    unassignedMembers.splice(unIndex, 1)
  }

  if (unassignedMembers.length == 0) {
    document.querySelector("#member-list p")?.classList.remove("is-hidden")
  }

  const localX = e.clientX - rect.left
  const localY = e.clientY - rect.top

  const yPercent = (localY * 100) / rect.height
  const xPercent = (localX * 100) / rect.width

  assignMem.top = yPercent;
  assignMem.left = xPercent;

  saveInlocalStorage(assignedMemberKey, assignedMembers)
  saveInlocalStorage()


  const newEl = document.createElement('div')

  newEl.id = id

  const image = document.createElement('img')
  const xBtn = document.createElement('div')
  xBtn.classList.add('close-btn')
  xBtn.textContent = "x"
  xBtn.onclick = () => {

    newEl.remove()
    unassignedMembers.push(mem);
    const unIdx = unassignedMembers.findIndex((m) => m.id === mem.id)
    const assignedIdx = assignedMembers.findIndex((m) => m.id === mem.id)
    if (assignedIdx > -1) assignedMembers.splice(assignedIdx, 1)

    renderSideBar(mem)
    saveInlocalStorage(assignedMemberKey, assignedMembers)
    localStorage.setItem(unassignedMemberKey, JSON.stringify(unassignedMembers))
    document.querySelector("#member-list p")?.classList.add("is-hidden")


  }


  image.src = memberImage || ''
  image.alt = memberName || 'unkown'
  image.className = 'image'
  image.classList.add('image-config')
  image.onclick = () => {
    openDetailModal(mem)
  }

  newEl.classList.add('member-zone')
  newEl.style.left = xPercent + '%'
  newEl.style.top = yPercent + '%'


  newEl.appendChild(image)
  newEl.appendChild(xBtn)

  newEl.addEventListener('dragstart', (e: DragEvent) => {
    const data = e.dataTransfer
    data!.setData('role', (mem.role as unknown as string))
    data!.setData('name', mem.name)
    data!.setData('image', mem.image)
    data?.setData('id', mem.id.toString())
  })


  return newEl
}

function initStackElements(member: IAMember) {
  //   console.log("++++++++++++++++++++++++++++++++++++++++++");

  // const newEle = document.createElement('div')
  // return newEle;

  const newEl = document.createElement('div')

  newEl.id = member.id.toString()

  const image = document.createElement('img')
  const xBtn = document.createElement('div')
  xBtn.classList.add('close-btn')
  xBtn.textContent = "x"
  xBtn.onclick = () => {

    newEl.remove()

    unassignedMembers.push(member);

    const assignedIdx = assignedMembers.findIndex((d) => d.id == member.id)
    if (assignedIdx > -1) assignedMembers.splice(assignedIdx, 1)

    renderSideBar(member)

    saveInlocalStorage(assignedMemberKey, assignedMembers)

    localStorage.setItem(unassignedMemberKey, JSON.stringify(unassignedMembers))

    document.querySelector("#member-list p")?.classList.add("is-hidden")
  }


  image.src = member.image || ''
  image.alt = member.name || 'unkown'
  image.className = 'image'
  image.classList.add('image-config')
  newEl.classList.add('member-zone')
  newEl.style.left = member.left + '%'
  newEl.style.top = member.top + '%'


  newEl.onclick = () => {
    openDetailModalCan(member)
  }
  newEl.appendChild(image)
  newEl.appendChild(xBtn)

  newEl.addEventListener('dragstart', (e: DragEvent) => {
    const data = e.dataTransfer
    data!.setData('role', (member.role as unknown as string))
    data!.setData('name', member.name)
    data!.setData('image', member.image)
    data?.setData('id', member.id.toString())
  })

  return newEl
}

function openDetailModalCan(member: IMember) {
  const modal = document.getElementById("detail-modal")!;
  modal.classList.remove("is-hidden");

  (document.getElementById("detail-img") as HTMLImageElement).src = member.image;
  (document.getElementById("detail-name") as HTMLElement).textContent = member.name;
  (document.getElementById("detail-role") as HTMLElement).textContent = (member.role as unknown as string).toUpperCase();
  (document.getElementById("detail-email") as HTMLElement).textContent = member.email;
  (document.getElementById("detail-phone") as HTMLElement).textContent = member.phone;

  const expList = document.getElementById("detail-experience-list")!;
  expList.innerHTML = "";

  if (!member.experience || member.experience.length === 0) {
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


dragAndDrop()

getFromLocalStrorage()
initModal();
initForm();
initDetailModal();


function createModal(member: IMember) {
  const modal = document.createElement("div");
  modal.className = "modal is-hidden";
  modal.id = "modal";

  const overlay = document.createElement("div");
  overlay.className = "modal__overlay";
  modal.appendChild(overlay);


  const content = document.createElement("div");
  content.className = "modal__content";
  modal.appendChild(content);


  const header = document.createElement("header");
  header.className = "modal__header";

  const title = document.createElement("h3");
  title.className = "modal__title";
  title.id = "modal-title";
  title.textContent = "Add a member";

  const closeBtn = document.createElement("button");
  closeBtn.className = "modal__close";
  closeBtn.id = "close-modal";
  closeBtn.dataset.action = "close-modal";
  closeBtn.textContent = "×";

  header.appendChild(title);
  header.appendChild(closeBtn);
  content.appendChild(header);


  const body = document.createElement("div");
  body.className = "modal__body";
  body.id = "modal-body";
  content.appendChild(body);


  const form = document.createElement("form");
  form.className = "form";
  form.id = "form";
  body.appendChild(form);

  const mainInfo = document.createElement("div");
  mainInfo.className = "main-info";
  form.appendChild(mainInfo);


  function createInputGroup(value: string, labelText: string, id: string, type: string, placeholder: string) {
    const group = document.createElement("div");
    group.className = "form__group";

    const label = document.createElement("label");
    label.className = "form__label";
    label.htmlFor = id;
    label.textContent = labelText;

    const input = document.createElement("input");
    input.value = value;
    input.type = type;
    input.id = id;
    input.className = type;
    input.classList.add(id)
    input.placeholder = placeholder;

    group.append(label, input);
    return group;
  }

  mainInfo.appendChild(
    createInputGroup(member.name, "Name", "name", "text", "Enter member name")
  );
  mainInfo.appendChild(
    (function () {
      const group = document.createElement("div");
      group.className = "form__group";

      const label = document.createElement("label");
      label.className = "form__label";

      label.textContent = "Role";

      const select = document.createElement("select");
      select.id = "role";
      select.className = "role";

      ["receptionist", "it", "security", "cleaning", "other"].forEach((r) => {
        const option = document.createElement("option");
        option.value = r;
        option.textContent = r[0].toUpperCase() + r.slice(1);
        select.appendChild(option);
      });

      group.append(label, select);
      return group;
    })()
  );

  mainInfo.appendChild(
    createInputGroup(member.email, "E-mail", "email", "email", "example@example.com")
  );

  mainInfo.appendChild(
    createInputGroup(member.phone, "Phone", "phone", "phone", "06xxxxxx")
  );

  const imgGroup = document.createElement("div");
  imgGroup.className = "form__group";

  const imgLabel = document.createElement("label");
  imgLabel.className = "form__label";
  imgLabel.textContent = "Image URL";
  imgLabel.htmlFor = "image";

  const imgInput = document.createElement("input");
  imgInput.type = "url";
  imgInput.id = "image";
  imgInput.className = "input link";
  imgInput.classList.add("image");
  imgInput.value = member.image

  const imgFrame = document.createElement("div");
  imgFrame.className = "img-frame";


  const preview = document.createElement("img");
  preview.id = "preview";
  preview.src = member.image;
  preview.alt = "Image Preview";

  imgFrame.appendChild(preview);
  imgGroup.append(imgLabel, imgInput, imgFrame);
  mainInfo.appendChild(imgGroup);

  imgInput.addEventListener("input", () => {
    preview.src = imgInput.value || "./assets/avatars/favatar.webp";
  });

  if (member.experience && member.experience.length !== 0) {
    for (const ex of member.experience) {
      mainInfo.appendChild(createExperienceItem(String(ex.id), ex));
    }
  }

  const actions = document.createElement("div");
  actions.className = "form__actions";

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "btn btn-add-tolist";
  submitBtn.textContent = "Update member";

  actions.appendChild(submitBtn);


  form.addEventListener("submit", (e) => {
    e.preventDefault()


    const nameInput = (form.getElementsByClassName("text")[0] as HTMLInputElement).value.trim();
    const roleInput = (form.getElementsByClassName("role")[0] as HTMLSelectElement).value;
    const emailInput = (form.getElementsByClassName("email")[0] as HTMLInputElement).value.trim();
    const phoneInput = (form.getElementsByClassName("phone")[0] as HTMLInputElement).value.trim();
    const imageInput = (form.getElementsByClassName("image")[0] as HTMLInputElement).value.trim();


    member.name = nameInput;
    member.role = roleInput as any;
    member.email = emailInput;
    member.phone = phoneInput;
    member.image = imageInput;



    const expElements = form.querySelectorAll(".experience");

    member.experience = [];
    expElements.forEach((exp: Element) => {
      const id = Number(exp.getAttribute("data-exp-id"));
      const company = (form.querySelector(`#company-${id}`) as HTMLInputElement).value;
      const role = (form.querySelector(`#role-${id}`) as HTMLInputElement).value;
      const from = ((form.querySelector(`#startDate-${id}`) as HTMLInputElement)).value;
      const endVal = (form.querySelector(`#endDate-${id}`) as HTMLInputElement).value;
      const to = endVal ? new Date(endVal) : null;

      member.experience.push({
        id: member.id.toString(),
        company,
        role,
        from: new Date(from),
        to,
      });
    });

    saveInlocalStorage();

    modal.classList.add("is-hidden");
    renderAllOneTime()


  })

  form.appendChild(actions);


  closeBtn.addEventListener("click", () => {
    modal.classList.add("is-hidden");
  });

  overlay.addEventListener("click", () => {
    modal.classList.add("is-hidden");
  });


  document.body.appendChild(modal);

  return modal;
}

function renderAllOneTime() {
  const container = document.getElementById("member-list")!;
  container.innerHTML = ""
  unassignedMembers.forEach((un) => {
    renderSideBar(un);
  })
}

function createExperienceItem(index: string, experience: IExperience) {
  const wrapper = document.createElement("div");
  wrapper.className = "experience";
  wrapper.id = index;
  wrapper.setAttribute("data-exp-id", String(index));

  const head = document.createElement("div");
  head.className = "exp-head";

  const title = document.createElement("p");
  title.textContent = "Experience";

  head.appendChild(title);
  wrapper.appendChild(head);

  const createInputGroup = (labelTxt: string, idBase: string, type: string, value: string | Date = "") => {
    const group = document.createElement("div");
    group.className = "form__group";

    const label = document.createElement("label");
    label.className = "form__label";
    label.setAttribute("for", `${idBase}-${index}`);
    label.textContent = labelTxt;

    const input = document.createElement("input");
    input.className = "input";
    input.id = `${idBase}-${index}`;
    input.type = type;

    if (type == "date") {
      const myDate = new Date(value);
      try {
        const ymd = myDate.toISOString().split("T")[0].trim();
        input.value = ymd;
      } catch (error) {

      }
    } else {
      input.value = value as string;
    }

    group.appendChild(label);
    group.appendChild(input);
    return group;
  };

  wrapper.appendChild(
    createInputGroup("Company", "company", "text", experience?.company || "")
  );
  wrapper.appendChild(
    createInputGroup("Role", "role", "text", experience?.role || "")
  );
  wrapper.appendChild(
    createInputGroup("Start Date", "startDate", "date", experience.from)
  );
  wrapper.appendChild(
    createInputGroup("End Date", "endDate", "date", experience?.to || "")
  );

  return wrapper;
}
