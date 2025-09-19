import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let mockRouter: jasmine.SpyObj<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });

    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    route = {} as ActivatedRouteSnapshot;
    state = {} as RouterStateSnapshot;
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should allow access when user email exists in session storage', () => {
    sessionStorage.setItem('email', JSON.stringify('test@example.com'));

    TestBed.runInInjectionContext(() => {
      const result = authGuard(route, state);
      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  it('should redirect to get-started when user email does not exist in session storage', () => {
    TestBed.runInInjectionContext(() => {
      const result = authGuard(route, state);
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/get-started']);
    });
  });

  it('should redirect to get-started when user email is empty string', () => {
    sessionStorage.setItem('email', JSON.stringify(''));

    TestBed.runInInjectionContext(() => {
      const result = authGuard(route, state);
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/get-started']);
    });
  });

  it('should redirect to get-started when user email is null', () => {
    sessionStorage.setItem('email', JSON.stringify(null));

    TestBed.runInInjectionContext(() => {
      const result = authGuard(route, state);
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/get-started']);
    });
  });

  it('should redirect to get-started when session storage contains invalid JSON', () => {
    sessionStorage.setItem('email', 'invalid-json');

    TestBed.runInInjectionContext(() => {
      const result = authGuard(route, state);
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/get-started']);
    });
  });
});