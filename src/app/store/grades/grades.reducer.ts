import { createReducer, on } from '@ngrx/store';
import { Grade } from '../../models/grade.model';
import { addGrade, loadGradesSuccess } from './grades.actions';

export interface GradesState {
  grades: Grade[];
  loading: boolean;
  error: string | null;
}

export const initialState: GradesState = {
  grades: [],
  loading: false,
  error: null
};

export const gradesReducer = createReducer(
  initialState,
  on(loadGradesSuccess, (state, { grades }) => ({
    ...state,
    grades,
    loading: false
  })),
  on(addGrade, (state, { courseId, studentId, grade }) => {
    const existingGradeIndex = state.grades.findIndex(
      g => g.courseId === courseId && g.studentId === studentId
    );
    
    const updatedGrades = [...state.grades];
    if (existingGradeIndex >= 0) {
      const existing = updatedGrades[existingGradeIndex];
      updatedGrades[existingGradeIndex] = {
        ...existing,
        grades: [...existing.grades, grade],
        average: calculateAverage([...existing.grades, grade]),
      };
    } else {
      updatedGrades.push({
        courseId,
        studentId,
        grades: [grade],
        average: grade,
      });
    }
    
    return { ...state, grades: updatedGrades };
  })
);

function calculateAverage(grades: number[]): number {
  return grades.reduce((a, b) => a + b, 0) / grades.length;
}