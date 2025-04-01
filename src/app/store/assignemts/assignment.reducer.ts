import { createReducer, on } from '@ngrx/store';
import * as AssignmentActions from './assignment.actions';
import { Assignment } from '../../models/assigment';
import { Submission } from '../../models/submission';

export interface AssignmentState {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  submissions: Submission[];
  loading: boolean;
  error: string | null;
}

export const initialState: AssignmentState = {
  assignments: [],
  currentAssignment: null,
  submissions: [],
  loading: false,
  error: null
};

export const assignmentReducer = createReducer(
  initialState,

  // Load Assignments
  on(AssignmentActions.loadAssignments, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AssignmentActions.loadAssignmentsSuccess, (state, { assignments }) => ({
    ...state,
    assignments,
    loading: false
  })),
  on(AssignmentActions.loadAssignmentsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Create Assignment
  on(AssignmentActions.createAssignment, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AssignmentActions.createAssignmentSuccess, (state, { assignment }) => ({
    ...state,
    assignments: [...state.assignments, assignment],
    loading: false
  })),
  on(AssignmentActions.createAssignmentFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Update Assignment
  on(AssignmentActions.updateAssignment, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AssignmentActions.updateAssignmentSuccess, (state, { assignment }) => ({
    ...state,
    assignments: state.assignments.map(a => 
      a.id === assignment.id ? assignment : a
    ),
    currentAssignment: state.currentAssignment?.id === assignment.id 
      ? assignment 
      : state.currentAssignment,
    loading: false
  })),
  on(AssignmentActions.updateAssignmentFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Delete Assignment
  on(AssignmentActions.deleteAssignment, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AssignmentActions.deleteAssignmentSuccess, (state, { assignmentId }) => ({
    ...state,
    assignments: state.assignments.filter(a => a.id !== assignmentId),
    currentAssignment: state.currentAssignment?.id === assignmentId 
      ? null 
      : state.currentAssignment,
    loading: false
  })),
  on(AssignmentActions.deleteAssignmentFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Submissions
  on(AssignmentActions.loadSubmissions, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AssignmentActions.loadSubmissionsSuccess, (state, { submissions }) => ({
    ...state,
    submissions,
    loading: false
  })),
  on(AssignmentActions.loadSubmissionsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Grade Submission
  on(AssignmentActions.gradeSubmission, state => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AssignmentActions.gradeSubmissionSuccess, (state, { submission }) => ({
    ...state,
    submissions: state.submissions.map(s =>
      s.id === submission.id ? submission : s
    ),
    loading: false
  })),
  on(AssignmentActions.gradeSubmissionFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);