import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quick-actions-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-actions-cards.html',
})
export class QuickActionsCards {
  @Input() onClick?: () => void;
  @Output() cardClick = new EventEmitter<void>();

  handleClick() {
    if (this.onClick) {
      this.onClick();
    }

    this.cardClick.emit();
  }
}
