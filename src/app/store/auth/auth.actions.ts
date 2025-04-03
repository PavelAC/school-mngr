import { createAction, createActionGroup, emptyProps, props } from '@ngrx/store';
import { User } from '../../models/user.model';
import { UserRole } from '../../models/user-roles.enum';
import { Grade } from '../../models/grade.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // Login actions
    'Login': props<{ email: string; password: string }>(),
    'Login Success': props<{ user: User }>(),
    'Login Failure': props<{ error: any }>(),
    
    // Register actions
    'Register': props<{ 
      email: string; 
      password: string; 
      role: UserRole; 
      displayName?: string 
    }>(),
    'Register Success': props<{ user: User }>(),
    'Register Failure': props<{ error: any }>(),
    
    // Logout actions
    'Logout': emptyProps(),
    'Logout Success': emptyProps(),
    'Logout Failure': props<{ error: any }>(),
    
    // Check auth state
    'Check Auth State': emptyProps(),
    'Auth State Changed': props<{ user: User | null }>(),
    
    // Update profile
    'Update Profile': props<{ uid: string; data: Partial<User> }>(),
    'Update Profile Success': props<{ user: User }>(),
    'Update Profile Failure': props<{ error: any }>(),
  }
});
export const loadUsers = createAction('[User ] Load Users');
export const loadUsersSuccess = createAction('[User ] Load Users Success', props<{ users: User[] }>());
export const loadUsersFailure = createAction('[User ] Load Users Failure', props<{ error: any }>())

export const loadGrades = createAction(
  '[Grades] Load Grades',
  props<{ courseId: string }>()
);

export const loadGradesSuccess = createAction(
  '[Grades] Load Grades Success',
  props<{ grades: Grade[] }>()
);

export const loadGradesFailure = createAction(
  '[Grades] Load Grades Failure',
  props<{ error: string }>()
);

export const addGrade = createAction(
  '[Grades] Add Grade',
  props<{ courseId: string, studentId: string, grade: number }>()
);