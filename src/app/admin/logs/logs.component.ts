import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';
import { ActionLogsService, ActionLogEntry, LogsFilter } from './logs.service';
import { DocumentData, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.css'
})
export class LogsComponent implements OnInit, OnDestroy {
  logs: ActionLogEntry[] = [];
  loading = false;
  error: string | null = null;
  private expandedLogIds = new Set<string>();
  filterForm!: FormGroup;
  
  // For pagination
  pageSize = 20;
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null;
  hasMoreLogs = true;
  loadingMore = false;
  
  // For refresh
  refreshTrigger$ = new BehaviorSubject<number>(0);
  
  // For cleanup
  private destroy$ = new Subject<void>();
  
  // Predefined categories for filter dropdown
  actionCategories = [
    'Auth',
    'Data',
    'User',
    'Navigation',
    'Settings'
    // Add other categories your app uses
  ];
  
  constructor(
    private logsService: ActionLogsService,
    private fb: FormBuilder
  ) {}
  
  ngOnInit(): void {
    this.initFilterForm();
    this.loadLogs();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      userId: [''],
      userRole: [''],
      actionCategory: [''],
      actionType: [''],
      startDate: [null],
      endDate: [null]
    });
    
    // React to form changes
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.resetPagination();
      this.loadLogs();
    });
  }
  
  loadLogs(): void {
    this.loading = true;
    this.error = null;
    
    const filter = this.buildFilter();
    
    combineLatest([
      this.refreshTrigger$
    ]).pipe(
      switchMap(() => this.logsService.getLogsPaginated(null, this.pageSize, filter)),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (result) => {
        this.logs = result.logs;
        this.lastVisible = result.lastVisible;
        this.hasMoreLogs = result.logs.length === this.pageSize;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load logs: ' + err.message;
        this.loading = false;
      }
    });
  }
  
  loadMoreLogs(): void {
    if (!this.lastVisible || this.loadingMore) return;
    
    this.loadingMore = true;
    const filter = this.buildFilter();
    
    this.logsService.getLogsPaginated(this.lastVisible, this.pageSize, filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.logs = [...this.logs, ...result.logs];
          this.lastVisible = result.lastVisible;
          this.hasMoreLogs = result.logs.length === this.pageSize;
          this.loadingMore = false;
        },
        error: (err) => {
          this.error = 'Failed to load more logs: ' + err.message;
          this.loadingMore = false;
        }
      });
  }
  
  refreshLogs(): void {
    this.resetPagination();
    this.refreshTrigger$.next(Date.now());
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      userId: '',
      userRole: '',
      actionCategory: '',
      actionType: '',
      startDate: null,
      endDate: null
    });
  }
  
  private resetPagination(): void {
    this.lastVisible = null;
    this.hasMoreLogs = true;
  }
  
  private buildFilter(): LogsFilter {
    const formValues = this.filterForm.value;
    
    const filter: LogsFilter = {};
    
    if (formValues.userId) filter.userId = formValues.userId;
    if (formValues.userRole) filter.userRole = formValues.userRole;
    if (formValues.actionCategory) filter.actionCategory = formValues.actionCategory;
    if (formValues.actionType) filter.actionType = formValues.actionType;
    if (formValues.startDate) filter.startDate = formValues.startDate;
    if (formValues.endDate) filter.endDate = formValues.endDate;
    
    return filter;
  }
  
  getPayloadPreview(log: ActionLogEntry): string {
    try {
      if (!log.payload) return 'No payload';
      
      const obj = typeof log.payload === 'string' 
        ? JSON.parse(log.payload) 
        : log.payload;
      
      // Create a simplified preview with key properties
      const preview: any = {};
      
      // Include only top-level properties
      Object.keys(obj).slice(0, 3).forEach(key => {
        if (key !== 'type') { // Type is already shown separately
          let value = obj[key];
          if (typeof value === 'object' && value !== null) {
            preview[key] = Array.isArray(value) 
              ? `Array[${value.length}]` 
              : 'Object';
          } else {
            preview[key] = value;
          }
        }
      });
      
      return JSON.stringify(preview, null, 2);
    } catch (e) {
      return 'Unable to parse payload';
    }
  }

  toggleDetails(log: ActionLogEntry): void {
    if (this.isExpanded(log)) {
      this.expandedLogIds.delete(log.id!);
    } else {
      this.expandedLogIds.add(log.id!);
    }
  }
  
  isExpanded(log: ActionLogEntry): boolean {
    return log.id ? this.expandedLogIds.has(log.id) : false;
  }
  
  getCategoryFromType(type: string): string {
    return type.match(/\[(.*?)\]/)?.[1] || 'unknown';
  }
  
  getActionNameFromType(type: string): string {
    return type.replace(/\[.*?\]\s*/, '');
  }
  
  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }
}
