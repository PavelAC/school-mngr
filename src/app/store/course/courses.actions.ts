import { createAction, props } from '@ngrx/store';
import { Course } from '../../models/course';
import { User } from '../../models/user.model';

// Course Loading Actions
export const loadCourses = createAction('[Course] Load Courses');
export const loadCoursesSuccess = createAction(
  '[Course] Load Courses Success',
  props<{ courses: Course[] }>()
);
export const loadCoursesFailure = createAction(
  '[Course] Load Courses Failure',
  props<{ error: string }>()
);

export const loadCourse = createAction(
  '[Course] Load Course',
  props<{ courseId: string }>()
);
export const loadCourseSuccess = createAction(
  '[Course] Load Course Success',
  props<{ course: Course }>()
);
export const loadCourseFailure = createAction(
  '[Course] Load Course Failure',
  props<{ error: string }>()
);

// Course Management Actions
export const createCourse = createAction(
  '[Course] Create Course',
  props<{ course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'studentIds'>; user: User }>()
);
export const createCourseSuccess = createAction(
  '[Course] Create Course Success',
  props<{ course: Course }>()
);
export const createCourseFailure = createAction(
  '[Course] Create Course Failure',
  props<{ error: string }>()
);

export const updateCourse = createAction(
  '[Course] Update Course',
  props<{ courseId: string; changes: Partial<Course> }>()
);
export const updateCourseSuccess = createAction(
  '[Course] Update Course Success',
  props<{ course: Course }>()
);
export const updateCourseFailure = createAction(
  '[Course] Update Course Failure',
  props<{ error: string }>()
);

// Enrollment Actions
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
  props<{ error: string }>()
);

// Teacher Management Actions
export const assignTeacherToCourse = createAction(
  '[Course] Assign Teacher To Course',
  props<{ courseId: string; teacherId: string; adminId: string }>()
);
export const assignTeacherToCourseSuccess = createAction(
  '[Course] Assign Teacher To Course Success',
  props<{ course: Course }>()
);
export const assignTeacherToCourseFailure = createAction(
  '[Course] Assign Teacher To Course Failure',
  props<{ error: string; courseId: string }>()
);

export const removeTeacherFromCourse = createAction(
  '[Course] Remove Teacher From Course',
  props<{ courseId: string; adminId: string }>()
);
export const removeTeacherFromCourseSuccess = createAction(
  '[Course] Remove Teacher From Course Success',
  props<{ course: Course }>()
);
export const removeTeacherFromCourseFailure = createAction(
  '[Course] Remove Teacher From Course Failure',
  props<{ error: string; courseId: string }>()
);

// Selection & UI Actions
export const selectCourse = createAction(
  '[Course] Select Course',
  props<{ courseId: string }>()
);

export const loadAvailableTeachers = createAction(
  '[Course] Load Available Teachers'
);
export const loadAvailableTeachersSuccess = createAction(
  '[Course] Load Available Teachers Success',
  props<{ teachers: User[] }>()
);
export const loadAvailableTeachersFailure = createAction(
  '[Course] Load Available Teachers Failure',
  props<{ error: string }>()
);

// Add these to your existing actions
export const editCourse = createAction(
  '[Course] Edit Course',
  props<{ courseId: string }>()
);
