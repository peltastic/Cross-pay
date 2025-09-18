import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { InputComponent } from './input';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.type).toBe('text');
    expect(component.placeholder).toBe('');
    expect(component.disabled).toBe(false);
    expect(component.class).toBe('');
    expect(component.step).toBe('');
    expect(component.min).toBe('');
    expect(component.value).toBe('');
  });

  it('should write value correctly', () => {
    const testValue = 'test value';
    
    component.writeValue(testValue);
    
    expect(component.value).toBe(testValue);
  });

  it('should handle null value in writeValue', () => {
    component.writeValue(null as any);
    
    expect(component.value).toBe('');
  });

  it('should register onChange function', () => {
    const mockOnChange = jasmine.createSpy('onChange');
    
    component.registerOnChange(mockOnChange);
    
    expect(component.onChange).toBe(mockOnChange);
  });

  it('should register onTouched function', () => {
    const mockOnTouched = jasmine.createSpy('onTouched');
    
    component.registerOnTouched(mockOnTouched);
    
    expect(component.onTouched).toBe(mockOnTouched);
  });

  it('should handle input event', () => {
    const testValue = 'new value';
    spyOn(component, 'onChange');
    
    const mockEvent = {
      target: { value: testValue }
    } as any;
    
    component.onInput(mockEvent);
    
    expect(component.value).toBe(testValue);
    expect(component.onChange).toHaveBeenCalledWith(testValue);
  });

  it('should handle blur event', () => {
    spyOn(component, 'onTouched');
    
    component.onBlur();
    
    expect(component.onTouched).toHaveBeenCalled();
  });

  it('should trigger onInput when input element changes', () => {
    spyOn(component, 'onInput');
    const inputElement = debugElement.query(By.css('input'));
    
    inputElement.triggerEventHandler('input', { target: { value: 'test' } });
    
    expect(component.onInput).toHaveBeenCalled();
  });

  it('should trigger onBlur when input element loses focus', () => {
    spyOn(component, 'onBlur');
    const inputElement = debugElement.query(By.css('input'));
    
    inputElement.triggerEventHandler('blur', null);
    
    expect(component.onBlur).toHaveBeenCalled();
  });
});
