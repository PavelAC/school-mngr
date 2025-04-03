export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  courseId: string;
  submittedAt: Date;
  files?: {
    name: string;
    url: string;
  }[];
  grade?: {
    points: number;
    feedback: string;
    gradedBy: string; // Teacher UID
    gradedAt: Date;
  };
  status: 'draft' | 'submitted' | 'graded' | 'late';
}