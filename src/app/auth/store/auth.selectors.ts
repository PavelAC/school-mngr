import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { state } from '@angular/animations';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser = createSelector(
  selectAuthState,
  // (state: AuthState) => state.user
  (state) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectCurrentUser,
  (user) => !!user
);

export const selectUserRole = createSelector(
  selectCurrentUser,
  (user) => user?.role
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.loading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

export const selectIsAdmin = createSelector(
  selectUserRole,
  (role) => role === 'admin'
);

export const selectIsTeacher = createSelector(
  selectUserRole,
  (role) => role === 'teacher'
);

export const selectIsStudent = createSelector(
  selectUserRole,
  (role) => role === 'student'
);