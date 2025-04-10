import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap, filter, withLatestFrom, buffer } from 'rxjs/operators';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';

import { selectCurrentUser } from '../store/auth/auth.selectors';

interface ActionLogEntry {
  timestamp: string;
  type: string;
  payload: any;
  userId?: string | null;
  userRole?: string | null;
}

@Injectable({providedIn: 'root'})
export class FirebaseActionLoggerEffects {
  private actionLogs: ActionLogEntry[] = [];
  
  // currentUser$: Observable<User | null>;
  
  constructor(
    private actions$: Actions,
    private firestore: Firestore,
    private store: Store
  ) {  }

  logActions$ = createEffect(() => {
    const currentUser$ = this.store.select(selectCurrentUser);
  
    return this.actions$.pipe(
      filter(action => !action.type.startsWith('[NgRx/Store') && 
                       !action.type.startsWith('[Logger')),
      withLatestFrom(currentUser$),
      tap(([action, user]) => {
        const logEntry: ActionLogEntry = {
          timestamp: new Date().toISOString(),
          type: action.type,
          payload: this.sanitizePayload(action),
          userId: user?.uid || 'anonymous',
          userRole: user?.role || 'none'
        };
  
        this.actionLogs.push(logEntry);
        if (this.actionLogs.length >= 10) {
          this.writeLogsToFirestore();
        }
      })
    );
  }, { dispatch: false });
 
  
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
      return { type: action.type, note: "Payload could not be serialized" };
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