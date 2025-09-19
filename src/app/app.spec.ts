import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { App } from './app';

describe('App', () => {
  let swUpdateSpy: jasmine.SpyObj<SwUpdate>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('SwUpdate', ['checkForUpdate'], {
      isEnabled: false,
      versionUpdates: { pipe: () => ({ subscribe: () => {} }) }
    });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: SwUpdate, useValue: spy }
      ]
    }).compileComponents();

    swUpdateSpy = TestBed.inject(SwUpdate) as jasmine.SpyObj<SwUpdate>;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
