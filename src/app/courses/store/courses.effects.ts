import { Inject, inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, Observable, of } from 'rxjs';
import { map, switchMap, catchError, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as CourseActions from './courses.actions';
import * as fromAuth from '../../auth/store/auth.selectors';
import { Course } from '../../models/course';
import { User } from '../../models/user.model';
import { CourseService } from '../courses.service'; // Create this service

@Injectable({ providedIn: 'root' })
export class CourseEffects {
  loadCourses$:Observable<any>;
  constructor(
    private actions$: Actions,
    private courseService: CourseService,
    private store: Store
  ) {
    this.loadCourses$ = createEffect(() =>
    this.actions$.pipe( // Ensure actions$ is properly defined here
      ofType(CourseActions.loadCourses),
      withLatestFrom(this.store.select(fromAuth.selectCurrentUser)),
      switchMap(([_, user]) => {
        if (!user) {
          return of(CourseActions.loadCoursesFailure({ error: 'User not found' }));
        }
        return this.courseService.getCourses(user).pipe(
          map((courses: Course[]) => {
            // Filter courses based on user role
            let filteredCourses = courses;
            if (user.role === 'student') {
              filteredCourses = courses.filter(course => course.students?.includes(user.uid) || false);
            } else if (user.role === 'teacher') {
              filteredCourses = courses.filter(course => 
                course.teachers?.includes(user.uid) || course.createdBy === user.uid
              );
            }
            return CourseActions.loadCoursesSuccess({ courses: filteredCourses });
          }),
          catchError(error => of(CourseActions.loadCoursesFailure({ error })))
        );
      })
    )
  );}

  

  createCourse$ = createEffect(() => 
    this.actions$.pipe(
      ofType(CourseActions.createCourse),
      withLatestFrom(this.store.select(fromAuth.selectCurrentUser)),
      switchMap(([{ course }, user]) => {
        if (!user || user.role !== 'admin') {
          return of(CourseActions.createCourseFailure({ 
            error: 'Only administrators can create courses' 
          }));
        }
        
        const courseData: Omit<Course, 'id'> = {
          ...course,
          createdBy: user.uid,
          teachers: [],
          students: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return this.courseService.createCourse(courseData, user).pipe(
          map(createdCourse => CourseActions.createCourseSuccess({ 
            course: createdCourse 
          })),
          catchError(error => of(CourseActions.createCourseFailure({ 
            error: String(error) 
          })))
        );
      })
    )
  );

  enrollInCourse$ = createEffect(() => 
    this.actions$.pipe(
      ofType(CourseActions.enrollInCourse),
      switchMap(({ courseId, userId }) => 
        this.courseService.enrollStudent(courseId, userId).pipe(
          map(() => CourseActions.enrollInCourseSuccess({ courseId, userId })),
          catchError(error => of(CourseActions.enrollInCourseFailure({ 
            error: String(error) 
          })))
        )
      )
    )
  );
}