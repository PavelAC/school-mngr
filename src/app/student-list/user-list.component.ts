import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../models/user.model';
import { collection, Firestore, getDocs, query, where, Query, DocumentData, getDoc, doc } from '@angular/fire/firestore';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  @Input() userIds: string[] = [];
  @Input() roleFilter?: 'student' | 'teacher';
  @Input() showAllUsers = false;
  @Output() userSelected = new EventEmitter<User>();

selectUser(user: User) {
  this.userSelected.emit(user);
}
  
  users: User[] = [];
  loading = false;
  error: string | null = null;

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading = true;
    this.error = null;

    if (this.showAllUsers) {
      this.loadAllUsers();
    } else if (this.userIds?.length) {
      this.loadSpecificUsers();
    } else {
      this.users = [];
      this.loading = false;
    }
  }

  private async loadAllUsers(): Promise<void> {
    try {
      const usersRef = collection(this.firestore, 'users');
      let usersQuery: Query<DocumentData>;
      
      if (this.roleFilter) {
        usersQuery = query(usersRef, where('role', '==', this.roleFilter));
      } else {
        usersQuery = usersRef;
      }

      const snapshot = await getDocs(usersQuery);
      this.users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as User));
    } catch (err) {
      this.error = 'Failed to load users: ' + (err as Error).message;
    } finally {
      this.loading = false;
    }
  }

  private async loadSpecificUsers(): Promise<void> {
    try {
      const userDocs = await Promise.all(
        this.userIds.map(uid => 
          getDoc(doc(this.firestore, 'users', uid))
            .then(docSnap => docSnap.exists() ? { uid: docSnap.id, ...docSnap.data() } as User : null)
        )
      );
      this.users = userDocs.filter(user => user !== null) as User[];
    } catch (err) {
      this.error = 'Failed to load users: ' + (err as Error).message;
    } finally {
      this.loading = false;
    }
  }
}