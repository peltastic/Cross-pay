import { Component, ChangeDetectionStrategy, OnInit, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayout } from '../../layout/dashboard-layout/dashboard-layout';
import { LazyLoadService } from '../../core/services/lazy-load.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DashboardLayout],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  @ViewChild('walletsContainer', { read: ViewContainerRef, static: true }) walletsContainer!: ViewContainerRef;
  @ViewChild('quickActionsContainer', { read: ViewContainerRef, static: true }) quickActionsContainer!: ViewContainerRef;

  private walletsComponentRef?: ComponentRef<any>;
  private quickActionsComponentRef?: ComponentRef<any>;

  constructor(private lazyLoadService: LazyLoadService) {}

  async ngOnInit() {
    await this.loadComponents();
  }

  private async loadComponents() {
    try {
      this.walletsComponentRef = await this.lazyLoadService.loadComponent(
        () => import('./components/wallets/wallets'),
        'Wallets',
        this.walletsContainer
      );

      this.quickActionsComponentRef = await this.lazyLoadService.loadComponent(
        () => import('./components/quick-actions/quick-actions'),
        'QuickActions',
        this.quickActionsContainer
      );
    } catch (error) {
      console.error('Error loading dashboard components:', error);
    }
  }

  ngOnDestroy() {
    if (this.walletsComponentRef && typeof this.walletsComponentRef.destroy === 'function') {
      this.walletsComponentRef.destroy();
    }
    if (this.quickActionsComponentRef && typeof this.quickActionsComponentRef.destroy === 'function') {
      this.quickActionsComponentRef.destroy();
    }
  }
}
