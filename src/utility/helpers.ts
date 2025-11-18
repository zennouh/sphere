import { roleEnum, RoomAccess, roomEnum } from './enum.js'

export function checkRoomeAndRole(role: roleEnum, room: roomEnum): boolean {
  return RoomAccess[room].includes(role)
}

export function toRoleEnumValue(str: string): roleEnum | null {
  if (Object.values(roleEnum).includes(str as roleEnum)) {
    return str as roleEnum
  } else {
    return null
  }
}

export function toRoomEnumValue(str: string): roomEnum {
  return str as roomEnum
}

export function stringValidate(value:string) {

  const regexHuman = /^[a-zA-Z][a-z]{1,}(\s?[a-z]{0,})*$/;

  // const regexCompany = /^[\p{L}\p{N}&.,\-\'\s]{2,100}$/u;

  const regexEmail= /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/


}