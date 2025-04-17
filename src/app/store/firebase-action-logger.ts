import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap, withLatestFrom } from 'rxjs/operators';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { Action } from '@ngrx/store';

import { selectCurrentUser } from '../store/auth/auth.selectors';
import { AuthActions } from '../store/auth/auth.actions';
import * as CourseActions from '../store/course/courses.actions';
import * as GradeActions from '../store/grades/grades.actions'

interface ActionLogEntry {
  timestamp: string;
  type: string;
  payload: any;
  userId?: string | null;
  userRole?: string | null;
  message: string;
}

interface ActionWithError extends Action {
  error?: string;
}

interface LoadUsersSuccessAction extends Action {
  users?: any[];
}

interface CourseAction extends Action {
  course?: any;
  courses?: any[];
  courseId?: string;
  userId?: string;
  teacherId?: string;
  adminId?: string;
  changes?: any;
}

interface CourseErrorAction extends CourseAction {
  error?: string;
}

interface GradeAction extends Action {
  courseId?: string;
  studentId?: string;
  grade?: number;
  grades?: any[];
}

interface GradeErrorAction extends GradeAction {
  error?: string;
}

@Injectable({providedIn: 'root'})
export class FirebaseActionLoggerEffects {
  private actionLogs: ActionLogEntry[] = [];
  
  constructor(
    private actions$: Actions,
    private firestore: Firestore,
    private store: Store
  ) {}

