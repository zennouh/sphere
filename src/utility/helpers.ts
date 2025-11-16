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
