import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingLayout } from './onboarding-layout';

describe('OnboardingLayout', () => {
  let component: OnboardingLayout;
  let fixture: ComponentFixture<OnboardingLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnboardingLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
