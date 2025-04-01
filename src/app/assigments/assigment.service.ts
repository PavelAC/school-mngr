import { Injectable } from '@angular/core';
import { 
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  arrayUnion,
  getDoc
} from '@angular/fire/firestore';
import { from, Observable, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Assignment } from '../models/assigment';
import { Submission } from '../models/submission';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  constructor(private firestore: Firestore) {}

  // Get all assignments for a course
  getAssignments(courseId: string): Observable<Assignment[]> {
    const assignmentsRef = collection(this.firestore, 'assignments');
    const q = query(
      assignmentsRef,
      where('courseId', '==', courseId),
      orderBy('createdAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Assignment))
      ),
      catchError(error => throwError(() => new Error('Failed to load assignments')))
    );
  }

  // Get a single assignment by ID
  getAssignment(assignmentId: string): Observable<Assignment> {
    const assignmentRef = doc(this.firestore, `assignments/${assignmentId}`);
    return from(getDoc(assignmentRef)).pipe(
      map(snapshot => {
        if (!snapshot.exists()) {
          throw new Error('Assignment not found');
        }
        return {
          id: snapshot.id,
          ...snapshot.data()
        } as Assignment;
      }),
      catchError(error => throwError(() => new Error('Failed to load assignment')))
    );
  }

  // Create a new assignment
  createAssignment(courseId: string, assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'submissionIds' | 'courseId'>): Observable<Assignment> {
    const assignmentsRef = collection(this.firestore, 'assignments');
    
    // Create complete assignment object with all required fields
    const newAssignment: Omit<Assignment, 'id'> = {
      ...assignmentData,
      courseId,
      createdAt: new Date(),
      submissionIds: [],
      updatedAt: new Date() // Added updatedAt for consistency
    };
  
    return from(addDoc(assignmentsRef, newAssignment)).pipe(
      map(docRef => ({
        id: docRef.id,
        ...newAssignment
      } as Assignment)),
      catchError(error => {
        console.error('Error creating assignment:', error);
        return throwError(() => new Error('Failed to create assignment: ' + error.message));
      })
    );
  }

  // Update an existing assignment
  updateAssignment(assignmentId: string, changes: Partial<Assignment>): Observable<Assignment> {
    const assignmentRef = doc(this.firestore, `assignments/${assignmentId}`);
    return from(updateDoc(assignmentRef, {
      ...changes,
      updatedAt: new Date()
    })).pipe(
      switchMap(() => this.getAssignment(assignmentId)),
      catchError(error => throwError(() => new Error('Failed to update assignment')))
    );
  }

  // Delete an assignment
  deleteAssignment(assignmentId: string, courseId: string): Observable<void> {
    const assignmentRef = doc(this.firestore, `assignments/${assignmentId}`);
    
    // First delete all related submissions
    return this.getSubmissions(assignmentId).pipe(
      switchMap(submissions => {
        const deleteSubmissions = submissions.map(sub => 
          deleteDoc(doc(this.firestore, `submissions/${sub.id}`))
        );
        return Promise.all(deleteSubmissions);
      }),
      switchMap(() => from(deleteDoc(assignmentRef))),
      catchError(error => throwError(() => new Error('Failed to delete assignment')))
    );
  }

  // Get all submissions for an assignment
  getSubmissions(assignmentId: string): Observable<Submission[]> {
    const submissionsRef = collection(this.firestore, 'submissions');
    const q = query(
      submissionsRef,
      where('assignmentId', '==', assignmentId),
      orderBy('submittedAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Submission))
      ),
      catchError(error => throwError(() => new Error('Failed to load submissions')))
    );
  }

  // Grade a submission
  gradeSubmission(
    submissionId: string, 
    grade: { points: number; feedback: string },
    teacherId: string
  ): Observable<Submission> {
    const submissionRef = doc(this.firestore, `submissions/${submissionId}`);
    const gradeData = {
      grade: {
        ...grade,
        gradedBy: teacherId,
        gradedAt: new Date()
      },
      status: 'graded',
      updatedAt: new Date()
    };

    return from(updateDoc(submissionRef, gradeData)).pipe(
      switchMap(() => this.getSubmission(submissionId)),
      catchError(error => throwError(() => new Error('Failed to grade submission')))
    );
  }

  // Get a single submission
  private getSubmission(submissionId: string): Observable<Submission> {
    const submissionRef = doc(this.firestore, `submissions/${submissionId}`);
    return from(getDoc(submissionRef)).pipe(
      map(snapshot => {
        if (!snapshot.exists()) {
          throw new Error('Submission not found');
        }
        return {
          id: snapshot.id,
          ...snapshot.data()
        } as Submission;
      })
    );
  }

  // Submit work for an assignment
  submitAssignment(
    assignmentId: string,
    studentId: string,
    files: { name: string; url: string }[]
  ): Observable<Submission> {
    const submissionsRef = collection(this.firestore, 'submissions');
    const newSubmission: Omit<Submission, 'id'> = {
      assignmentId,
      studentId,
      courseId: '', // Will be set below
      submittedAt: new Date(),
      files,
      status: 'submitted'
    };

    // First get the course ID from the assignment
    return this.getAssignment(assignmentId).pipe(
      switchMap(assignment => {
        newSubmission.courseId = assignment.courseId;
        return from(addDoc(submissionsRef, newSubmission));
      }),
      map(docRef => ({
        id: docRef.id,
        ...newSubmission
      } as Submission)),
      switchMap(submission => {
        // Update the assignment with the new submission ID
        const assignmentRef = doc(this.firestore, `assignments/${assignmentId}`);
        return from(updateDoc(assignmentRef, {
          submissionIds: arrayUnion(submission.id)
        })).pipe(
          map(() => submission)
        );
      }),
      catchError(error => throwError(() => new Error('Failed to submit assignment')))
    );
  }
}