export enum roleEnum {
  receptionist = 'receptionist',
  it = 'it',
  security = 'security',
  cleaning = 'cleaning',
  other = 'other',
}

export enum roomEnum {
  conference = 'conférence',
  security = 'security',
  server = 'server',
  reception = 'reception',
  staff = 'staff',
  vault = 'vault',
}

export const RoomAccess: Record<roomEnum, roleEnum[]> = {
  [roomEnum.conference]: [roleEnum.it, roleEnum.cleaning],
  [roomEnum.security]: [roleEnum.other, roleEnum.security],
  [roomEnum.server]: [roleEnum.it],
  [roomEnum.reception]: [roleEnum.it],
  [roomEnum.staff]: [roleEnum.it],
  [roomEnum.vault]: [roleEnum.it],
}
