export interface Assignment {
  id: string;
  courseId: string; // Reference to the course
  title: string;
  description: string;
  createdBy: string; // Teacher UID
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
  maxPoints: number;
  submissionIds?: string[]; // Student submissions
  resources?: {
    name: string;
    url: string;
  }[];
}