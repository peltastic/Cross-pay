import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../../layout/sidebar/sidebar';

@Component({
  selector: 'app-mobile-sidebar',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './mobile-sidebar.html'
})
export class MobileSidebarComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  closeSidebar() {
    this.close.emit();
  }
}