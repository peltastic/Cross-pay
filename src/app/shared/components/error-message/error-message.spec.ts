import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorMessageComponent } from './error-message';

describe('ErrorMessageComponent', () => {
  let component: ErrorMessageComponent;
  let fixture: ComponentFixture<ErrorMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMessageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorMessageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display projected content', () => {
    const testMessage = 'Test error message';
    fixture.nativeElement.innerHTML = `<app-error-message>${testMessage}</app-error-message>`;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(testMessage);
  });

  it('should apply error styling classes', () => {
    fixture.detectChanges();

    const errorDiv = fixture.nativeElement.querySelector('div');
    expect(errorDiv).toBeTruthy();
    expect(errorDiv.classList).toContain('bg-error-message-background');
    expect(errorDiv.classList).toContain('text-error-message-text');
    expect(errorDiv.classList).toContain('py-4');
    expect(errorDiv.classList).toContain('px-4');
    expect(errorDiv.classList).toContain('text-sm');
    expect(errorDiv.classList).toContain('rounded-md');
    expect(errorDiv.classList).toContain('mb-4');
  });

  it('should render paragraph element for content', () => {
    fixture.detectChanges();

    const paragraph = fixture.nativeElement.querySelector('p');
    expect(paragraph).toBeTruthy();
  });
});