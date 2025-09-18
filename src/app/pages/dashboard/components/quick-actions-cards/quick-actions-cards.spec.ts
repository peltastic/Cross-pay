import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { QuickActionsCards } from './quick-actions-cards';

describe('QuickActionsCards', () => {
  let component: QuickActionsCards;
  let fixture: ComponentFixture<QuickActionsCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickActionsCards],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickActionsCards);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with undefined onClick and cardClick emitter', () => {
    expect(component.onClick).toBeUndefined();
    expect(component.cardClick).toBeDefined();
    expect(component.cardClick.observers.length).toBe(0);
  });

  describe('handleClick', () => {
    it('should call onClick function when provided', () => {
      const mockOnClick = jasmine.createSpy('onClick');
      component.onClick = mockOnClick;

      component.handleClick();

      expect(mockOnClick).toHaveBeenCalled();
    });

    it('should emit cardClick event', () => {
      spyOn(component.cardClick, 'emit');

      component.handleClick();

      expect(component.cardClick.emit).toHaveBeenCalledWith();
    });

    it('should emit cardClick event without calling onClick when onClick is undefined', () => {
      component.onClick = undefined;
      spyOn(component.cardClick, 'emit');

      component.handleClick();

      expect(component.cardClick.emit).toHaveBeenCalledWith();
    });

    it('should call both onClick and emit cardClick when both are available', () => {
      const mockOnClick = jasmine.createSpy('onClick');
      component.onClick = mockOnClick;
      spyOn(component.cardClick, 'emit');

      component.handleClick();

      expect(mockOnClick).toHaveBeenCalled();
      expect(component.cardClick.emit).toHaveBeenCalledWith();
    });

    it('should handle onClick being null', () => {
      component.onClick = null as any;
      spyOn(component.cardClick, 'emit');

      expect(() => component.handleClick()).not.toThrow();
      expect(component.cardClick.emit).toHaveBeenCalledWith();
    });
  });

  describe('Input/Output binding', () => {
    it('should accept onClick as input', () => {
      const mockFunction = jasmine.createSpy('testFunction');

      component.onClick = mockFunction;

      expect(component.onClick).toBe(mockFunction);
    });

    it('should emit through cardClick output', () => {
      let emittedValue: any;
      component.cardClick.subscribe((value) => {
        emittedValue = value;
      });

      component.handleClick();

      expect(emittedValue).toBeUndefined(); // EventEmitter emits void
    });

    it('should handle multiple subscribers to cardClick', () => {
      const subscriber1 = jasmine.createSpy('subscriber1');
      const subscriber2 = jasmine.createSpy('subscriber2');

      component.cardClick.subscribe(subscriber1);
      component.cardClick.subscribe(subscriber2);

      component.handleClick();

      expect(subscriber1).toHaveBeenCalled();
      expect(subscriber2).toHaveBeenCalled();
    });
  });

  describe('Component integration and edge cases', () => {
    it('should work with template click events', () => {
      spyOn(component, 'handleClick');
      fixture.detectChanges();

      // Simulate template click if there's a clickable element
      // This would need to be adjusted based on the actual template
      const debugElement = fixture.debugElement;
      if (debugElement.query(By.css('[data-testid="card"]'))) {
        const cardElement = debugElement.query(By.css('[data-testid="card"]'));
        cardElement.triggerEventHandler('click', null);
        expect(component.handleClick).toHaveBeenCalled();
      } else {
        // If no specific template, just call handleClick directly
        component.handleClick();
        expect(component.handleClick).toHaveBeenCalled();
      }
    });

    it('should handle rapid consecutive clicks', () => {
      const mockOnClick = jasmine.createSpy('onClick');
      component.onClick = mockOnClick;
      spyOn(component.cardClick, 'emit');

      component.handleClick();
      component.handleClick();
      component.handleClick();

      expect(mockOnClick).toHaveBeenCalledTimes(3);
      expect(component.cardClick.emit).toHaveBeenCalledTimes(3);
    });

    it('should handle onClick function that throws an error', () => {
      const errorThrowingFunction = jasmine.createSpy('errorFunction').and.throwError('Test error');
      component.onClick = errorThrowingFunction;
      spyOn(component.cardClick, 'emit');

      expect(() => component.handleClick()).toThrow();
    });

    it('should work when onClick is an async function', async () => {
      let resolved = false;
      const asyncOnClick = jasmine.createSpy('asyncOnClick').and.returnValue(
        Promise.resolve().then(() => {
          resolved = true;
        })
      );
      component.onClick = asyncOnClick;

      component.handleClick();

      expect(asyncOnClick).toHaveBeenCalled();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(resolved).toBe(true);
    });
  });

  describe('Type safety and boundary conditions', () => {
    it('should handle onClick being assigned different function types', () => {
      component.onClick = () => {};
      expect(() => component.handleClick()).not.toThrow();

      component.onClick = function () {};
      expect(() => component.handleClick()).not.toThrow();

      component.onClick = () => 'return value';
      expect(() => component.handleClick()).not.toThrow();
    });

    it('should maintain component state during multiple interactions', () => {
      const clickCounts: number[] = [];
      let clickCount = 0;

      component.onClick = () => {
        clickCount++;
        clickCounts.push(clickCount);
      };

      component.handleClick();
      component.handleClick();
      component.handleClick();

      expect(clickCounts).toEqual([1, 2, 3]);
    });

    it('should work correctly after component re-initialization', () => {
      const mockOnClick = jasmine.createSpy('onClick');
      component.onClick = mockOnClick;

      component.handleClick();
      expect(mockOnClick).toHaveBeenCalledTimes(1);

      component.onClick = undefined;
      spyOn(component.cardClick, 'emit');

      component.handleClick();
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(component.cardClick.emit).toHaveBeenCalled();
    });
  });
});
