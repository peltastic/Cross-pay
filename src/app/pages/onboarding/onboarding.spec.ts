import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, EMPTY } from 'rxjs';
import { LazyLoadService } from '../../core/services/lazy-load.service';
import { Onboarding } from './onboarding.component';

describe('Onboarding', () => {
  let component: Onboarding;
  let fixture: ComponentFixture<Onboarding>;
  let actions$: Observable<any>;

  beforeEach(async () => {
    actions$ = EMPTY;
    
    await TestBed.configureTestingModule({
      imports: [Onboarding],
      providers: [
        provideMockStore({
          initialState: {
            user: { email: null },
            wallet: { 
              wallet: null, 
              isCreatingWallet: false, 
              createWalletError: null
            }
          }
        }),
        provideMockActions(() => actions$),
        {
          provide: LazyLoadService,
          useValue: {
            loadComponent: jasmine.createSpy('loadComponent').and.returnValue(Promise.resolve({ instance: {} }))
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Onboarding);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have chart options configured', () => {
    expect(component.chartOptions).toEqual({
      path: '/chart.json'
    });
  });

  it('should have money bag options configured', () => {
    expect(component.moneyBagOptions).toEqual({
      path: '/money-bag.json'
    });
  });
});
