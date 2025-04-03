// store/grades/grades.actions.ts
import { createAction, props } from '@ngrx/store';
import { Grade } from '../../models/grade.model';

export const loadGrades = createAction(
    '[Grades] Load Grades',
    props<{ courseId: string }>()
  );
  
  export const loadGradesSuccess = createAction(
    '[Grades] Load Grades Success',
    props<{ grades: Grade[] }>()
  );
  
  export const loadGradesFailure = createAction(
    '[Grades] Load Grades Failure',
    props<{ error: string }>()
  );
  
  export const addGrade = createAction(
    '[Grades] Add Grade',
    props<{ courseId: string, studentId: string, grade: number }>()
  );
  
  export const addGradeSuccess = createAction('[Grades] Add Grade Success');
  
  export const addGradeFailure = createAction(
    '[Grades] Add Grade Failure',
    props<{ error: string }>()
  );