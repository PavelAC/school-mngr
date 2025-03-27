// course.actions.ts
import { createAction, props } from '@ngrx/store';
import { Course } from '../../models/course';
import { User } from '../../models/user.model';

export const loadCourses = createAction('[Course] Load Courses');
export const loadCoursesSuccess = createAction(
  '[Course] Load Courses Success',
  props<{ courses: Course[] }>()
);
export const loadCoursesFailure = createAction(
  '[Course] Load Courses Failure',
  props<{ error: any }>()
);

export const createCourse = createAction(
  '[Course] Create Course',
  props<{ course: Omit<Course, 'id'>; user: User }>()
);

export const createCourseSuccess = createAction(
  '[Course] Create Course Success',
  props<{ course: Course }>()
);
export const createCourseFailure = createAction(
  '[Course] Create Course Failure',
  props<{ error: any }>()
);

export const enrollInCourse = createAction(
  '[Course] Enroll In Course',
  props<{ courseId: string; userId: string }>()
);
export const enrollInCourseSuccess = createAction(
  '[Course] Enroll In Course Success',
  props<{ courseId: string; userId: string }>()
);
export const enrollInCourseFailure = createAction(
  '[Course] Enroll In Course Failure',
  props<{ error: any }>()
);

export const selectCourse = createAction(
  '[Course] Select Course',
  props<{ courseId: string }>()
);
