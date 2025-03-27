export interface Assignment {
    id?: string;
    courseId: string;
    title: string;
    description: string;
    dueDate: Date;
    points: number;
    attachments?: string[];
  }