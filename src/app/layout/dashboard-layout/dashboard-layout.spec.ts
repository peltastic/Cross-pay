import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewContainerRef, ComponentRef } from '@angular/core';
import { DashboardLayout } from './dashboard-layout';
import { LazyLoadService } from '../../core/services/lazy-load.service';
import { HamburgerMenuComponent } from '../../shared/components/navigation/hamburger-menu/hamburger-menu';

describe('DashboardLayout', () => {
  let component: DashboardLayout;
  let fixture: ComponentFixture<DashboardLayout>;
  let lazyLoadService: jasmine.SpyObj<LazyLoadService>;
  let mockSidebarContainer: jasmine.SpyObj<ViewContainerRef>;
  let mockMobileSidebarContainer: jasmine.SpyObj<ViewContainerRef>;
  function createMockComponentRef(instanceData: any): Partial<ComponentRef<any>> {
    return {
      instance: instanceData,
      location: {} as any,
      injector: {} as any,
      hostView: {} as any,
      componentType: {} as any,
      changeDetectorRef: {} as any,
      onDestroy: jasmine.createSpy('onDestroy'),
      destroy: jasmine.createSpy('destroy'),
      setInput: jasmine.createSpy('setInput'),
    };
  }

  beforeEach(async () => {
    const lazyLoadSpy = jasmine.createSpyObj('LazyLoadService', ['loadComponent']);
    const mockViewContainerRef = jasmine.createSpyObj('ViewContainerRef', [
      'clear',
      'createComponent',
    ]);

    await TestBed.configureTestingModule({
      imports: [DashboardLayout, HamburgerMenuComponent],
      providers: [{ provide: LazyLoadService, useValue: lazyLoadSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardLayout);
    component = fixture.componentInstance;
    lazyLoadService = TestBed.inject(LazyLoadService) as jasmine.SpyObj<LazyLoadService>;

    mockSidebarContainer = jasmine.createSpyObj('ViewContainerRef', ['clear']);
    mockMobileSidebarContainer = jasmine.createSpyObj('ViewContainerRef', ['clear']);

    component.sidebarContainer = mockSidebarContainer;
    component.mobileSidebarContainer = mockMobileSidebarContainer;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isMobileSidebarOpen).toBe(false);
    expect(component['mobileSidebarRef']).toBeUndefined();
  });

  describe('ngOnInit', () => {
    it('should call loadSidebar on init', async () => {
      spyOn(component as any, 'loadSidebar').and.returnValue(Promise.resolve());

      await component.ngOnInit();

      expect(component['loadSidebar']).toHaveBeenCalled();
    });

    it('should handle loadSidebar errors gracefully', async () => {
      lazyLoadService.loadComponent.and.returnValue(Promise.reject(new Error('Load failed')));
      spyOn(console, 'error');

      await component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith('Error loading sidebar:', jasmine.any(Error));
    });
  });

  describe('loadSidebar', () => {
    it('should load sidebar component successfully', async () => {
      const mockComponent = createMockComponentRef({});
      lazyLoadService.loadComponent.and.returnValue(
        Promise.resolve(mockComponent as ComponentRef<any>)
      );

      await component['loadSidebar']();

      expect(lazyLoadService.loadComponent).toHaveBeenCalledWith(
        jasmine.any(Function),
        'Sidebar',
        mockSidebarContainer
      );
    });

    it('should handle sidebar loading errors', async () => {
      const error = new Error('Failed to load sidebar');
      lazyLoadService.loadComponent.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      await component['loadSidebar']();

      expect(console.error).toHaveBeenCalledWith('Error loading sidebar:', error);
    });
  });

  describe('onToggleMobileSidebar', () => {
    it('should set isMobileSidebarOpen to true when opening', async () => {
      await component.onToggleMobileSidebar(true);

      expect(component.isMobileSidebarOpen).toBe(true);
    });

    it('should set isMobileSidebarOpen to false when closing', async () => {
      component.isMobileSidebarOpen = true;

      await component.onToggleMobileSidebar(false);

      expect(component.isMobileSidebarOpen).toBe(false);
    });

    it('should load mobile sidebar when opening and not already loaded', async () => {
      const mockMobileSidebarRef = createMockComponentRef({
        isOpen: false,
        close: {
          subscribe: jasmine.createSpy('subscribe').and.callFake((callback: Function) => {
            setTimeout(() => callback(), 0);
          }),
        },
      });

      lazyLoadService.loadComponent.and.returnValue(
        Promise.resolve(mockMobileSidebarRef as ComponentRef<any>)
      );
      spyOn(component, 'onCloseMobileSidebar');

      await component.onToggleMobileSidebar(true);

      expect(lazyLoadService.loadComponent).toHaveBeenCalledWith(
        jasmine.any(Function),
        'MobileSidebarComponent',
        mockMobileSidebarContainer
      );
      expect(mockMobileSidebarRef.instance.isOpen).toBe(true);
      expect(component['mobileSidebarRef']).toBe(mockMobileSidebarRef);
    });

    it('should handle mobile sidebar loading errors', async () => {
      const error = new Error('Failed to load mobile sidebar');
      lazyLoadService.loadComponent.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      await component.onToggleMobileSidebar(true);

      expect(console.error).toHaveBeenCalledWith('Error loading mobile sidebar:', error);
    });

    it('should update existing mobile sidebar instance when already loaded', async () => {
      const mockMobileSidebarRef = createMockComponentRef({
        isOpen: false,
        close: { subscribe: jasmine.createSpy('subscribe') },
      });

      component['mobileSidebarRef'] = mockMobileSidebarRef;

      await component.onToggleMobileSidebar(true);

      expect(mockMobileSidebarRef.instance.isOpen).toBe(true);
      expect(lazyLoadService.loadComponent).not.toHaveBeenCalled();
    });

    it('should close existing mobile sidebar when toggling off', async () => {
      const mockMobileSidebarRef = createMockComponentRef({
        isOpen: true,
        close: { subscribe: jasmine.createSpy('subscribe') },
      });

      component['mobileSidebarRef'] = mockMobileSidebarRef;

      await component.onToggleMobileSidebar(false);

      expect(mockMobileSidebarRef.instance.isOpen).toBe(false);
    });

    it('should handle mobile sidebar close subscription callback', async () => {
      const mockMobileSidebarRef = createMockComponentRef({
        isOpen: false,
        close: {
          subscribe: jasmine.createSpy('subscribe').and.callFake((callback: Function) => {
            callback();
          }),
        },
      });

      lazyLoadService.loadComponent.and.returnValue(
        Promise.resolve(mockMobileSidebarRef as ComponentRef<any>)
      );
      spyOn(component, 'onCloseMobileSidebar');

      await component.onToggleMobileSidebar(true);

      expect(component.onCloseMobileSidebar).toHaveBeenCalled();
    });
  });

  describe('onCloseMobileSidebar', () => {
    it('should set isMobileSidebarOpen to false', () => {
      component.isMobileSidebarOpen = true;

      component.onCloseMobileSidebar();

      expect(component.isMobileSidebarOpen).toBe(false);
    });

    it('should close mobile sidebar instance if it exists', () => {
      const mockMobileSidebarRef = createMockComponentRef({
        isOpen: true,
      });

      component['mobileSidebarRef'] = mockMobileSidebarRef;

      component.onCloseMobileSidebar();

      expect(mockMobileSidebarRef.instance.isOpen).toBe(false);
    });

    it('should handle case when mobile sidebar ref does not exist', () => {
      component['mobileSidebarRef'] = null;

      expect(() => component.onCloseMobileSidebar()).not.toThrow();
      expect(component.isMobileSidebarOpen).toBe(false);
    });
  });

  describe('edge cases and integration', () => {
    it('should handle multiple rapid toggle calls', async () => {
      const mockMobileSidebarRef = createMockComponentRef({
        isOpen: false,
        close: { subscribe: jasmine.createSpy('subscribe') },
      });

      lazyLoadService.loadComponent.and.returnValue(
        Promise.resolve(mockMobileSidebarRef as ComponentRef<any>)
      );

      await component.onToggleMobileSidebar(true);
      await component.onToggleMobileSidebar(false);
      await component.onToggleMobileSidebar(true);

      expect(component.isMobileSidebarOpen).toBe(true);
      expect(lazyLoadService.loadComponent).toHaveBeenCalledTimes(1);
    });

    it('should maintain state consistency during async operations', async () => {
      let resolvePromise: Function;
      const loadPromise = new Promise<ComponentRef<any>>((resolve) => {
        resolvePromise = resolve;
      });

      lazyLoadService.loadComponent.and.returnValue(loadPromise);

      // Start loading
      const togglePromise = component.onToggleMobileSidebar(true);
      expect(component.isMobileSidebarOpen).toBe(true);

      // Resolve the loading
      const mockRef = createMockComponentRef({
        isOpen: false,
        close: { subscribe: jasmine.createSpy('subscribe') },
      });
      resolvePromise!(mockRef as ComponentRef<any>);

      await togglePromise;
      expect(component['mobileSidebarRef']).toBe(mockRef);
    });
  });
});
