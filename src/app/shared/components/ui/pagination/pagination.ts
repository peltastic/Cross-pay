import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationData } from './pagination.types';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  @Input() data!: PaginationData;
  @Output() pageChange = new EventEmitter<number>();

  Math = Math;

  goToPage(page: number): void {
    if (page >= 0 && page < this.getTotalPages()) {
      this.pageChange.emit(page);
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.data.totalCount / this.data.pageSize);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  getDisplayRange(): { start: number; end: number } {
    const start = (this.data.currentPage * this.data.pageSize) + 1;
    const end = Math.min((this.data.currentPage + 1) * this.data.pageSize, this.data.totalCount);
    return { start, end };
  }
}