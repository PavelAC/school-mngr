import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CoursesState } from './courses.reducer';
import { Course } from '../../models/course';
import * as fromAuth from '../auth/auth.selectors';
// Create a feature selector for the courses state
export const selectCoursesState = createFeatureSelector<CoursesState>('courses');

// Selector to get all courses
export const selectAllCourses = createSelector(
  selectCoursesState,
  (state) => {
    console.log('Selecting courses from state:', state.courses.length);
    return state.courses;
  }
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
export const selectCourseById = (courseId: string) => 
  createSelector(
    selectAllCourses,
    (courses: Course[]) => courses.find(course => course.id === courseId) || null
  );

// Selector to get courses filtered by a specific criteria

export const selectFilteredCourses = createSelector(
  selectAllCourses,
  fromAuth.selectCurrentUser,
  (courses, user) => {
    // Debugging logs
    console.log('All courses:', courses);
    console.log('Current user:', user);
    
    if (!user) {
      console.log('No user - returning empty array');
      return [];
    }
    
    const filteredCourses = courses.filter(course => {
      // For students - check if they're enrolled
      if (user.role === 'student') {
        const isEnrolled = course.studentIds?.includes(user.uid) ?? false;
        console.log(`Course ${course.id} - student enrolled: ${isEnrolled}`);
        return isEnrolled;
      }
      
      // For teachers - check if they're assigned or created the course
      if (user.role === 'teacher') {
        const isTeacher = course.teacherId === user.uid;
        const isCreator = course.createdBy === user.uid;
        console.log(`Course ${course.id} - isTeacher: ${isTeacher}, isCreator: ${isCreator}`);
        return isTeacher || isCreator;
      }
      
      // For admins - return all courses
      console.log('Admin user - returning all courses');
      return true;
    });
    
    console.log('Filtered courses:', filteredCourses);
    return filteredCourses;
  }
);
// Selector for the currently selected course
// export const selectSelectedCourseId = createSelector(
//   selectCoursesState,
//   (state) => state.selectedCourseId
// );
export const selectSelectedCourseId = createSelector(
  selectCoursesState,
  (state) => state.selectedCourseId
);

export const selectSelectedCourse = createSelector(
  selectAllCourses,
  selectSelectedCourseId,
  (courses, selectedId) => selectedId ? courses.find(course => course.id === selectedId) : null
);
// export const selectFilteredCourses = createSelector(
//   selectAllCourses,
//   fromAuth.selectCurrentUser,
//   (courses, user) => {
//     if (!user) return [];
    
//     if (user.role === 'student') {
//       return courses.filter(course => 
//         course.studentIds?.includes(user.uid) ?? false
//       );
//     } else if (user.role === 'teacher') {
//       return courses.filter(course => 
//         course.teacherId === user.uid || course.createdBy === user.uid
//       );
//     }
//     return courses; // Admin sees all courses
//   }
// );
