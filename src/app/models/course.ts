// export interface Course {
//     id?: string;
//     title: string;
//     description: string;
//     teacherId: string;
//     createdAt: Date;
//     updatedAt: Date;
//     enrollmentCode?: string;
//     studentIds?: string[];
//   }

export interface Course {
  id: string;
  title: string;
  description: string;
  createdBy: string; // Admin UID
  createdAt: Date ;
  updatedAt: Date ;
  enrollmentCode?: string;
  studentIds?: string[]; // Enrolled students
  teacherId?: string | null; // Primary teacher UID
  assignmentIds?: string[]; // References to assignments
}