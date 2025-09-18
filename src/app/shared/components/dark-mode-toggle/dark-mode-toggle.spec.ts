import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { DarkModeToggleComponent } from './dark-mode-toggle';
import { DarkModeService } from '../../../core/services/dark-mode.service';

describe('DarkModeToggleComponent', () => {
  let component: DarkModeToggleComponent;
  let fixture: ComponentFixture<DarkModeToggleComponent>;
  let mockDarkModeService: jasmine.SpyObj<DarkModeService>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    mockDarkModeService = jasmine.createSpyObj('DarkModeService', ['toggleDarkMode'], {
      isDarkMode$: of(false),
    });

    await TestBed.configureTestingModule({
      imports: [DarkModeToggleComponent],
      providers: [{ provide: DarkModeService, useValue: mockDarkModeService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DarkModeToggleComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize isDarkMode$ from service', () => {
    expect(component.isDarkMode$).toBe(mockDarkModeService.isDarkMode$);
  });

  it('should call toggleDarkMode on service when toggleDarkMode is called', () => {
    component.toggleDarkMode();

    expect(mockDarkModeService.toggleDarkMode).toHaveBeenCalled();
  });

  it('should call toggleDarkMode when button is clicked', () => {
    spyOn(component, 'toggleDarkMode');
    const button = debugElement.query(By.css('button'));

    button.triggerEventHandler('click', null);

    expect(component.toggleDarkMode).toHaveBeenCalled();
  });

  it('should display correct content based on dark mode state', () => {
    mockDarkModeService.isDarkMode$ = of(false);
    component.isDarkMode$ = mockDarkModeService.isDarkMode$;
    fixture.detectChanges();

    const moonIcon = fixture.debugElement.query(By.css('svg'));
    expect(moonIcon).toBeTruthy();
    mockDarkModeService.isDarkMode$ = of(true);
    component.isDarkMode$ = mockDarkModeService.isDarkMode$;
    fixture.detectChanges();

    const sunIcon = fixture.debugElement.query(By.css('svg'));
    expect(sunIcon).toBeTruthy();
  });
});
