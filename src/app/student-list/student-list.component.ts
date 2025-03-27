import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit{
  @Input() studentIds: string[] = [];
  students: User[] = [];
  loading = false;
  error: string | null = null;

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  private loadStudents(): void {
    if (!this.studentIds || this.studentIds.length === 0) {
      this.students = [];
      return;
    }

    this.loading = true;
    this.error = null;

    // Fetch each student document
    Promise.all(
      this.studentIds.map(uid => 
        getDoc(doc(this.firestore, 'users', uid))
          .then(docSnap => {
            if (docSnap.exists()) {
              return { uid: docSnap.id, ...docSnap.data() } as User;
            }
            return null;
          })
      )
    )
    .then(results => {
      this.students = results.filter(user => user !== null) as User[];
      this.loading = false;
    })
    .catch(err => {
      this.error = 'Failed to load students: ' + err.message;
      this.loading = false;
    });
  }
}
