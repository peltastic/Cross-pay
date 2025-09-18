import {
  Component,
  ViewChild,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HamburgerMenuComponent } from '../../shared/components/navigation/hamburger-menu/hamburger-menu';
import { LazyLoadService } from '../../core/services/lazy-load.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-layout',
  imports: [CommonModule, HamburgerMenuComponent],
  templateUrl: './dashboard-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayout implements OnInit, OnDestroy {
  @ViewChild('sidebarContainer', { read: ViewContainerRef, static: true })
  sidebarContainer!: ViewContainerRef;
  @ViewChild('mobileSidebarContainer', { read: ViewContainerRef, static: true })
  mobileSidebarContainer!: ViewContainerRef;

  isMobileSidebarOpen = false;
  private mobileSidebarRef: any;
  private destroy$ = new Subject<void>();

  constructor(private lazyLoadService: LazyLoadService) {}

  async ngOnInit() {
    await this.loadSidebar();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadSidebar() {
    try {
      await this.lazyLoadService.loadComponent(
        () => import('../sidebar/sidebar'),
        'Sidebar',
        this.sidebarContainer
      );
    } catch (error) {
      console.error('Error loading sidebar:', error);
    }
  }

  async onToggleMobileSidebar(isOpen: boolean) {
    this.isMobileSidebarOpen = isOpen;

    if (isOpen && !this.mobileSidebarRef) {
      this.mobileSidebarRef = await this.lazyLoadService.loadComponent(
        () => import('../../shared/components/navigation/mobile-sidebar/mobile-sidebar'),
        'MobileSidebarComponent',
        this.mobileSidebarContainer
      );

      this.mobileSidebarRef.instance.isOpen = true;
      this.mobileSidebarRef.instance.close.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.onCloseMobileSidebar();
      });
    } else if (this.mobileSidebarRef) {
      this.mobileSidebarRef.instance.isOpen = isOpen;
    }
  }

  onCloseMobileSidebar() {
    this.isMobileSidebarOpen = false;
    if (this.mobileSidebarRef) {
      this.mobileSidebarRef.instance.isOpen = false;
    }
  }
}
