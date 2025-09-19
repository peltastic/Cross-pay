import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
})
export class ButtonComponent {
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() class: string = '';
  @Output() click = new EventEmitter<void>();

  onClick() {
    if (!this.disabled && !this.loading) {
      this.click.emit();
    }
  }

  get buttonClasses() {
    const baseClasses =
      'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
      primary:
        'bg-button-background text-white hover:bg-primary-button-background-hover focus:ring-primary-button-background-hover disabled:bg-primary-button-background-disabled',
      secondary: 'dark:text-white text-gray-900 hover:bg-gray-background-2 dark:hover:bg-dark-hover-background focus:ring-gray-500 ',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    };

    return `${baseClasses} ${variantClasses[this.variant]} ${this.class}`;
  }
}
