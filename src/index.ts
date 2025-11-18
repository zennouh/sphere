import {
  checkRoomeAndRole,
  toRoleEnumValue,
  toRoomEnumValue,
} from './utility/helpers.js'

function onDragStart(member: HTMLCollectionOf<Element>) {
  Array.from(member!).forEach((element) => {
    element!.addEventListener('dragstart', (e) => {
      const memberName = element.getElementsByClassName('name')[0].textContent
      const image =
        (element.getElementsByTagName('img')[0] as HTMLImageElement).src || ''
      const dataTransfer = (e as DragEvent).dataTransfer
      dataTransfer?.setData('type', (element! as HTMLElement).dataset.type!)
      dataTransfer?.setData('name', memberName!)
      dataTransfer?.setData('image', image!)
      dataTransfer?.setData('id', element.id!)
    })
  })
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const canvas = document.getElementById('canvas')!
  const dataTransfer = (e as DragEvent).dataTransfer
  const memberType = dataTransfer?.getData('type') || ''
  const memberName = dataTransfer?.getData('name') || 'unkown'
  const memberImage = dataTransfer?.getData('image') || 'img'
  const id = dataTransfer?.getData('id') || ''

  console.log(memberType, "member type ===");
  

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
    id
  )
  member?.remove()
  canvas.appendChild(newEl)
}

function dragAndDrop() {
  const member = document.getElementsByClassName('member')
  const canvas = document.getElementById('canvas')

  onDragStart(member)

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
  id: string
) {
  const localX = e.clientX - rect.left
  const localY = e.clientY - rect.top

  const yPercent = (localY * 100) / rect.height
  const xPercent = (localX * 100) / rect.width

  const newEl = document.createElement('div')

  newEl.id = id

  const image = document.createElement('img')
  const info = document.createElement('div')
  const xBtn = document.createElement('div')
  xBtn.classList.add('close-btn')
  xBtn.textContent
  info.innerHTML = `
    <div class='name'>${memberName}</div>
    <div class= 'type' >${memberType}</div>
    `

  image.src = memberImage || ''
  image.alt = memberName || 'unkown'
  image.className = 'image'
  image.classList.add('image-config')
  // image.classList.add('worker-dot')
  // image.style.left = xPercent + '%'
  // image.style.top = yPercent + '%'
  image.onclick = function () {
    console.log(memberName)
  }

  // newEl.classList.add('worker-dot')
  newEl.classList.add('member-zone')
  newEl.style.left = xPercent + '%'
  newEl.style.top = yPercent + '%'

  newEl.appendChild(image)
  // newEl.appendChild(info)
  // newEl.appendChild(xBtn)

  addEventToStackEle(newEl, info)

  return newEl
}

function addEventToStackEle(newEl: HTMLDivElement, info: HTMLDivElement) {
  newEl.addEventListener('dragstart', (e: DragEvent) => {
    const data = e.dataTransfer
    data!.setData('type', info.getElementsByClassName('type')[0].textContent)
    data!.setData('name', info.getElementsByClassName('name')[0].textContent)
    data!.setData(
      'image',
      (newEl.getElementsByClassName('image')[0] as HTMLImageElement).src
    )
    data?.setData('id', newEl.id!)
  })
}



dragAndDrop()
