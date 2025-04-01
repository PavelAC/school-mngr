import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  arrayUnion,
  arrayRemove,
  getDoc,
  Query,
  QuerySnapshot,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, combineLatest, from, map, switchMap, tap, throwError } from 'rxjs';
import { Course } from '../models/course';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private firestore: Firestore = inject(Firestore);

  getCourses(user: User): Observable<Course[]> {
    console.log('Getting courses for:', user.uid, 'Role:', user.role);
    const coursesRef = collection(this.firestore, 'courses');
    
    let coursesQuery;
    if (user.role === 'student') {
      console.log('Creating student query');
      coursesQuery = query(coursesRef, where('studentIds', 'array-contains', user.uid));
    } else if (user.role === 'teacher') {
      console.log('Creating teacher query');
      coursesQuery = query(
        coursesRef,
        where('teacherId', '==', user.uid)
      );
    } else {
      console.log('Creating admin query');
      coursesQuery = query(coursesRef);
    }
  
    return from(getDocs(coursesQuery)).pipe(
      tap(snapshot => console.log('Firestore returned:', snapshot.size, 'docs')),
      map(snapshot => {
        const courses = snapshot.docs.map(doc => {
          console.log('Processing doc:', doc.id);
          return {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data()['createdAt']?.toDate?.() || null,
            updatedAt: doc.data()['updatedAt']?.toDate?.() || null
          } as Course;
        });
        console.log('Mapped courses:', courses);
        return courses;
      })
    );
  }
  
  private mapDocsToCourses(snapshot: QuerySnapshot<DocumentData>): Course[] {
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Ensure dates are properly converted
      createdAt: doc.data()['createdAt']?.toDate(),
      updatedAt: doc.data()['updatedAt']?.toDate()
    } as Course));
  }

  createCourse(courseData: Omit<Course, 'id'>, user: User): Observable<Course> {
    if (user.role !== 'admin') {
      return throwError(() => new Error('Only admins can create courses'));
    }

    const coursesRef = collection(this.firestore, 'courses');
    const newCourse = {
      ...courseData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return from(addDoc(coursesRef, newCourse)).pipe(
      map(docRef => ({
        id: docRef.id,
        ...newCourse
      } as Course))
    );
  }

  enrollStudent(courseId: string, userId: string): Observable<Course> {
    const courseRef = doc(this.firestore, `courses/${courseId}`);
    const userRef = doc(this.firestore, `users/${userId}`);

    return from(getDoc(courseRef)).pipe(
      switchMap(courseSnap => {
        if (!courseSnap.exists()) {
          return throwError(() => new Error('Course not found'));
        }

        return from(Promise.all([
          updateDoc(courseRef, {
            studentIds: arrayUnion(userId),
            updatedAt: new Date()
          }),
          updateDoc(userRef, {
            enrolledCourseIds: arrayUnion(courseId),
            updatedAt: new Date()
          })
        ])).pipe(
          switchMap(() => this.getCourseById(courseId))
        );
      })
    );
  }

  assignTeacher(courseId: string, teacherId: string): Observable<Course> {
    // First verify the teacher exists and has teacher role
    return from(getDoc(doc(this.firestore, `users/${teacherId}`))).pipe(
      switchMap(teacherSnap => {
        if (!teacherSnap.exists() || teacherSnap.data()?.['role'] !== 'teacher') {
          return throwError(() => new Error('Invalid teacher ID or user is not a teacher'));
        }

        const courseRef = doc(this.firestore, `courses/${courseId}`);
        return from(updateDoc(courseRef, {
          teacherId,
          updatedAt: new Date()
        })).pipe(
          switchMap(() => this.getCourseById(courseId))
        );
      })
    );
  }

  removeTeacher(courseId: string): Observable<Course> {
    const courseRef = doc(this.firestore, `courses/${courseId}`);
    return from(updateDoc(courseRef, {
      teacherId: null,
      updatedAt: new Date()
    })).pipe(
      switchMap(() => this.getCourseById(courseId))
    );
  }

  getCourseById(courseId: string): Observable<Course> {
    const courseRef = doc(this.firestore, `courses/${courseId}`);
    return from(getDoc(courseRef)).pipe(
      map(snapshot => {
        if (!snapshot.exists()) {
          throw new Error('Course not found');
        }
        return {
          id: snapshot.id,
          ...snapshot.data()
        } as Course;
      })
    );
  }

  unenrollStudent(courseId: string, userId: string): Observable<Course> {
    const courseRef = doc(this.firestore, `courses/${courseId}`);
    const userRef = doc(this.firestore, `users/${userId}`);

    return from(Promise.all([
      updateDoc(courseRef, {
        studentIds: arrayRemove(userId),
        updatedAt: new Date()
      }),
      updateDoc(userRef, {
        enrolledCourseIds: arrayRemove(courseId),
        updatedAt: new Date()
      })
    ])).pipe(
      switchMap(() => this.getCourseById(courseId))
    );
  }

  updateCourse(courseId: string, changes: Partial<Course>): Observable<Course> {
    const courseRef = doc(this.firestore, `courses/${courseId}`);
    return from(updateDoc(courseRef, {
      ...changes,
      updatedAt: new Date()
    })).pipe(
      switchMap(() => this.getCourseById(courseId))
    );
  }
  
}