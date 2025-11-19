import {
  checkRoomeAndRole,
  toRoleEnumValue,
  toRoomEnumValue,
} from './utility/helpers.js'

import { assignedMember, assignedMemberKey, getFromLocalStrorage, renderSideBar, saveInlocalStorage, unassignedMember } from "./add.js";

import { IAMember, IExperience, IMember } from "./utility/member.js";

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

  console.log("Drop role: ", memberType);


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
    memberExpers,
    // memberObj!
  )
  member?.remove()
  canvas.appendChild(newEl)
}

function dragAndDrop() {
  // const member = document.getElementsByClassName('member')
  const canvas = document.getElementById('canvas')

  // onDragStart(member)

  assignedMember.push(...JSON.parse(localStorage.getItem(assignedMemberKey) || "[]"));


  assignedMember.forEach((m: IAMember) => {
    const ele = initStackElements(m);
    console.log(assignedMember);
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
  // member: IMember
) {

  const mem: IMember = {
    id: +id,
    image: memberImage,
    name: memberName,
    email: memberEmail,
    phone: memberPhone,
    role: toRoleEnumValue(memberType)!,
    experience: memberExpers,
  };
  let assignMem = {
    left: 0, top: 0, ...mem
  };
  assignedMember.push(assignMem);
  const indexOf = assignedMember.indexOf(assignMem)
  unassignedMember.splice(indexOf, 1)


  if (unassignedMember.length == 0) {
    document.querySelector("#member-list p")?.classList.remove("is-hidden")
  }

  const localX = e.clientX - rect.left
  const localY = e.clientY - rect.top

  const yPercent = (localY * 100) / rect.height
  const xPercent = (localX * 100) / rect.width

  assignMem.top = yPercent;
  assignMem.left = xPercent;

  saveInlocalStorage(assignedMemberKey, assignedMember)
  saveInlocalStorage()


  const newEl = document.createElement('div')

  newEl.id = id

  const image = document.createElement('img')
  // const info = document.createElement('div')
  const xBtn = document.createElement('div')
  xBtn.classList.add('close-btn')
  xBtn.textContent = "x"
  xBtn.onclick = () => {
    newEl.remove()
    unassignedMember.push(mem);
    const indexOf = unassignedMember.indexOf(mem)
    assignedMember.splice(indexOf, 1)
    renderSideBar(mem)
    saveInlocalStorage(assignedMemberKey, assignedMember)
    saveInlocalStorage()
    document.querySelector("#member-list p")?.classList.add("is-hidden")
  }


  image.src = memberImage || ''
  image.alt = memberName || 'unkown'
  image.className = 'image'
  image.classList.add('image-config')
  newEl.classList.add('member-zone')
  newEl.style.left = xPercent + '%'
  newEl.style.top = yPercent + '%'


  newEl.onclick = () => {
    openDetailModal(mem)
  }
  newEl.appendChild(image)
  newEl.appendChild(xBtn)

  newEl.addEventListener('dragstart', (e: DragEvent) => {
    const data = e.dataTransfer
    data!.setData('role', mem.role)
    console.log("info: ", mem.role);

    data!.setData('name', mem.name)
    data!.setData('image', mem.image)
    data?.setData('id', mem.id.toString())
  })

  return newEl
}

function initStackElements(member: IAMember) {
  const newEl = document.createElement('div')

  newEl.id = member.id.toString()

  const image = document.createElement('img')
  // const info = document.createElement('div')
  const xBtn = document.createElement('div')
  xBtn.classList.add('close-btn')
  xBtn.textContent = "x"
  xBtn.onclick = () => {
    newEl.remove()
    unassignedMember.push(member);
    const indexOf = unassignedMember.indexOf(member)
    assignedMember.splice(indexOf, 1)
    renderSideBar(member)
    saveInlocalStorage(assignedMemberKey, assignedMember)
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
    openDetailModal(member)
  }
  newEl.appendChild(image)
  newEl.appendChild(xBtn)

  newEl.addEventListener('dragstart', (e: DragEvent) => {
    const data = e.dataTransfer
    data!.setData('role', member.role)
    console.log("info: ", member.role);

    data!.setData('name', member.name)
    data!.setData('image', member.image)
    data?.setData('id', member.id.toString())
  })

  return newEl
}

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

// localStorage.clear()

dragAndDrop()