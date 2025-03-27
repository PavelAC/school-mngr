import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CoursesState } from './courses.reducer';
import { Course } from '../../models/course';

// Create a feature selector for the courses state
export const selectCoursesState = createFeatureSelector<CoursesState>('courses');

// Selector to get all courses
export const selectAllCourses = createSelector(
  selectCoursesState,
  (state) => state.courses
);

// Selector to get the loading state
export const selectCoursesLoading = createSelector(
  selectCoursesState,
  (state) => state.loading
);

// Selector to get any error state
export const selectCoursesError = createSelector(
  selectCoursesState,
  (state) => state.error
);

// Selector to find a specific course by ID
export const selectCourseById = createSelector(
  selectAllCourses,
  (courses: Course[], props: { courseId: string }) => 
    courses.find(course => course.id === props.courseId)
);

// Selector to get courses filtered by a specific criteria
export const selectFilteredCourses = createSelector(
  selectAllCourses,
  (courses: Course[], props: { filterFn: (course: Course) => boolean }) => 
    courses.filter(props.filterFn)
);

// Selector for the currently selected course
export const selectSelectedCourseId = createSelector(
  selectCoursesState,
  (state) => state.selectedCourseId
);

export const selectSelectedCourse = createSelector(
  selectAllCourses,
  selectSelectedCourseId,
  (courses, selectedId) => 
    courses.find(course => course.id === selectedId)
);