  // Auth action effects
  logLoginSuccess$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `User successfully logged in: ${user?.displayName || 'unknown'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logLoginFailure$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(AuthActions.loginFailure),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const errorAction = action as ActionWithError;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Login attempt failed: ${errorAction.error || 'Unknown error'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logLogout$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(AuthActions.logout),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `User logout initiated: ${user?.displayName || 'unknown'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logLogoutSuccess$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: 'anonymous',
          userRole: 'none',
          message: 'User successfully logged out'
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logRegisterSuccess$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `New user registered successfully: ${user?.displayName || 'unknown'} as ${user?.role}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logRegisterFailure$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(AuthActions.registerFailure),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const errorAction = action as ActionWithError;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Registration failed: ${errorAction.error || 'Unknown error'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logUpdateProfileSuccess$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(AuthActions.updateProfileSuccess),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Profile updated successfully for user: ${user?.displayName || 'unknown'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logUpdateProfileFailure$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(AuthActions.updateProfileFailure),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const errorAction = action as ActionWithError;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Profile update failed: ${errorAction.error || 'Unknown error'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logLoadUsers$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType('loadUsers'),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const typedAction = action as Action;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: typedAction.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Admin requested user list`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logLoadUsersSuccess$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType('loadUsersSuccess'),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const usersAction = action as LoadUsersSuccessAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: usersAction.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Successfully loaded ${(usersAction as any).users?.length || 0} users`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });

  // Course action effects
  logLoadCourses$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.loadCourses),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `User requested course list`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logLoadCoursesSuccess$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.loadCoursesSuccess),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const courseAction = action as CourseAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Successfully loaded ${courseAction.courses?.length || 0} courses for ${user?.displayName || 'unknown'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logLoadCoursesFailure$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.loadCoursesFailure),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const errorAction = action as CourseErrorAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Failed to load courses: ${errorAction.error || 'Unknown error'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logCreateCourse$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.createCourse),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const courseAction = action as CourseAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Admin attempting to create course: ${courseAction.course?.title || 'Unknown title'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logCreateCourseSuccess$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.createCourseSuccess),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const courseAction = action as CourseAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Course created successfully: ${courseAction.course?.title || 'Unknown title'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logCreateCourseFailure$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.createCourseFailure),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const errorAction = action as CourseErrorAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Failed to create course: ${errorAction.error || 'Unknown error'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logEnrollInCourse$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.enrollInCourse),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const courseAction = action as CourseAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Attempting to enroll user ${courseAction.userId} in course ${courseAction.courseId}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logEnrollInCourseSuccess$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.enrollInCourseSuccess),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const courseAction = action as CourseAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Successfully enrolled user ${courseAction.userId} in course ${courseAction.courseId}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logEnrollInCourseFailure$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.enrollInCourseFailure),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const errorAction = action as CourseErrorAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Failed to enroll in course: ${errorAction.error || 'Unknown error'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logUpdateCourse$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.updateCourse),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const courseAction = action as CourseAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Attempting to update course ${courseAction.courseId}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logUpdateCourseSuccess$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.updateCourseSuccess),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const courseAction = action as CourseAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Successfully updated course: ${courseAction.course?.title || courseAction.course?.id || 'Unknown'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logUpdateCourseFailure$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.updateCourseFailure),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const errorAction = action as CourseErrorAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Failed to update course: ${errorAction.error || 'Unknown error'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logAssignTeacherToCourse$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.assignTeacherToCourse),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const courseAction = action as CourseAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Admin attempting to assign teacher ${courseAction.teacherId} to course ${courseAction.courseId}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logAssignTeacherToCourseSuccess$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.assignTeacherToCourseSuccess),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const courseAction = action as CourseAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Successfully assigned teacher to course: ${courseAction.course?.title || courseAction.course?.id || 'Unknown'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logAssignTeacherToCourseFailure$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.assignTeacherToCourseFailure),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const errorAction = action as CourseErrorAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Failed to assign teacher to course ${errorAction.courseId}: ${errorAction.error || 'Unknown error'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logRemoveTeacherFromCourse$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.removeTeacherFromCourse),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const courseAction = action as CourseAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Admin attempting to remove teacher from course ${courseAction.courseId}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logRemoveTeacherFromCourseSuccess$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.removeTeacherFromCourseSuccess),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const courseAction = action as CourseAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Successfully removed teacher from course: ${courseAction.course?.title || courseAction.course?.id || 'Unknown'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  logRemoveTeacherFromCourseFailure$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(CourseActions.removeTeacherFromCourseFailure),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const errorAction = action as CourseErrorAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Failed to remove teacher from course ${errorAction.courseId}: ${errorAction.error || 'Unknown error'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });

  // 

  // Grade action effects
  logLoadGrades$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(GradeActions.loadGrades),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const gradeAction = action as GradeAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `User requested grades for course ${gradeAction.courseId}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });

  logLoadGradesSuccess$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(GradeActions.loadGradesSuccess),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const gradeAction = action as GradeAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Successfully loaded ${gradeAction.grades?.length || 0} grades`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });

  logLoadGradesFailure$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(GradeActions.loadGradesFailure),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const errorAction = action as GradeErrorAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Failed to load grades: ${errorAction.error || 'Unknown error'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });

  logAddGrade$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(GradeActions.addGrade),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const gradeAction = action as GradeAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Attempting to add grade for student ${gradeAction.studentId} in course ${gradeAction.courseId}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });

  logAddGradeSuccess$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(GradeActions.addGradeSuccess),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Successfully added grade to the system`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });

  logAddGradeFailure$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
    
    return this.actions$.pipe(
      ofType(GradeActions.addGradeFailure),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const errorAction = action as GradeErrorAction;
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none',
          message: `Failed to add grade: ${errorAction.error || 'Unknown error'}`
        };
        
        this.addLogEntry(logEntry);
      })
    );
  }, { dispatch: false });
  
  // 
  
  // logOtherActions$ = createEffect(() => {
  //   const currentUser$ = this.store.select(selectCurrentUser);
    
  //   return this.actions$.pipe(
  //     ofType('*'),
  //     withLatestFrom(currentUser$),
  //     tap(([action, user]) => {
  //       const typedAction = action as Action;
        
  //       if (typedAction.type.startsWith('[NgRx/Store') || 
  //           typedAction.type.startsWith('[Logger') || 
  //           typedAction.type.startsWith('[Auth]') ||
  //           typedAction.type.startsWith('[Course]') ||
  //         typedAction.type.startsWith('[Grade]')) {
  //         return;
  //       }
        
  //       const actionCategory = typedAction.type.match(/\[(.*?)\]/)?.[1] || '';
  //       const actionName = actionCategory ? 
  //         typedAction.type.replace(`[${actionCategory}] `, '') : 
  //         typedAction.type;
          
  //       const logEntry: ActionLogEntry = {
  //         timestamp: new Date().toISOString(),
  //         type: typedAction.type,
  //         payload: this.sanitizePayload(action),
  //         userId: user?.uid || 'anonymous',
  //         userRole: user?.role || 'none',
  //         message: actionCategory ? 
  //           `${actionCategory} action: ${actionName}` : 
  //           `Action executed: ${typedAction.type}`
  //       };
        
  //       this.addLogEntry(logEntry);
  //     })
  //   );
  // }, { dispatch: false });

  private addLogEntry(logEntry: ActionLogEntry) {
    this.actionLogs.push(logEntry);
    if (this.actionLogs.length >= 1) {
      this.writeLogsToFirestore();
    }
  }
  
  private sanitizePayload(action: any): any {
    try {
      const sanitized = JSON.parse(JSON.stringify(action));
      
      if (sanitized.password) delete sanitized.password;
      if (sanitized.credentials) delete sanitized.credentials;
      
      const actionStr = JSON.stringify(sanitized);
      if (actionStr.length > 10000) {
        return {
          note: "Payload truncated due to size",
          actionType: sanitized.type
        };
      }
      
      return sanitized;
    } catch (error) {
      return { type: (action as Action).type, note: "Payload could not be serialized" };
    }
  }
  
  async writeLogsToFirestore() {
    try {
      const logsCollectionRef = collection(this.firestore, 'action_logs');
      
      for (const log of this.actionLogs) {
        await addDoc(logsCollectionRef, log);
      }
      
      const count = this.actionLogs.length;
      this.actionLogs = [];
      console.log(`Successfully wrote ${count} logs to Firestore`);
      
    } catch (error) {
      console.error('Error writing logs to Firestore:', error);
    }
  }
  
  async flushLogs() {
    if (this.actionLogs.length > 0) {
      await this.writeLogsToFirestore();
    }
  }
}