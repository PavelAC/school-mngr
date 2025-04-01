import { createReducer, on } from '@ngrx/store';
import { Course } from '../../models/course';
import { User } from '../../models/user.model';
import * as CourseActions from './courses.actions';

export interface CoursesState {
  courses: Course[];
  availableTeachers: User[];
  loading: boolean;
  error: string | null;
  selectedCourseId: string | null;
}

export const initialState: CoursesState = {
  courses: [],
  availableTeachers: [],
  loading: false,
  error: null,
  selectedCourseId: null
};

export const coursesReducer = createReducer(
  initialState,

  // Loading Actions
  on(CourseActions.loadCourses, CourseActions.loadCourse, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CourseActions.loadCoursesSuccess, (state, { courses }) => ({
    ...state,
    courses,
    loading: false,
    error: null
  })),
  on(CourseActions.loadCourseSuccess, (state, { course }) => ({
    ...state,
    courses: state.courses.some(c => c.id === course.id) 
      ? state.courses.map(c => c.id === course.id ? course : c)
      : [...state.courses, course],
    loading: false
  })),
  on(CourseActions.selectCourse, (state, { courseId }) => ({
    ...state,
    selectedId: courseId
  })),

  // Teacher Management
  on(CourseActions.loadAvailableTeachers, state => ({
    ...state,
    loading: true
  })),
  on(CourseActions.loadAvailableTeachersSuccess, (state, { teachers }) => ({
    ...state,
    availableTeachers: teachers,
    loading: false
  })),
  on(CourseActions.assignTeacherToCourseSuccess, CourseActions.removeTeacherFromCourseSuccess, 
    (state, { course }) => ({
      ...state,
      courses: state.courses.map(c => c.id === course.id ? course : c),
      loading: false
    })),

  // Course Management
  on(CourseActions.createCourseSuccess, (state, { course }) => ({
    ...state,
    courses: [...state.courses, course],
    loading: false
  })),
  on(CourseActions.updateCourseSuccess, (state, { course }) => ({
    ...state,
    courses: state.courses.map(c => c.id === course.id ? course : c),
    loading: false
  })),
  on(CourseActions.editCourse, (state, { courseId }) => ({
    ...state,
    selectedCourseId: courseId
  })),
  on(CourseActions.updateCourseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Enrollment
  on(CourseActions.enrollInCourseSuccess, (state, { courseId, userId }) => ({
    ...state,
    courses: state.courses.map(course => 
      course.id === courseId
        ? { ...course, studentIds: [...(course.studentIds || []), userId] }
        : course
    ),
    loading: false
  })),

  // Selection
  on(CourseActions.selectCourse, (state, { courseId }) => ({
    ...state,
    selectedCourseId: courseId
  })),

  // Error Handling
  on(
    CourseActions.loadCoursesFailure,
    CourseActions.loadCourseFailure,
    CourseActions.createCourseFailure,
    CourseActions.updateCourseFailure,
    CourseActions.enrollInCourseFailure,
    CourseActions.assignTeacherToCourseFailure,
    CourseActions.removeTeacherFromCourseFailure,
    CourseActions.loadAvailableTeachersFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error: typeof error === 'string' ? error : 'An unknown error occurred'
    })
  )
);