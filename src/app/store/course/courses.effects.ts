import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as CourseActions from './courses.actions';
import * as fromAuth from '../auth/auth.selectors';
import { Course } from '../../models/course';
import { User } from '../../models/user.model';
import { CourseService } from '../../courses/courses.service';

@Injectable({ providedIn: 'root' })
export class CourseEffects {
  // constructor(
  //   private actions$: Actions,
  //   private courseService: CourseService,
  //   private store: Store
  // ) {}

  loadCourses$:Observable<any>;
  constructor(
    private actions$: Actions,
    private courseService: CourseService,
    private store: Store
  ) {
    this.loadCourses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CourseActions.loadCourses),
      withLatestFrom(this.store.select(fromAuth.selectCurrentUser)),
      switchMap(([_, user]) => {
        if (!user) {
          return of(CourseActions.loadCoursesFailure({ error: 'User not found' }));
        }
        return this.courseService.getCourses(user).pipe(
          map((courses: Course[]) => {
            // Filter courses based on user role
            // let filteredCourses = courses;
            // if (user.role === 'student') {
            //   filteredCourses = courses.filter(course => course.studentIds?.includes(user.uid) || false);
            // } else if (user.role === 'teacher') {
            //   filteredCourses = courses.filter(course => 
            //     course.teacherId?.includes(user.uid) || course.createdBy === user.uid
            //   );
            // }
            return CourseActions.loadCoursesSuccess({ courses });
          }),
          catchError(error => of(CourseActions.loadCoursesFailure({ error })))
        );
      })
    )
  );

}

  createCourse$ = createEffect(() => 
    this.actions$.pipe(
      ofType(CourseActions.createCourse),
      withLatestFrom(this.store.select(fromAuth.selectCurrentUser)),
      switchMap(([{ course, user: requestingUser }, currentUser]) => {
        if (!currentUser || currentUser.role !== 'admin') {
          return of(CourseActions.createCourseFailure({ 
            error: 'Only administrators can create courses' 
          }));
        }

        const courseData: Omit<Course, 'id'> = {
          ...course,
          createdBy: currentUser.uid,
          teacherId: course.teacherId,
          studentIds: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return this.courseService.createCourse(courseData , currentUser).pipe(
          map(createdCourse => CourseActions.createCourseSuccess({ 
            course: createdCourse 
          })),
          catchError(error => of(CourseActions.createCourseFailure({ 
            error: error.message 
          })))
        );
      })
    )
  );

  enrollInCourse$ = createEffect(() => 
    this.actions$.pipe(
      ofType(CourseActions.enrollInCourse),
      withLatestFrom(this.store.select(fromAuth.selectCurrentUser)),
      switchMap(([{ courseId, userId }, currentUser]) => {
        if (currentUser?.role !== 'admin' && currentUser?.uid !== userId) {
          return of(CourseActions.enrollInCourseFailure({ 
            error: 'Unauthorized enrollment attempt' 
          }));
        }

        return this.courseService.enrollStudent(courseId, userId).pipe(
          map(() => CourseActions.enrollInCourseSuccess({ courseId, userId })),
          catchError(error => of(CourseActions.enrollInCourseFailure({ 
            error: error.message 
          })))
        );
      })
    )
  );

updateCourse$ = createEffect(() =>
  this.actions$.pipe(
    ofType(CourseActions.updateCourse),
    switchMap(({ courseId, changes }) =>
      this.courseService.updateCourse(courseId, changes).pipe(
        map(updatedCourse => CourseActions.updateCourseSuccess({ course: updatedCourse })),
        catchError(error => of(CourseActions.updateCourseFailure({ error: error.message })))
      )
    )
  )
);

  assignTeacherToCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CourseActions.assignTeacherToCourse),
      withLatestFrom(this.store.select(fromAuth.selectCurrentUser)),
      switchMap(([{ courseId, teacherId, adminId }, currentUser]) => {
        if (currentUser?.uid !== adminId || currentUser?.role !== 'admin') {
          return of(CourseActions.assignTeacherToCourseFailure({
            error: 'Only administrators can assign teachers',
            courseId
          }));
        }

        return this.courseService.assignTeacher(courseId, teacherId).pipe(
          map(updatedCourse => CourseActions.assignTeacherToCourseSuccess({
            course: updatedCourse
          })),
          catchError(error => of(CourseActions.assignTeacherToCourseFailure({
            error: error.message,
            courseId
          })))
        );
      })
    )
  );

  removeTeacherFromCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CourseActions.removeTeacherFromCourse),
      withLatestFrom(this.store.select(fromAuth.selectCurrentUser)),
      switchMap(([{ courseId, adminId }, currentUser]) => {
        if (currentUser?.uid !== adminId || currentUser?.role !== 'admin') {
          return of(CourseActions.removeTeacherFromCourseFailure({
            error: 'Only administrators can remove teachers',
            courseId
          }));
        }

        return this.courseService.removeTeacher(courseId).pipe(
          map(updatedCourse => CourseActions.removeTeacherFromCourseSuccess({
            course: updatedCourse
          })),
          catchError(error => of(CourseActions.removeTeacherFromCourseFailure({
            error: error.message,
            courseId
          })))
        );
      })
    )
  );
}
