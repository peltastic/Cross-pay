import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-base-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-modal.html'
})
export class BaseModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() closeOnBackdrop: boolean = true;
  @Output() close = new EventEmitter<void>();

  @ViewChild('modalContent', { static: false }) modalContent!: ElementRef;

  ngOnInit() {
    this.updateBodyOverflow();
  }

  ngOnDestroy() {
    document.body.style.overflow = 'unset';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      this.updateBodyOverflow();
    }
  }

  private updateBodyOverflow() {
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }

  onBackdropClick() {
    if (this.closeOnBackdrop) {
      this.closeModal();
    }
  }

  closeModal() {
    this.close.emit();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  get sizeClasses() {
    return {
      'sm': 'max-w-md',
      'md': 'max-w-lg',
      'lg': 'max-w-2xl',
      'xl': 'max-w-4xl'
    }[this.size];
  }
}