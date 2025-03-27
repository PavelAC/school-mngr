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
  createdBy: string; // UID of the admin who created it
  createdAt: Date;
  updatedAt: Date;
  enrollmentCode?: string;
  students?: string[]; // UIDs of enrolled students
  teachers?: string[]; // UIDs of assigned teachers
}