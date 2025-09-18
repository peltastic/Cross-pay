import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { ButtonComponent } from './button';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.disabled).toBe(false);
    expect(component.loading).toBe(false);
    expect(component.type).toBe('button');
    expect(component.variant).toBe('primary');
    expect(component.class).toBe('');
  });

  it('should emit click event when button is clicked and not disabled or loading', () => {
    spyOn(component.click, 'emit');
    
    component.onClick();
    
    expect(component.click.emit).toHaveBeenCalled();
  });

  it('should not emit click event when button is disabled', () => {
    spyOn(component.click, 'emit');
    component.disabled = true;
    
    component.onClick();
    
    expect(component.click.emit).not.toHaveBeenCalled();
  });

  it('should not emit click event when button is loading', () => {
    spyOn(component.click, 'emit');
    component.loading = true;
    
    component.onClick();
    
    expect(component.click.emit).not.toHaveBeenCalled();
  });

  it('should generate correct button classes for primary variant', () => {
    component.variant = 'primary';
    
    const classes = component.buttonClasses;
    
    expect(classes).toContain('bg-button-background');
    expect(classes).toContain('text-white');
  });

  it('should generate correct button classes for secondary variant', () => {
    component.variant = 'secondary';
    
    const classes = component.buttonClasses;
    
    expect(classes).toContain('dark:text-white');
    expect(classes).toContain('text-gray-900');
  });

  it('should generate correct button classes for danger variant', () => {
    component.variant = 'danger';
    
    const classes = component.buttonClasses;
    
    expect(classes).toContain('bg-red-600');
    expect(classes).toContain('text-white');
  });

  it('should include custom class in button classes', () => {
    component.class = 'custom-class';
    
    const classes = component.buttonClasses;
    
    expect(classes).toContain('custom-class');
  });

  it('should trigger onClick when button element is clicked', () => {
    spyOn(component, 'onClick');
    const buttonElement = debugElement.query(By.css('button'));
    
    buttonElement.triggerEventHandler('click', null);
    
    expect(component.onClick).toHaveBeenCalled();
  });
});
