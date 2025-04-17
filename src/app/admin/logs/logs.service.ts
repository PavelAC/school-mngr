import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
  collectionData
} from '@angular/fire/firestore';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ActionLogEntry {
  id?: string;
  timestamp: string;
  type: string;
  payload: any;
  userId?: string | null;
  userRole?: string | null;
  message: string;
  showDetails?: boolean;
}

export interface LogsFilter {
  userId?: string;
  userRole?: string;
  actionType?: string;
  actionCategory?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ActionLogsService {
  private readonly COLLECTION_NAME = 'action_logs';
  
  constructor(private firestore: Firestore) {}
  
  /**
   * Get all action logs with optional filtering
   */
  getLogs(filter?: LogsFilter): Observable<ActionLogEntry[]> {
    const logsCollection = collection(this.firestore, this.COLLECTION_NAME);
    const constraints: QueryConstraint[] = this.buildQueryConstraints(filter);
    
    // Always order by timestamp in descending order (newest first)
    constraints.push(orderBy('timestamp', 'desc'));
    
    // Add limit if specified
    if (filter?.limit) {
      constraints.push(limit(filter.limit));
    }
    
    const logsQuery = query(logsCollection, ...constraints);
    
    return collectionData(logsQuery, { idField: 'id' }).pipe(
      map(docs => docs as ActionLogEntry[]),
      catchError(error => {
        console.error('Error fetching action logs:', error);
        return throwError(() => new Error('Failed to fetch action logs'));
      })
    );
  }
  
  /**
   * Get logs for a specific user
   */
  getUserLogs(userId: string, limitCount = 100): Observable<ActionLogEntry[]> {
    return this.getLogs({ userId, limit: limitCount });
  }
  
  /**
   * Get logs by action category (e.g., 'Auth', 'Data')
   */
  getLogsByCategory(category: string, limitCount = 100): Observable<ActionLogEntry[]> {
    return this.getLogs({ actionCategory: category, limit: limitCount });
  }
  
  /**
   * Get logs for a specific time period
   */
  getLogsByDateRange(startDate: Date, endDate: Date, limitCount = 100): Observable<ActionLogEntry[]> {
    return this.getLogs({ startDate, endDate, limit: limitCount });
  }
  
  /**
   * Get logs using pagination (for infinite scrolling or "load more" functionality)
   */
  getLogsPaginated(
    lastVisible: QueryDocumentSnapshot<DocumentData> | null,
    pageSize = 20,
    filter?: LogsFilter
  ): Observable<{
    logs: ActionLogEntry[];
    lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  }> {
    const logsCollection = collection(this.firestore, this.COLLECTION_NAME);
    const constraints: QueryConstraint[] = this.buildQueryConstraints(filter);
    
    // Add ordering
    constraints.push(orderBy('timestamp', 'desc'));
    
    // Add pagination
    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }
    
    // Add page size limit
    constraints.push(limit(pageSize));
    
    const logsQuery = query(logsCollection, ...constraints);
    
    return from(getDocs(logsQuery)).pipe(
      map(snapshot => {
        const logs: ActionLogEntry[] = [];
        snapshot.forEach(doc => {
          logs.push({ id: doc.id, ...doc.data() } as ActionLogEntry);
        });
        
        const newLastVisible = snapshot.docs.length > 0 
          ? snapshot.docs[snapshot.docs.length - 1] 
          : null;
          
        return {
          logs,
          lastVisible: newLastVisible
        };
      }),
      catchError(error => {
        console.error('Error fetching paginated logs:', error);
        return throwError(() => new Error('Failed to fetch paginated logs'));
      })
    );
  }
  
  /**
   * Get statistics about logs
   */
  getLogStatistics(): Observable<{
    totalCount: number;
    userCounts: Record<string, number>;
    actionTypeCounts: Record<string, number>;
    categoryTotals: Record<string, number>;
  }> {
    return this.getLogs().pipe(
      map(logs => {
        const stats = {
          totalCount: logs.length,
          userCounts: {} as Record<string, number>,
          actionTypeCounts: {} as Record<string, number>,
          categoryTotals: {} as Record<string, number>
        };
        
        logs.forEach(log => {
          // Count by user
          const userId = log.userId || 'anonymous';
          stats.userCounts[userId] = (stats.userCounts[userId] || 0) + 1;
          
          // Count by action type
          stats.actionTypeCounts[log.type] = (stats.actionTypeCounts[log.type] || 0) + 1;
          
          // Count by category
          const category = log.type.match(/\[(.*?)\]/)?.[1] || 'unknown';
          stats.categoryTotals[category] = (stats.categoryTotals[category] || 0) + 1;
        });
        
        return stats;
      })
    );
  }
  
  /**
   * Builds query constraints based on filter options
   */
  private buildQueryConstraints(filter?: LogsFilter): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];
    
    if (!filter) return constraints;
    
    // Filter by userId
    if (filter.userId) {
      constraints.push(where('userId', '==', filter.userId));
    }
    
    // Filter by userRole
    if (filter.userRole) {
      constraints.push(where('userRole', '==', filter.userRole));
    }
    
    // Filter by exact action type
    if (filter.actionType) {
      constraints.push(where('type', '==', filter.actionType));
    }
    
    // Filter by action category
    if (filter.actionCategory) {
      constraints.push(where('type', '>=', `[${filter.actionCategory}]`));
      constraints.push(where('type', '<', `[${filter.actionCategory}]~`)); // ~ comes after ']' in ASCII
    }
    
    // Filter by date range
    if (filter.startDate) {
      const startTimestamp = filter.startDate.toISOString();
      constraints.push(where('timestamp', '>=', startTimestamp));
    }
    
    if (filter.endDate) {
      const endTimestamp = filter.endDate.toISOString();
      constraints.push(where('timestamp', '<=', endTimestamp));
    }
    
    return constraints;
  }
}