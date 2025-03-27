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
  arrayUnion 
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Course } from '../models/course';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private firestore: Firestore = inject(Firestore);

  getCourses(user: User): Observable<Course[]> {
    const coursesRef = collection(this.firestore, 'courses');
    
    let coursesQuery;
    if (user.role === 'student') {
      coursesQuery = query(
        coursesRef, 
        where('students', 'array-contains', user.uid)
      );
    } else if (user.role === 'teacher') {
      coursesQuery = query(
        coursesRef, 
        where('teachers', 'array-contains', user.uid)
      );
    } else {
      // Admin sees all courses
      coursesQuery = coursesRef;
    }

    return from(getDocs(coursesQuery)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Course))
      )
    );
  }

  createCourse(course: Omit<Course, 'id'>, user: User): Observable<Course> {
    if (user.role !== 'admin' && user.role !== 'teacher') {
      throw new Error('Permission denied: User does not have the required role to create a course.');
    }

    const coursesRef = collection(this.firestore, 'courses');
    return from(addDoc(coursesRef, course)).pipe(
      map(docRef => ({
        id: docRef.id,
        ...course
      }))
    );
  }

  enrollStudent(courseId: string, userId: string): Observable<void> {
    const courseRef = doc(this.firestore, `courses/${courseId}`);
    const userRef = doc(this.firestore, `users/${userId}`);

    const updateCoursePromise = updateDoc(courseRef, {
      students: arrayUnion(userId),
      updatedAt: new Date()
    });
    
    const updateUserPromise = updateDoc(userRef, {
      enrolledCourses: arrayUnion(courseId),
      updatedAt: new Date()
    });
    
    return from(Promise.all([updateCoursePromise, updateUserPromise])).pipe(
      map(() => {})
    );
  }
}
