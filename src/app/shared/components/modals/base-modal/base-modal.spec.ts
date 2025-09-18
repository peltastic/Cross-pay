import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseModalComponent } from './base-modal';
import { DebugElement, SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('BaseModalComponent', () => {
  let component: BaseModalComponent;
  let fixture: ComponentFixture<BaseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.style.overflow = 'unset';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should have default isOpen as false', () => {
      expect(component.isOpen).toBe(false);
    });

    it('should set isOpen correctly', () => {
      component.isOpen = true;
      expect(component.isOpen).toBe(true);
    });

    it('should have default title as empty string', () => {
      expect(component.title).toBe('');
    });

    it('should set title correctly', () => {
      const title = 'Test Modal Title';
      component.title = title;
      expect(component.title).toBe(title);
    });

    it('should have default size as md', () => {
      expect(component.size).toBe('md');
    });

    it('should set size correctly', () => {
      component.size = 'lg';
      expect(component.size).toBe('lg');
    });

    it('should have default closeOnBackdrop as true', () => {
      expect(component.closeOnBackdrop).toBe(true);
    });

    it('should set closeOnBackdrop correctly', () => {
      component.closeOnBackdrop = false;
      expect(component.closeOnBackdrop).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should call updateBodyOverflow on init', () => {
      spyOn(component, 'updateBodyOverflow' as any);

      component.ngOnInit();

      expect((component as any).updateBodyOverflow).toHaveBeenCalled();
    });

    it('should set body overflow to hidden when modal is open', () => {
      component.isOpen = true;

      component.ngOnInit();

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should set body overflow to unset when modal is closed', () => {
      component.isOpen = false;

      component.ngOnInit();

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('ngOnDestroy', () => {
    it('should reset body overflow to unset', () => {
      document.body.style.overflow = 'hidden';

      component.ngOnDestroy();

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('ngOnChanges', () => {
    it('should call updateBodyOverflow when isOpen changes', () => {
      spyOn(component, 'updateBodyOverflow' as any);
      const changes = {
        isOpen: new SimpleChange(false, true, false),
      };

      component.ngOnChanges(changes);

      expect((component as any).updateBodyOverflow).toHaveBeenCalled();
    });

    it('should not call updateBodyOverflow when other properties change', () => {
      spyOn(component, 'updateBodyOverflow' as any);
      const changes = {
        title: new SimpleChange('', 'New Title', false),
      };

      component.ngOnChanges(changes);

      expect((component as any).updateBodyOverflow).not.toHaveBeenCalled();
    });

    it('should handle multiple changes including isOpen', () => {
      spyOn(component, 'updateBodyOverflow' as any);
      const changes = {
        isOpen: new SimpleChange(false, true, false),
        title: new SimpleChange('', 'New Title', false),
      };

      component.ngOnChanges(changes);

      expect((component as any).updateBodyOverflow).toHaveBeenCalled();
    });

    it('should handle changes when isOpen is not present', () => {
      spyOn(component, 'updateBodyOverflow' as any);
      const changes = {
        size: new SimpleChange('md', 'lg', false),
      };

      component.ngOnChanges(changes);

      expect((component as any).updateBodyOverflow).not.toHaveBeenCalled();
    });
  });

  describe('updateBodyOverflow', () => {
    it('should set body overflow to hidden when modal is open', () => {
      component.isOpen = true;

      (component as any).updateBodyOverflow();

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should set body overflow to unset when modal is closed', () => {
      component.isOpen = false;

      (component as any).updateBodyOverflow();

      expect(document.body.style.overflow).toBe('unset');
    });

    it('should override existing body overflow styles', () => {
      document.body.style.overflow = 'scroll';
      component.isOpen = true;

      (component as any).updateBodyOverflow();

      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  describe('onBackdropClick', () => {
    it('should close modal when closeOnBackdrop is true', () => {
      spyOn(component, 'closeModal');
      component.closeOnBackdrop = true;

      component.onBackdropClick();

      expect(component.closeModal).toHaveBeenCalled();
    });

    it('should not close modal when closeOnBackdrop is false', () => {
      spyOn(component, 'closeModal');
      component.closeOnBackdrop = false;

      component.onBackdropClick();

      expect(component.closeModal).not.toHaveBeenCalled();
    });
  });

  describe('closeModal', () => {
    it('should emit close event', () => {
      spyOn(component.close, 'emit');

      component.closeModal();

      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should emit close event without parameters', () => {
      spyOn(component.close, 'emit');

      component.closeModal();

      expect(component.close.emit).toHaveBeenCalledWith();
    });
  });

  describe('onKeyDown', () => {
    it('should close modal when Escape key is pressed', () => {
      spyOn(component, 'closeModal');
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });

      component.onKeyDown(escapeEvent);

      expect(component.closeModal).toHaveBeenCalled();
    });

    it('should not close modal when other keys are pressed', () => {
      spyOn(component, 'closeModal');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });

      component.onKeyDown(enterEvent);

      expect(component.closeModal).not.toHaveBeenCalled();
    });

    it('should handle case-sensitive Escape key', () => {
      spyOn(component, 'closeModal');
      const escapeEvent = new KeyboardEvent('keydown', { key: 'escape' });

      component.onKeyDown(escapeEvent);

      expect(component.closeModal).not.toHaveBeenCalled();
    });

    it('should handle special keys', () => {
      spyOn(component, 'closeModal');
      const specialKeys = ['Tab', 'Shift', 'Control', 'Alt', 'ArrowUp', 'ArrowDown'];

      specialKeys.forEach((key) => {
        const event = new KeyboardEvent('keydown', { key });
        component.onKeyDown(event);
        expect(component.closeModal).not.toHaveBeenCalled();
      });
    });
  });

  describe('sizeClasses getter', () => {
    it('should return correct class for sm size', () => {
      component.size = 'sm';

      expect(component.sizeClasses).toBe('max-w-md');
    });

    it('should return correct class for md size', () => {
      component.size = 'md';

      expect(component.sizeClasses).toBe('max-w-lg');
    });

    it('should return correct class for lg size', () => {
      component.size = 'lg';

      expect(component.sizeClasses).toBe('max-w-2xl');
    });

    it('should return correct class for xl size', () => {
      component.size = 'xl';

      expect(component.sizeClasses).toBe('max-w-4xl');
    });
  });

  describe('integration tests', () => {
    it('should handle complete modal lifecycle', () => {
      spyOn(component.close, 'emit');

      component.isOpen = false;
      component.ngOnInit();
      expect(document.body.style.overflow).toBe('unset');

      const changes = {
        isOpen: new SimpleChange(false, true, false),
      };
      component.isOpen = true;
      component.ngOnChanges(changes);
      expect(document.body.style.overflow).toBe('hidden');

      // Close via escape
      component.onKeyDown(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(component.close.emit).toHaveBeenCalled();

      // Cleanup
      component.ngOnDestroy();
      expect(document.body.style.overflow).toBe('unset');
    });

    it('should handle backdrop clicks correctly based on settings', () => {
      spyOn(component.close, 'emit');

      // Test with closeOnBackdrop true
      component.closeOnBackdrop = true;
      component.onBackdropClick();
      expect(component.close.emit).toHaveBeenCalledTimes(1);

      // Test with closeOnBackdrop false
      component.closeOnBackdrop = false;
      component.onBackdropClick();
      expect(component.close.emit).toHaveBeenCalledTimes(1); // Should not increment
    });

    it('should maintain size consistency', () => {
      const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl'];
      const expectedClasses = ['max-w-md', 'max-w-lg', 'max-w-2xl', 'max-w-4xl'];

      sizes.forEach((size, index) => {
        component.size = size;
        expect(component.sizeClasses).toBe(expectedClasses[index]);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle rapid open/close changes', () => {
      const changes1 = { isOpen: new SimpleChange(false, true, false) };
      const changes2 = { isOpen: new SimpleChange(true, false, false) };

      component.isOpen = true;
      component.ngOnChanges(changes1);
      expect(document.body.style.overflow).toBe('hidden');

      component.isOpen = false;
      component.ngOnChanges(changes2);
      expect(document.body.style.overflow).toBe('unset');
    });

    it('should handle multiple escape key presses', () => {
      spyOn(component.close, 'emit');
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });

      component.onKeyDown(escapeEvent);
      component.onKeyDown(escapeEvent);
      component.onKeyDown(escapeEvent);

      expect(component.close.emit).toHaveBeenCalledTimes(3);
    });

    it('should handle empty title', () => {
      component.title = '';
      expect(component.title).toBe('');
    });

    it('should handle long title', () => {
      const longTitle = 'A'.repeat(1000);
      component.title = longTitle;
      expect(component.title).toBe(longTitle);
    });
  });
});
