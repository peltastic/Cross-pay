import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LazyLoadService } from '../../core/services/lazy-load.service';

import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    const mockComponentRef = {
      instance: {},
      destroy: jasmine.createSpy('destroy')
    };
    
    const mockLazyLoadService = {
      loadComponent: jasmine.createSpy('loadComponent').and.returnValue(Promise.resolve(mockComponentRef))
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: LazyLoadService, useValue: mockLazyLoadService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
