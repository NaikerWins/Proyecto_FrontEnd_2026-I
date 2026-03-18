export interface Answer {
  id?: number;
  userId: number;
  securityQuestionId: number;
  content: string;
  question?: {
    id: number;
    name: string;
    description?: string;
  };
}
