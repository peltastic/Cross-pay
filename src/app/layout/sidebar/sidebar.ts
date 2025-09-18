import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { getUserEmail } from '../../store/user/user.selector';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { SessionStorageService } from '../../core/services/session-storage.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.html',
})
export class Sidebar implements OnInit, OnDestroy {
  user: string | null;
  currentPath: string = '';
  private destroy$ = new Subject<void>();

  items = [
    { id: 1, label: 'Dashboard', path: '/dashboard' },
    { id: 2, label: 'Transactions', path: '/dashboard/transactions' },
    { id: 3, label: 'FX analytics', path: '/dashboard/fx-analytics' },
  ];

  constructor(
    private store: Store,
    private router: Router,
    private sessionService: SessionStorageService
  ) {
    this.user = this.sessionService.getItem<string>('email');
  }

  ngOnInit() {
    this.currentPath = this.router.url;

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentPath = event.url;
      });
  }

  isActive(path: string): boolean {
    return this.currentPath === path;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
