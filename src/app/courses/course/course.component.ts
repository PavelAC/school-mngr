
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, from, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { UserListComponent } from '../../student-list/user-list.component';

import { Course } from '../../models/course';
import { User } from '../../models/user.model';
import * as CourseActions from '../../store/course/courses.actions';
import * as fromAuth from '../../store/auth/auth.selectors';
import * as fromCourse from '../../store/course/courses.selectors';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule, UserListComponent],
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {
  @Input() course: Course | null = null;
  
  currentUser$: Observable<User | null>; 
  showTeacherAssignment = false; 
  teacher$: Observable<User | null> = of(null);
  creator$!: Observable<User | null>;
  students$: Observable<User[]> = of([]);
  
  get courseId(): string | null {
    return this.course?.id || null;
  }

  constructor(private firestore: Firestore, private store: Store) {
    this.currentUser$ = this.store.select(fromAuth.selectCurrentUser);
  }

  ngOnInit(): void {
    console.log('Course studentIds:', this.course?.studentIds);
    if (this.course?.teacherId) {
      this.teacher$ = this.getUser(this.course.teacherId);
    } else {
      this.teacher$ = of(null);
    }
    this.creator$ = this.getUser(this.course!.createdBy);

    if (this.course?.studentIds?.length) {
      this.students$ = this.getUsers(this.course.studentIds);
      // Add logging to see if this path is taken
      console.log('Loading enrolled students');
      
      // Subscribe to log the actual students being loaded
      this.students$.subscribe(students => {
        console.log('Enrolled students:', students);
      });
    } else {
      this.students$ = of([]);
      console.log('No enrolled students');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['course'] && this.course) {
      this.loadTeacherData();
      this.loadStudentsData(); // Added this line
    }
  }

  private loadTeacherData(): void {
    if (!this.course?.teacherId) {
      this.teacher$ = of(null);
      return;
    }

    this.teacher$ = from(getDoc(doc(this.firestore, `users/${this.course.teacherId}`))).pipe(
      map(docSnap => {
        if (!docSnap.exists()) return null;
        return { uid: docSnap.id, ...docSnap.data() } as User;
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  private loadStudentsData(): void {
    if (!this.course?.studentIds?.length) {
      this.students$ = of([]);
      return;
    }
    
    this.students$ = this.getUsers(this.course.studentIds);
  }

  private getUser(uid: string): Observable<User | null> {
    const userRef = doc(this.firestore, `users/${uid}`);
    return from(getDoc(userRef)).pipe(
      map(docSnap => {
        if (!docSnap.exists()) return null;
        return { uid: docSnap.id, ...docSnap.data() } as User;
      })
    );
  }

  private getUsers(uids: string[]): Observable<User[]> {
    if (!uids.length) return of([]);
    
    return from(Promise.all(
      uids.map(uid => getDoc(doc(this.firestore, `users/${uid}`)))
    )).pipe(
      map(docSnaps => 
        docSnaps
          .filter(docSnap => docSnap.exists())
          .map(docSnap => ({ 
            uid: docSnap.id, 
            ...docSnap.data() 
          } as User))
      ),
      catchError(() => of([]))
    );
  }

  assignTeacher(teacher: User): void {
    const courseId = this.getCourseId();
    if (!teacher?.uid || !courseId) return;
    
    this.currentUser$.pipe(take(1)).subscribe(currentUser => {
      if (currentUser?.role === 'admin') {
        this.store.dispatch(CourseActions.assignTeacherToCourse({
          courseId: courseId as string,
          teacherId: teacher.uid,
          adminId: currentUser.uid
        }));
        this.showTeacherAssignment = false;
      }
    });
  }

  enrollStudent(studentId: string): void {
    if (!studentId || !this.courseId) return;
    
    this.store.dispatch(CourseActions.enrollInCourse({
      courseId: this.courseId,
      userId: studentId
    }));
  }

  removeTeacher(): void {
    const courseId = this.getCourseId();
    if (!courseId) return;
    
    this.currentUser$.pipe(take(1)).subscribe(currentUser => {
      if (currentUser?.uid) {
        this.store.dispatch(CourseActions.removeTeacherFromCourse({
          courseId: courseId as string,
          adminId: currentUser.uid
        }));
      }
    });
  }

  editCourse(): void {
    if (this.courseId) {
      this.store.dispatch(CourseActions.editCourse({ courseId: this.courseId }));
      // Navigate to edit page if needed
    }
  }

  saveCourseChanges(changes: Partial<Course>): void {
    if (this.courseId) {
      this.store.dispatch(CourseActions.updateCourse({
        courseId: this.courseId,
        changes
      }));
    }
  }

  toggleTeacherAssignment(): void {
    this.showTeacherAssignment = !this.showTeacherAssignment;
  }
  
  private getCourseId(): string | null {
    return this.course?.id || null;
  }
}

// import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
// import { Store } from '@ngrx/store';
// import { Observable, combineLatest, from, of } from 'rxjs';
// import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
// import { CommonModule } from '@angular/common';
// import { UserListComponent } from '../../student-list/user-list.component';

// import { Course } from '../../models/course';
// import { User } from '../../models/user.model';
// import * as CourseActions from '../../store/course/courses.actions';
// import * as fromAuth from '../../store/auth/auth.selectors';
// import * as fromCourse from '../../store/course/courses.selectors';
// import { doc, Firestore, getDoc, collection, getDocs, query, where } from '@angular/fire/firestore';

// @Component({
//   selector: 'app-course',
//   standalone: true,
//   imports: [CommonModule, UserListComponent],
//   templateUrl: './course.component.html',
//   styleUrls: ['./course.component.css']
// })
// export class CourseComponent implements OnInit {
//   @Input() course: Course | null = null;
  
//   currentUser$: Observable<User | null>; 
//   showTeacherAssignment = false; 
//   teacher$: Observable<User | null> = of(null);
//   creator$!: Observable<User | null>;
//   students$: Observable<User[]> = of([]);
  
//   // New properties for enrollment requests
//   enrollmentRequests$: Observable<User[]> = of([]);
//   isTeacher = false;
  
//   get courseId(): string | null {
//     return this.course?.id || null;
//   }

//   constructor(private firestore: Firestore, private store: Store) {
//     this.currentUser$ = this.store.select(fromAuth.selectCurrentUser);
//   }

//   ngOnInit(): void {
//     console.log('Course studentIds:', this.course?.studentIds);
//     if (this.course?.teacherId) {
//       this.teacher$ = this.getUser(this.course.teacherId);
//     } else {
//       this.teacher$ = of(null);
//     }
//     this.creator$ = this.getUser(this.course!.createdBy);

//     if (this.course?.studentIds?.length) {
//       this.students$ = this.getUsers(this.course.studentIds);
//       console.log('Loading enrolled students');
      
//       this.students$.subscribe(students => {
//         console.log('Enrolled students:', students);
//       });
//     } else {
//       this.students$ = of([]);
//       console.log('No enrolled students');
//     }
    
//     // Check if current user is teacher of this course
//     this.currentUser$.pipe(take(1)).subscribe(user => {
//       if (user && this.course && user.uid === this.course.teacherId) {
//         this.isTeacher = true;
//         // Load enrollment requests if user is teacher
//         this.loadEnrollmentRequests();
//       }
//     });
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['course'] && this.course) {
//       this.loadTeacherData();
//       this.loadStudentsData();
      
//       // Check teacher status again when course changes
//       this.currentUser$.pipe(take(1)).subscribe(user => {
//         if (user && this.course && user.uid === this.course.teacherId) {
//           this.isTeacher = true;
//           this.loadEnrollmentRequests();
//         } else {
//           this.isTeacher = false;
//         }
//       });
//     }
//   }

//   private loadTeacherData(): void {
//     if (!this.course?.teacherId) {
//       this.teacher$ = of(null);
//       return;
//     }

//     this.teacher$ = from(getDoc(doc(this.firestore, `users/${this.course.teacherId}`))).pipe(
//       map(docSnap => {
//         if (!docSnap.exists()) return null;
//         return { uid: docSnap.id, ...docSnap.data() } as User;
//       }),
//       catchError(() => {
//         return of(null);
//       })
//     );
//   }

//   private loadStudentsData(): void {
//     if (!this.course?.studentIds?.length) {
//       this.students$ = of([]);
//       return;
//     }
    
//     this.students$ = this.getUsers(this.course.studentIds);
//   }
  

//   private getUser(uid: string): Observable<User | null> {
//     const userRef = doc(this.firestore, `users/${uid}`);
//     return from(getDoc(userRef)).pipe(
//       map(docSnap => {
//         if (!docSnap.exists()) return null;
//         return { uid: docSnap.id, ...docSnap.data() } as User;
//       })
//     );
//   }

//   private getUsers(uids: string[]): Observable<User[]> {
//     if (!uids.length) return of([]);
    
//     return from(Promise.all(
//       uids.map(uid => getDoc(doc(this.firestore, `users/${uid}`)))
//     )).pipe(
//       map(docSnaps => 
//         docSnaps
//           .filter(docSnap => docSnap.exists())
//           .map(docSnap => ({ 
//             uid: docSnap.id, 
//             ...docSnap.data() 
//           } as User))
//       ),
//       catchError(() => of([]))
//     );
//   }

//   assignTeacher(teacher: User): void {
//     const courseId = this.getCourseId();
//     if (!teacher?.uid || !courseId) return;
    
//     this.currentUser$.pipe(take(1)).subscribe(currentUser => {
//       if (currentUser?.role === 'admin') {
//         this.store.dispatch(CourseActions.assignTeacherToCourse({
//           courseId: courseId as string,
//           teacherId: teacher.uid,
//           adminId: currentUser.uid
//         }));
//         this.showTeacherAssignment = false;
//       }
//     });
//   }

//   // For students to request enrollment
//   enrollStudent(studentId: string): void {
//     if (!studentId || !this.courseId) return;
    
//     this.store.dispatch(CourseActions.enrollInCourse({
//       courseId: this.courseId,
//       userId: studentId
//     }));
//   }

//   // Legacy enrollment function
//   // enrollStudent(studentId: string): void {
//   //   if (!studentId || !this.courseId) return;
    
//   //   this.store.dispatch(CourseActions.enrollInCourse({
//   //     courseId: this.courseId,
//   //     userId: studentId
//   //   }));
//   // }

//   removeTeacher(): void {
//     const courseId = this.getCourseId();
//     if (!courseId) return;
    
//     this.currentUser$.pipe(take(1)).subscribe(currentUser => {
//       if (currentUser?.uid) {
//         this.store.dispatch(CourseActions.removeTeacherFromCourse({
//           courseId: courseId as string,
//           adminId: currentUser.uid
//         }));
//       }
//     });
//   }

//   editCourse(): void {
//     if (this.courseId) {
//       this.store.dispatch(CourseActions.editCourse({ courseId: this.courseId }));
//       // Navigate to edit page if needed
//     }
//   }

//   saveCourseChanges(changes: Partial<Course>): void {
//     if (this.courseId) {
//       this.store.dispatch(CourseActions.updateCourse({
//         courseId: this.courseId,
//         changes
//       }));
//     }
//   }

//   toggleTeacherAssignment(): void {
//     this.showTeacherAssignment = !this.showTeacherAssignment;
//   }
  
//   private getCourseId(): string | null {
//     return this.course?.id || null;
//   }
// }