import { createAction, props } from '@ngrx/store';
import { Assignment } from '../../models/assigment';
import { Submission } from '../../models/submission';

// Load Assignments
export const loadAssignments = createAction(
  '[Assignment] Load Assignments',
  props<{ courseId: string }>()
);

export const loadAssignmentsSuccess = createAction(
  '[Assignment] Load Assignments Success',
  props<{ assignments: Assignment[] }>()
);

export const loadAssignmentsFailure = createAction(
  '[Assignment] Load Assignments Failure',
  props<{ error: string }>()
);

// Create Assignment
export const createAssignment = createAction(
  '[Assignment] Create Assignment',
  props<{ 
    courseId: string;
    assignment: Omit<Assignment, 'id' | 'createdAt' | 'submissionIds'>;
    teacherId: string 
  }>()
);

export const createAssignmentSuccess = createAction(
  '[Assignment] Create Assignment Success',
  props<{ assignment: Assignment }>()
);

export const createAssignmentFailure = createAction(
  '[Assignment] Create Assignment Failure',
  props<{ error: string }>()
);

// Update Assignment
export const updateAssignment = createAction(
  '[Assignment] Update Assignment',
  props<{ 
    assignmentId: string;
    changes: Partial<Assignment>;
    teacherId: string 
  }>()
);

export const updateAssignmentSuccess = createAction(
  '[Assignment] Update Assignment Success',
  props<{ assignment: Assignment }>()
);

export const updateAssignmentFailure = createAction(
  '[Assignment] Update Assignment Failure',
  props<{ error: string }>()
);

// Delete Assignment
export const deleteAssignment = createAction(
  '[Assignment] Delete Assignment',
  props<{ 
    assignmentId: string;
    courseId: string;
    teacherId: string 
  }>()
);

export const deleteAssignmentSuccess = createAction(
  '[Assignment] Delete Assignment Success',
  props<{ assignmentId: string; courseId: string }>()
);

export const deleteAssignmentFailure = createAction(
  '[Assignment] Delete Assignment Failure',
  props<{ error: string }>()
);

// Submissions
export const loadSubmissions = createAction(
  '[Assignment] Load Submissions',
  props<{ assignmentId: string }>()
);

export const loadSubmissionsSuccess = createAction(
  '[Assignment] Load Submissions Success',
  props<{ submissions: Submission[] }>()
);

export const loadSubmissionsFailure = createAction(
  '[Assignment] Load Submissions Failure',
  props<{ error: string }>()
);

export const gradeSubmission = createAction(
  '[Assignment] Grade Submission',
  props<{ 
    submissionId: string;
    grade: { points: number; feedback: string };
    teacherId: string 
  }>()
);

export const gradeSubmissionSuccess = createAction(
  '[Assignment] Grade Submission Success',
  props<{ submission: Submission }>()
);

export const gradeSubmissionFailure = createAction(
  '[Assignment] Grade Submission Failure',
  props<{ error: string }>()
);