export interface Session {
  id: string | null;
  token: string;
  expiration: string;
  FACode: string;
  state: string;
}
