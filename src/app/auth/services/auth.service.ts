import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  user, 
  User as FirebaseUser 
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';
import { Observable, from, map, switchMap, of, tap, catchError, take, throwError } from 'rxjs';
import { User } from '../../models/user.model';
import { UserRole } from '../../models/user-roles.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  // Get Firebase user
  firebaseUser$ = user(this.auth);
  
  // Get user with role information
  currentUser$: Observable<User | null> = this.firebaseUser$.pipe(
    switchMap(firebaseUser => {
      if (!firebaseUser) return of(null);
      
      return this.getUserDataFromFirestore(firebaseUser.uid).pipe(
        map(userData => {
          if (!userData) return null;
          return { uid: firebaseUser.uid, ...userData } as User;
        })
      );
    })
  );

  // Register with role
  register(email: string, password: string, role: UserRole, displayName?: string): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(credential => {
        const user: Omit<User, 'uid'> = {
          email,
          displayName: displayName || '',
          photoURL: '',
          role,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return from(setDoc(doc(this.firestore, `users/${credential.user.uid}`), user)).pipe(
          map(() => ({ ...user, uid: credential.user.uid }))
        );
      })
    );
  }

  // Login
  login(email: string, password: string): Observable<FirebaseUser> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(credential => credential.user)
    );
  }

  // Logout
  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  // Update user profile
  updateProfile(uid: string, data: Partial<User>): Observable<void> {
    const userRef = doc(this.firestore, `users/${uid}`);
    return from(updateDoc(userRef, { ...data, updatedAt: new Date() }));
  }

  // Helper method to get user data from Firestore
  private getUserDataFromFirestore(uid: string): Observable<Omit<User, 'uid'> | null> {
    return from(getDoc(doc(this.firestore, `users/${uid}`))).pipe(
      map(docSnapshot => {
        if (!docSnapshot.exists()) return null;
        return docSnapshot.data() as Omit<User, 'uid'>;
      }),
      catchError(error => {
        console.error('Error fetching user data:', error);
        return of(null);
      })
    );
  }

  
  getAllUsers(): Observable<User[]> {
    return this.firebaseUser$.pipe(
      take(1),
      switchMap(firebaseUser => {
        if (!firebaseUser) {
          return throwError(() => new Error('Not authenticated'));
        }
  
        const usersRef = collection(this.firestore, 'users');
        return from(getDocs(usersRef)).pipe(
          map(querySnapshot => {
            return querySnapshot.docs.map(doc => ({
              uid: doc.id,
              ...doc.data() as Omit<User, 'uid'>
            }));
          }),
          catchError(error => {
            console.error('Error fetching users:', error);
            return throwError(() => new Error('Failed to load users'));
          })
        );
      }),
      catchError(error => {
        console.error('Auth error:', error);
        return of([]);
      })
    );
  }
}
