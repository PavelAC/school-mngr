import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GradesState } from './grades.reducer';

export const selectGradesState = createFeatureSelector<GradesState>('grades');

// Safe selector with fallback
export const selectAllGrades = createSelector(
    selectGradesState,
    (state) => state?.grades || []  // Fallback to empty array if state is undefined
  );
  
  // Safe course grades selector
  export const selectCourseGrades = (courseId: string) => createSelector(
    selectAllGrades,
    (grades) => {
      if (!grades) return [];
      return grades.filter(grade => grade?.courseId === courseId);
    }
  );
  
  // Safe student course grades selector
  export const selectStudentCourseGrades = (courseId: string, studentId: string) => 
    createSelector(
      selectAllGrades,
      (grades) => {
        if (!grades) return undefined;
        return grades.find(g => 
          g?.courseId === courseId && 
          g?.studentId === studentId
        );
      }
    );