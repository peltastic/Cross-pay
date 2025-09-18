import { TestBed } from '@angular/core/testing';
import { DarkModeService } from './dark-mode.service';

describe('DarkModeService', () => {
  let service: DarkModeService;
  let mockLocalStorage: any;
  let mockWindow: any;

  beforeEach(() => {
    mockLocalStorage = {
      theme: undefined,
      getItem: (key: string) => mockLocalStorage[key],
      setItem: (key: string, value: string) => (mockLocalStorage[key] = value),
      removeItem: (key: string) => delete mockLocalStorage[key],
    };

    mockWindow = {
      matchMedia: jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
      }),
    };

    spyOnProperty(document, 'documentElement', 'get').and.returnValue({
      classList: {
        toggle: jasmine.createSpy('toggle'),
      },
    } as any);
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true });
    Object.defineProperty(window, 'matchMedia', { value: mockWindow.matchMedia, writable: true });

    TestBed.configureTestingModule({});
    service = TestBed.inject(DarkModeService);
  });

  afterEach(() => {
    mockLocalStorage.theme = undefined;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with system preference when no theme in localStorage', () => {
    // Set up mocks before service initialization
    delete mockLocalStorage.theme;
    mockWindow.matchMedia.and.returnValue({
      matches: true,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
    });

    // Create service manually with the proper setup
    const testService = new DarkModeService();

    // Test should pass now since system preference is dark (true)
    expect(testService.getCurrentMode()).toBe(true);
  });

  it('should initialize with localStorage theme when available', () => {
    mockLocalStorage.theme = 'dark';

    service = new DarkModeService();

    expect(service.getCurrentMode()).toBe(true);
  });

  it('should initialize with light mode when localStorage is light', () => {
    mockLocalStorage.theme = 'light';

    service = new DarkModeService();

    expect(service.getCurrentMode()).toBe(false);
  });

  it('should toggle to dark mode when currently light', () => {
    mockLocalStorage.theme = 'light';
    service = new DarkModeService();

    service.toggleDarkMode();

    expect(mockLocalStorage.theme).toBe('dark');
    expect(service.getCurrentMode()).toBe(true);
  });

  it('should toggle to light mode when currently dark', () => {
    mockLocalStorage.theme = 'dark';
    service = new DarkModeService();

    service.toggleDarkMode();

    expect(mockLocalStorage.theme).toBe('light');
    expect(service.getCurrentMode()).toBe(false);
  });

  it('should set dark mode', () => {
    service.setDarkMode();

    expect(mockLocalStorage.theme).toBe('dark');
    expect(service.getCurrentMode()).toBe(true);
  });

  it('should set light mode', () => {
    service.setLightMode();

    expect(mockLocalStorage.theme).toBe('light');
    expect(service.getCurrentMode()).toBe(false);
  });

  it('should respect OS preference by removing localStorage theme', () => {
    mockLocalStorage.theme = 'dark';
    mockWindow.matchMedia.and.returnValue({ matches: false });

    service.respectOSPreference();

    expect(mockLocalStorage.theme).toBeUndefined();
    expect(service.getCurrentMode()).toBe(false);
  });

  it('should emit isDarkMode$ observable changes', (done) => {
    let emissionCount = 0;

    service.isDarkMode$.subscribe((isDark) => {
      emissionCount++;
      if (emissionCount === 1) {
        // Initial value
        expect(isDark).toBe(false);
        service.setDarkMode();
      } else if (emissionCount === 2) {
        // After setDarkMode
        expect(isDark).toBe(true);
        done();
      }
    });
  });

  it('should apply theme to document element', () => {
    mockLocalStorage.theme = 'dark';
    const toggleSpy = document.documentElement.classList.toggle as jasmine.Spy;

    service.setDarkMode();

    expect(toggleSpy).toHaveBeenCalledWith('dark', true);
  });

  it('should return current mode correctly', () => {
    service.setDarkMode();
    expect(service.getCurrentMode()).toBe(true);

    service.setLightMode();
    expect(service.getCurrentMode()).toBe(false);
  });
});
