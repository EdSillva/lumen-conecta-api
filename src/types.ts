export enum Role {
  PUBLIC = 'PUBLIC',
  CREATOR = 'CREATOR',
  ADMIN = 'ADMIN'
}

export type RequestUser = {
  id: string;
  firebaseUid: string;
  roles: Role[];
};
