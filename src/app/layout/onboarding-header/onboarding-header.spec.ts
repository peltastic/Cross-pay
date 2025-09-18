import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingHeader } from './onboarding-header';

describe('OnboardingHeader', () => {
  let component: OnboardingHeader;
  let fixture: ComponentFixture<OnboardingHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
