import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hamburger-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hamburger-menu.html'
})
export class HamburgerMenuComponent {
  @Output() toggleSidebar = new EventEmitter<boolean>();
  
  isOpen = false;

  toggle() {
    this.isOpen = !this.isOpen;
    this.toggleSidebar.emit(this.isOpen);
  }

  close() {
    this.isOpen = false;
  }
}