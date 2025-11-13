export enum AuthProvider {
  LOCAL = 'local',
}

export interface ActiveUser {
  id: number;
  email: string;
  provider: AuthProvider;
}
