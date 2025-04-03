import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc, 
  doc, 
  updateDoc, 
  getDoc 
} from '@angular/fire/firestore';
import { 
  loadGrades, 
  loadGradesSuccess, 
  loadGradesFailure, 
  addGrade, 
  addGradeSuccess, 
  addGradeFailure 
} from './grades.actions';
import { Grade } from '../../models/grade.model';

@Injectable()
export class GradesEffects {
    loadGrades$:Observable<any>

    constructor(
        private actions$: Actions,
        private firestore: Firestore
      ) {this.loadGrades$ = createEffect(() => this.actions$.pipe(
        ofType(loadGrades),
        mergeMap(({ courseId }) => 
          // Convert the Promise to an Observable using 'from'
          from(getDocs(query(
            collection(this.firestore, 'grades'),
            where('courseId', '==', courseId)
          ))).pipe(
            map(snapshot => {
              const grades = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
              } as Grade));
              return loadGradesSuccess({ grades });
            }),
            catchError(error => of(loadGradesFailure({ error: error.message })))
          )
        )
      ));}
  

  addGrade$ = createEffect(() => this.actions$.pipe(
    ofType(addGrade),
    mergeMap(({ courseId, studentId, grade }) => {
      const gradeId = `${courseId}_${studentId}`;
      
      // First check if the grade document already exists
      return from(getDoc(doc(this.firestore, 'grades', gradeId))).pipe(
        switchMap(docSnap => {
          if (docSnap.exists()) {
            // Document exists, update it by adding the new grade
            const existingData = docSnap.data() as Grade;
            const newGrades = [...(existingData.grades || []), grade];
            const average = newGrades.reduce((sum, g) => sum + g, 0) / newGrades.length;
            
            return from(updateDoc(doc(this.firestore, 'grades', gradeId), {
              grades: newGrades,
              average: average,
              lastUpdated: new Date()
            }));
          } else {
            // Document doesn't exist, create a new one
            return from(setDoc(doc(this.firestore, 'grades', gradeId), {
              courseId,
              studentId,
              grades: [grade],
              average: grade,
              lastUpdated: new Date()
            }));
          }
        }),
        map(() => addGradeSuccess()),
        catchError(error => of(addGradeFailure({ error: error.message })))
      );
    })
  ));

  
}