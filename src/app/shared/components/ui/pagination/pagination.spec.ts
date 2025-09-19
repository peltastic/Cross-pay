import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination';
import { PaginationData } from './pagination.types';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have Math property available', () => {
      expect(component.Math).toBe(Math);
    });
  });

  describe('getTotalPages', () => {
    it('should calculate total pages correctly for exact division', () => {
      component.data = { currentPage: 0, totalCount: 100, pageSize: 10, hasMore: false };
      expect(component.getTotalPages()).toBe(10);
    });

    it('should calculate total pages correctly with remainder', () => {
      component.data = { currentPage: 0, totalCount: 105, pageSize: 10, hasMore: false };
      expect(component.getTotalPages()).toBe(11);
    });

    it('should return 1 for zero total count', () => {
      component.data = { currentPage: 0, totalCount: 0, pageSize: 10, hasMore: false };
      expect(component.getTotalPages()).toBe(0);
    });

    it('should handle single item pagination', () => {
      component.data = { currentPage: 0, totalCount: 1, pageSize: 10, hasMore: false };
      expect(component.getTotalPages()).toBe(1);
    });

    it('should handle large page sizes', () => {
      component.data = { currentPage: 0, totalCount: 50, pageSize: 100, hasMore: false };
      expect(component.getTotalPages()).toBe(1);
    });
  });

  describe('getPageNumbers', () => {
    it('should return correct array of page numbers', () => {
      component.data = { currentPage: 0, totalCount: 30, pageSize: 10, hasMore: false };
      expect(component.getPageNumbers()).toEqual([0, 1, 2]);
    });

    it('should return empty array for zero pages', () => {
      component.data = { currentPage: 0, totalCount: 0, pageSize: 10, hasMore: false };
      expect(component.getPageNumbers()).toEqual([]);
    });

    it('should return single page array', () => {
      component.data = { currentPage: 0, totalCount: 5, pageSize: 10, hasMore: false };
      expect(component.getPageNumbers()).toEqual([0]);
    });

    it('should handle large number of pages', () => {
      component.data = { currentPage: 0, totalCount: 1000, pageSize: 10, hasMore: false };
      const expected = Array.from({ length: 100 }, (_, i) => i);
      expect(component.getPageNumbers()).toEqual(expected);
    });
  });

  describe('getDisplayRange', () => {
    it('should calculate display range for first page', () => {
      component.data = { currentPage: 0, totalCount: 100, pageSize: 10, hasMore: false };
      const range = component.getDisplayRange();
      expect(range.start).toBe(1);
      expect(range.end).toBe(10);
    });

    it('should calculate display range for middle page', () => {
      component.data = { currentPage: 2, totalCount: 100, pageSize: 10, hasMore: false };
      const range = component.getDisplayRange();
      expect(range.start).toBe(21);
      expect(range.end).toBe(30);
    });

    it('should calculate display range for last page with partial items', () => {
      component.data = { currentPage: 9, totalCount: 95, pageSize: 10, hasMore: false };
      const range = component.getDisplayRange();
      expect(range.start).toBe(91);
      expect(range.end).toBe(95);
    });

    it('should handle single page with few items', () => {
      component.data = { currentPage: 0, totalCount: 3, pageSize: 10, hasMore: false };
      const range = component.getDisplayRange();
      expect(range.start).toBe(1);
      expect(range.end).toBe(3);
    });

    it('should handle zero items', () => {
      component.data = { currentPage: 0, totalCount: 0, pageSize: 10, hasMore: false };
      const range = component.getDisplayRange();
      expect(range.start).toBe(1);
      expect(range.end).toBe(0);
    });
  });

  describe('goToPage', () => {
    beforeEach(() => {
      component.data = { currentPage: 2, totalCount: 100, pageSize: 10, hasMore: false };
      spyOn(component.pageChange, 'emit');
    });

    it('should emit page change for valid page number', () => {
      component.goToPage(5);
      expect(component.pageChange.emit).toHaveBeenCalledWith(5);
    });

    it('should emit page change for first page', () => {
      component.goToPage(0);
      expect(component.pageChange.emit).toHaveBeenCalledWith(0);
    });

    it('should emit page change for last page', () => {
      component.goToPage(9);
      expect(component.pageChange.emit).toHaveBeenCalledWith(9);
    });

    it('should not emit for negative page number', () => {
      component.goToPage(-1);
      expect(component.pageChange.emit).not.toHaveBeenCalled();
    });

    it('should not emit for page number equal to total pages', () => {
      component.goToPage(10);
      expect(component.pageChange.emit).not.toHaveBeenCalled();
    });

    it('should not emit for page number greater than total pages', () => {
      component.goToPage(15);
      expect(component.pageChange.emit).not.toHaveBeenCalled();
    });

    it('should handle edge case when total pages is 0', () => {
      component.data = { currentPage: 0, totalCount: 0, pageSize: 10, hasMore: false };
      component.goToPage(0);
      expect(component.pageChange.emit).not.toHaveBeenCalled();
    });

    it('should handle boundary conditions correctly', () => {
      component.data = { currentPage: 0, totalCount: 10, pageSize: 10, hasMore: false };
      
      component.goToPage(0);
      expect(component.pageChange.emit).toHaveBeenCalledWith(0);
      
      component.goToPage(1);
      expect(component.pageChange.emit).not.toHaveBeenCalledWith(1);
    });
  });

  describe('Integration tests', () => {
    it('should work correctly with complex pagination scenario', () => {
      component.data = { currentPage: 3, totalCount: 157, pageSize: 15, hasMore: true };
      
      expect(component.getTotalPages()).toBe(11);
      expect(component.getPageNumbers()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      
      const range = component.getDisplayRange();
      expect(range.start).toBe(46);
      expect(range.end).toBe(60);
      
      spyOn(component.pageChange, 'emit');
      component.goToPage(5);
      expect(component.pageChange.emit).toHaveBeenCalledWith(5);
    });

    it('should handle minimal pagination data', () => {
      component.data = { currentPage: 0, totalCount: 1, pageSize: 1, hasMore: false };
      
      expect(component.getTotalPages()).toBe(1);
      expect(component.getPageNumbers()).toEqual([0]);
      
      const range = component.getDisplayRange();
      expect(range.start).toBe(1);
      expect(range.end).toBe(1);
    });
  });

  describe('Input validation edge cases', () => {
    it('should handle very large page sizes', () => {
      component.data = { currentPage: 0, totalCount: 100, pageSize: 1000, hasMore: false };
      expect(component.getTotalPages()).toBe(1);
      
      const range = component.getDisplayRange();
      expect(range.start).toBe(1);
      expect(range.end).toBe(100);
    });

    it('should handle page size of 1', () => {
      component.data = { currentPage: 5, totalCount: 10, pageSize: 1, hasMore: false };
      expect(component.getTotalPages()).toBe(10);
      
      const range = component.getDisplayRange();
      expect(range.start).toBe(6);
      expect(range.end).toBe(6);
    });
  });
});