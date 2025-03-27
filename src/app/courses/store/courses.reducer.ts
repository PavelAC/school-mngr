import { createReducer, on } from '@ngrx/store';
import { Course } from '../../models/course';
import * as CourseActions from './courses.actions';

// Define the shape of the courses state
export interface CoursesState {
  courses: Course[];
  loading: boolean;
  error: string | null;
  selectedCourseId: string | null;
}

// Initial state
export const initialState: CoursesState = {
  courses: [],
  loading: false,
  error: null,
  selectedCourseId: null
};

// Create the reducer
export const coursesReducer = createReducer(
  initialState,

  // Load Courses
  on(CourseActions.loadCourses, state => ({
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
  on(CourseActions.loadCoursesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Course
  on(CourseActions.createCourse, (state, { user }) => ({

    ...state,
    loading: true,
    error: null
  })),
  on(CourseActions.createCourseSuccess, (state, { course }) => ({
    ...state,
    courses: [...state.courses, course],
    loading: false,
    error: null
  })),
  on(CourseActions.createCourseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Enroll in Course
  on(CourseActions.enrollInCourse, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CourseActions.enrollInCourseSuccess, (state, { courseId, userId }) => ({
    ...state,
    courses: state.courses.map(course => 
      course.id === courseId 
        ? { ...course, students: [...(course.students || []), userId] }
        : course
    ),
    loading: false,
    error: null
  })),
  on(CourseActions.enrollInCourseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Select Course
  on(CourseActions.selectCourse, (state, { courseId }) => ({
    ...state,
    selectedCourseId: courseId
  }))
);
