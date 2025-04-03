import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { Grade } from '../../models/grade.model';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

// Selector for all users
export const selectAllUsers = createSelector(
  selectAuthState,
  (state: AuthState) => {
    console.log('Selector state:', state); // Debug state
    return state.allUsers || []; // Ensure property matches reducer
  }
);
// Selector for current user
export const selectCurrentUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.currentUser
);

// Authentication status
export const selectIsAuthenticated = createSelector(
  selectCurrentUser,
  (user) => !!user
);

// User role
export const selectUserRole = createSelector(
  selectCurrentUser,
  (user) => user?.role
);

// Loading state
export const selectAuthLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

// Error state
export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

// Role-based selectors
export const selectIsAdmin = createSelector(
  selectUserRole,
  (role) => role === 'admin'
);

export const selectIsTeacher = createSelector(
  selectCurrentUser,
  (user) => user?.role === 'teacher'
);

export const selectIsStudent = createSelector(
  selectUserRole,
  (role) => role === 'student'
);

export const selectUsersLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectNonAdminUsers = createSelector(
  selectAllUsers,
  (users) => users.filter(user => user.role !== 'admin')
);

export const selectTeachers = createSelector(
  selectAllUsers,
  (users) => users.filter(user => user.role === 'teacher')
);

export const selectStudents = createSelector(
  selectAllUsers,
  (users) => users.filter(user => user.role === 'student')
);

export const selectGradesState = createFeatureSelector<Grade[]>('grades');

export const selectCourseGrades = (courseId: string) => createSelector(
  selectGradesState,
  (grades) => grades.filter(grade => grade.courseId === courseId)
);