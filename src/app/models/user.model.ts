import { UserRole } from './user-roles.enum';

export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    enrolledCourses?: string[];
    teachingCourses?: string[];
    // emailVerified:boolean;
  }