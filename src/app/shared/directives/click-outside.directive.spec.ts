import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  template: `
    <div class="container">
      <div
        class="target-element"
        clickOutside
        (clickOutside)="onClickOutside()"
        data-testid="target"
      >
        Target Element
        <div class="child-element" data-testid="child">Child Element</div>
      </div>
      <div class="outside-element" data-testid="outside">Outside Element</div>
    </div>
  `,
  standalone: true,
  imports: [ClickOutsideDirective],
})
class TestComponent {
  clickOutsideCount = 0;

  onClickOutside() {
    this.clickOutsideCount++;
  }
}

describe('ClickOutsideDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let targetElement: DebugElement;
  let childElement: DebugElement;
  let outsideElement: DebugElement;
  let directive: ClickOutsideDirective;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    targetElement = fixture.debugElement.query(By.css('[data-testid="target"]'));
    childElement = fixture.debugElement.query(By.css('[data-testid="child"]'));
    outsideElement = fixture.debugElement.query(By.css('[data-testid="outside"]'));
    directive = targetElement.injector.get(ClickOutsideDirective);
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });

  it('should initialize with clickOutside event emitter', () => {
    expect(directive.clickOutside).toBeDefined();
    expect(directive.clickOutside.emit).toBeDefined();
  });

  describe('onDocumentClick', () => {
    it('should emit clickOutside when clicking outside the element', () => {
      spyOn(component, 'onClickOutside');

      // Simulate click outside
      const outsideClickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(outsideClickEvent, 'target', {
        value: outsideElement.nativeElement,
        writable: false,
      });

      directive.onDocumentClick(outsideClickEvent);

      expect(component.onClickOutside).toHaveBeenCalled();
    });

    it('should not emit clickOutside when clicking on the element itself', () => {
      spyOn(component, 'onClickOutside');

      // Simulate click on target element
      const targetClickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(targetClickEvent, 'target', {
        value: targetElement.nativeElement,
        writable: false,
      });

      directive.onDocumentClick(targetClickEvent);

      expect(component.onClickOutside).not.toHaveBeenCalled();
    });

    it('should not emit clickOutside when clicking on a child element', () => {
      spyOn(component, 'onClickOutside');

      // Simulate click on child element
      const childClickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(childClickEvent, 'target', {
        value: childElement.nativeElement,
        writable: false,
      });

      directive.onDocumentClick(childClickEvent);

      expect(component.onClickOutside).not.toHaveBeenCalled();
    });

    it('should handle null target', () => {
      spyOn(component, 'onClickOutside');

      const nullTargetEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(nullTargetEvent, 'target', {
        value: null,
        writable: false,
      });

      expect(() => directive.onDocumentClick(nullTargetEvent)).not.toThrow();
      expect(component.onClickOutside).toHaveBeenCalled();
    });

    it('should handle undefined target', () => {
      spyOn(component, 'onClickOutside');

      const undefinedTargetEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(undefinedTargetEvent, 'target', {
        value: undefined,
        writable: false,
      });

      expect(() => directive.onDocumentClick(undefinedTargetEvent)).not.toThrow();
      expect(component.onClickOutside).toHaveBeenCalled();
    });

    it('should emit clickOutside for non-element targets', () => {
      spyOn(component, 'onClickOutside');

      const textNode = document.createTextNode('test');
      const textNodeEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(textNodeEvent, 'target', {
        value: textNode,
        writable: false,
      });

      directive.onDocumentClick(textNodeEvent);

      expect(component.onClickOutside).toHaveBeenCalled();
    });

    it('should handle deeply nested child elements', () => {
      spyOn(component, 'onClickOutside');

      const deepChild = document.createElement('span');
      childElement.nativeElement.appendChild(deepChild);

      const deepChildEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(deepChildEvent, 'target', {
        value: deepChild,
        writable: false,
      });

      directive.onDocumentClick(deepChildEvent);

      expect(component.onClickOutside).not.toHaveBeenCalled();
    });

    it('should work with multiple directive instances', () => {
      const secondFixture = TestBed.createComponent(TestComponent);
      const secondComponent = secondFixture.componentInstance;
      secondFixture.detectChanges();

      const secondTargetElement = secondFixture.debugElement.query(
        By.css('[data-testid="target"]')
      );
      const secondDirective = secondTargetElement.injector.get(ClickOutsideDirective);

      spyOn(component, 'onClickOutside');
      spyOn(secondComponent, 'onClickOutside');

      const outsideEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(outsideEvent, 'target', {
        value: outsideElement.nativeElement,
        writable: false,
      });

      directive.onDocumentClick(outsideEvent);
      secondDirective.onDocumentClick(outsideEvent);

      expect(component.onClickOutside).toHaveBeenCalled();
      expect(secondComponent.onClickOutside).toHaveBeenCalled();
    });
  });

  describe('HostListener integration', () => {
    it('should respond to actual document click events', () => {
      spyOn(component, 'onClickOutside');

      outsideElement.nativeElement.click();

      expect(component.onClickOutside).toHaveBeenCalled();
    });

    it('should not respond to clicks on target element through actual events', () => {
      spyOn(component, 'onClickOutside');

      targetElement.nativeElement.click();

      expect(component.onClickOutside).not.toHaveBeenCalled();
    });

    it('should not respond to clicks on child elements through actual events', () => {
      spyOn(component, 'onClickOutside');

      childElement.nativeElement.click();

      expect(component.onClickOutside).not.toHaveBeenCalled();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle clicks on removed elements', () => {
      spyOn(component, 'onClickOutside');

      const removedElement = document.createElement('div');
      const removedElementEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(removedElementEvent, 'target', {
        value: removedElement,
        writable: false,
      });

      expect(() => directive.onDocumentClick(removedElementEvent)).not.toThrow();
      expect(component.onClickOutside).toHaveBeenCalled();
    });

    it('should handle synthetic events', () => {
      spyOn(component, 'onClickOutside');

      const syntheticEvent = {
        target: outsideElement.nativeElement,
        preventDefault: jasmine.createSpy('preventDefault'),
        stopPropagation: jasmine.createSpy('stopPropagation'),
      } as any;

      directive.onDocumentClick(syntheticEvent);

      expect(component.onClickOutside).toHaveBeenCalled();
    });

    it('should work with different element types', () => {
      spyOn(component, 'onClickOutside');

      const buttonElement = document.createElement('button');
      document.body.appendChild(buttonElement);

      const buttonEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(buttonEvent, 'target', {
        value: buttonElement,
        writable: false,
      });

      directive.onDocumentClick(buttonEvent);

      expect(component.onClickOutside).toHaveBeenCalled();

      document.body.removeChild(buttonElement);
    });
  });

  describe('performance and memory', () => {
    it('should not leak memory with multiple clicks', () => {
      spyOn(component, 'onClickOutside');

      for (let i = 0; i < 100; i++) {
        const event = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(event, 'target', {
          value: outsideElement.nativeElement,
          writable: false,
        });
        directive.onDocumentClick(event);
      }

      expect(component.onClickOutside).toHaveBeenCalledTimes(100);
    });

    it('should handle rapid successive clicks', () => {
      spyOn(component, 'onClickOutside');
      let callCount = 0;

      component.onClickOutside = () => {
        callCount++;
      };

      const event1 = new MouseEvent('click', { bubbles: true });
      const event2 = new MouseEvent('click', { bubbles: true });

      Object.defineProperty(event1, 'target', {
        value: outsideElement.nativeElement,
        writable: false,
      });
      Object.defineProperty(event2, 'target', {
        value: outsideElement.nativeElement,
        writable: false,
      });

      directive.onDocumentClick(event1);
      directive.onDocumentClick(event2);

      expect(callCount).toBe(2);
    });
  });
});
