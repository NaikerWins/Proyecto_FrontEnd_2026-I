export interface Password {
  id?: number;
  userId: number;
  passwordHash: string;
  created_at?: string;
  isActive?: boolean;
  startAt?: string;
  endAt?: string;
  content?: string; 
}