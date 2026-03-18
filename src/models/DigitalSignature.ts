export interface DigitalSignature {
  id: number;
  photo: string;
  user: {
    id: number;
    name?: string;
    email?: string;
  };
  user_id: number;
}
