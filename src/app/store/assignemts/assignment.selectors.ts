import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AssignmentState } from './assignment.reducer';

export const selectAssignmentState = createFeatureSelector<AssignmentState>('assignments');

export const selectAllAssignments = createSelector(
  selectAssignmentState,
  (state) => state.assignments
);

export const selectCurrentAssignment = createSelector(
  selectAssignmentState,
  (state) => state.currentAssignment
);

export const selectAssignmentsForCourse = (courseId: string) => 
  createSelector(
    selectAllAssignments,
    (assignments) => assignments.filter(a => a.courseId === courseId)
  );

export const selectSubmissions = createSelector(
  selectAssignmentState,
  (state) => state.submissions
);

export const selectSubmissionsForAssignment = (assignmentId: string) =>
  createSelector(
    selectSubmissions,
    (submissions) => submissions.filter(s => s.assignmentId === assignmentId)
  );

export const selectLoading = createSelector(
  selectAssignmentState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectAssignmentState,
  (state) => state.error
);