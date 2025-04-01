import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import * as AssignmentActions from './assignment.actions';
import { AssignmentService } from '../../assigments/assigment.service';
import { AuthService } from '../../auth/services/auth.service';
import { Assignment } from '../../models/assigment';

@Injectable()
export class AssignmentEffects {
  constructor(
    private actions$: Actions,
    private assignmentService: AssignmentService,
    private authService: AuthService
  ) {}

  // Load Assignments Effect
  loadAssignments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssignmentActions.loadAssignments),
      switchMap(({ courseId }) =>
        this.assignmentService.getAssignments(courseId).pipe(
          map(assignments => AssignmentActions.loadAssignmentsSuccess({ assignments })),
          catchError(error => of(AssignmentActions.loadAssignmentsFailure({ 
            error: error.message 
          })))
      )
    )
  ));

  // Create Assignment Effect
  createAssignment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssignmentActions.createAssignment),
      withLatestFrom(this.authService.currentUser$),
      switchMap(([{ courseId, assignment, teacherId }, currentUser]) => {
        // Verify the current user is the assigned teacher
        if (!currentUser || currentUser.uid !== teacherId) {
          return of(AssignmentActions.createAssignmentFailure({ 
            error: 'Unauthorized: Only assigned teacher can create assignments' 
          }));
        }
  
        return this.assignmentService.createAssignment(courseId, assignment).pipe(
          map(newAssignment => AssignmentActions.createAssignmentSuccess({ 
            assignment: newAssignment 
          })),
          catchError(error => of(AssignmentActions.createAssignmentFailure({ 
            error: error.message 
          })))
        );
      })
    )
  );

  // Delete Assignment Effect
  deleteAssignment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssignmentActions.deleteAssignment),
      withLatestFrom(this.authService.currentUser$),
      switchMap(([{ assignmentId, courseId, teacherId }, currentUser]) => {
        if (currentUser?.uid !== teacherId) {
          return of(AssignmentActions.deleteAssignmentFailure({ 
            error: 'Unauthorized: Only course teacher can delete assignments' 
          }));
        }

        return this.assignmentService.deleteAssignment(assignmentId, courseId).pipe(
          map(() => AssignmentActions.deleteAssignmentSuccess({ 
            assignmentId, 
            courseId 
          })),
          catchError(error => of(AssignmentActions.deleteAssignmentFailure({ 
            error: error.message 
          })))
        );
      })
    )
  );

  // Load Submissions Effect
  loadSubmissions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssignmentActions.loadSubmissions),
      switchMap(({ assignmentId }) =>
        this.assignmentService.getSubmissions(assignmentId).pipe(
          map(submissions => AssignmentActions.loadSubmissionsSuccess({ submissions })),
          catchError(error => of(AssignmentActions.loadSubmissionsFailure({ 
            error: error.message 
          })))
        )
      )
    )
  );

  // Grade Submission Effect
  gradeSubmission$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssignmentActions.gradeSubmission),
      withLatestFrom(this.authService.currentUser$),
      switchMap(([{ submissionId, grade, teacherId }, currentUser]) => {
        if (currentUser?.uid !== teacherId) {
          return of(AssignmentActions.gradeSubmissionFailure({ 
            error: 'Unauthorized: Only teachers can grade submissions' 
          }));
        }

        return this.assignmentService.gradeSubmission(submissionId, grade, teacherId).pipe(
          map(submission => AssignmentActions.gradeSubmissionSuccess({ submission })),
          catchError(error => of(AssignmentActions.gradeSubmissionFailure({ 
            error: error.message 
          })))
        );
      })
    )
  );
}