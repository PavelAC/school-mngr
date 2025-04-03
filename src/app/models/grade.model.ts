export interface Grade {
    id?: string;
    courseId: string;
    studentId: string;
    grades: number[];
    average: number;
  }