import { TestBed } from '@angular/core/testing';
import { ViewContainerRef, ComponentRef, Type } from '@angular/core';
import { LazyLoadService } from './lazy-load.service';

class MockComponent {
  constructor() {}
}

const mockModule = {
  MockComponent: MockComponent,
  TestComponent: MockComponent
};

describe('LazyLoadService', () => {
  let service: LazyLoadService;
  let mockViewContainerRef: jasmine.SpyObj<ViewContainerRef>;
  let mockComponentRef: jasmine.SpyObj<ComponentRef<MockComponent>>;

  beforeEach(() => {
    const viewContainerSpy = jasmine.createSpyObj('ViewContainerRef', ['createComponent']);
    const componentRefSpy = jasmine.createSpyObj('ComponentRef', ['destroy']);

    TestBed.configureTestingModule({
      providers: [
        LazyLoadService,
        { provide: ViewContainerRef, useValue: viewContainerSpy }
      ]
    });

    service = TestBed.inject(LazyLoadService);
    mockViewContainerRef = TestBed.inject(ViewContainerRef) as jasmine.SpyObj<ViewContainerRef>;
    mockComponentRef = componentRefSpy;

    mockViewContainerRef.createComponent.and.returnValue(mockComponentRef);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadComponent', () => {
    it('should load and create component successfully', async () => {
      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(mockModule));
      const componentName = 'MockComponent';

      const result = await service.loadComponent(mockLoader, componentName, mockViewContainerRef);

      expect(mockLoader).toHaveBeenCalled();
      expect(mockViewContainerRef.createComponent).toHaveBeenCalledWith(jasmine.any(Function));
      expect(result).toBe(mockComponentRef);
    });

    it('should load component with different component name', async () => {
      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(mockModule));
      const componentName = 'TestComponent';

      const result = await service.loadComponent(mockLoader, componentName, mockViewContainerRef);

      expect(mockLoader).toHaveBeenCalled();
      expect(mockViewContainerRef.createComponent).toHaveBeenCalledWith(jasmine.any(Function));
      expect(result).toBe(mockComponentRef);
    });

    it('should throw error when component is not found in module', async () => {
      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(mockModule));
      const componentName = 'NonExistentComponent';

      try {
        await service.loadComponent(mockLoader, componentName, mockViewContainerRef);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toEqual(new Error('Component NonExistentComponent not found in module'));
        expect(mockViewContainerRef.createComponent).not.toHaveBeenCalled();
      }
    });

    it('should handle empty module', async () => {
      const emptyModule = {};
      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(emptyModule));
      const componentName = 'MockComponent';

      try {
        await service.loadComponent(mockLoader, componentName, mockViewContainerRef);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toEqual(new Error('Component MockComponent not found in module'));
      }
    });

    it('should handle loader that throws error', async () => {
      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.reject(new Error('Module load failed')));
      const componentName = 'MockComponent';

      try {
        await service.loadComponent(mockLoader, componentName, mockViewContainerRef);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toEqual(new Error('Module load failed'));
        expect(mockViewContainerRef.createComponent).not.toHaveBeenCalled();
      }
    });

    it('should handle null component in module', async () => {
      const moduleWithNull = {
        MockComponent: null
      };
      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(moduleWithNull));
      const componentName = 'MockComponent';

      try {
        await service.loadComponent(mockLoader, componentName, mockViewContainerRef);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toEqual(new Error('Component MockComponent not found in module'));
      }
    });

    it('should handle undefined component in module', async () => {
      const moduleWithUndefined = {
        MockComponent: undefined
      };
      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(moduleWithUndefined));
      const componentName = 'MockComponent';

      try {
        await service.loadComponent(mockLoader, componentName, mockViewContainerRef);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toEqual(new Error('Component MockComponent not found in module'));
      }
    });

    it('should handle case-sensitive component names', async () => {
      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(mockModule));
      const componentName = 'mockcomponent'; // lowercase

      try {
        await service.loadComponent(mockLoader, componentName, mockViewContainerRef);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toEqual(new Error('Component mockcomponent not found in module'));
      }
    });
  });

  describe('loadModalComponent', () => {
    it('should load modal component successfully', async () => {
      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(mockModule));
      const componentName = 'MockComponent';

      const result = await service.loadModalComponent(mockLoader, componentName);

      expect(mockLoader).toHaveBeenCalled();
      expect(result).toBe(MockComponent);
    });

    it('should load different modal component', async () => {
      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(mockModule));
      const componentName = 'TestComponent';

      const result = await service.loadModalComponent(mockLoader, componentName);

      expect(mockLoader).toHaveBeenCalled();
      expect(result).toBe(MockComponent);
    });

    it('should throw error when modal component is not found', async () => {
      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(mockModule));
      const componentName = 'NonExistentModalComponent';

      try {
        await service.loadModalComponent(mockLoader, componentName);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toEqual(new Error('Component NonExistentModalComponent not found in module'));
      }
    });

    it('should handle empty module for modal component', async () => {
      const emptyModule = {};
      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(emptyModule));
      const componentName = 'MockComponent';

      try {
        await service.loadModalComponent(mockLoader, componentName);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toEqual(new Error('Component MockComponent not found in module'));
      }
    });

    it('should handle loader rejection for modal component', async () => {
      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.reject(new Error('Modal module load failed')));
      const componentName = 'MockComponent';

      try {
        await service.loadModalComponent(mockLoader, componentName);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toEqual(new Error('Modal module load failed'));
      }
    });

    it('should handle null modal component in module', async () => {
      const moduleWithNull = {
        MockComponent: null
      };
      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(moduleWithNull));
      const componentName = 'MockComponent';

      try {
        await service.loadModalComponent(mockLoader, componentName);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toEqual(new Error('Component MockComponent not found in module'));
      }
    });

    it('should handle concurrent modal component loads', async () => {
      const mockLoader1 = jasmine.createSpy('loader1').and.returnValue(Promise.resolve(mockModule));
      const mockLoader2 = jasmine.createSpy('loader2').and.returnValue(Promise.resolve(mockModule));

      const [result1, result2] = await Promise.all([
        service.loadModalComponent(mockLoader1, 'MockComponent'),
        service.loadModalComponent(mockLoader2, 'TestComponent')
      ]);

      expect(mockLoader1).toHaveBeenCalled();
      expect(mockLoader2).toHaveBeenCalled();
      expect(result1).toBe(MockComponent);
      expect(result2).toBe(MockComponent);
    });

    it('should handle mixed success and failure scenarios', async () => {
      const successLoader = jasmine.createSpy('successLoader').and.returnValue(Promise.resolve(mockModule));
      const failLoader = jasmine.createSpy('failLoader').and.returnValue(Promise.reject(new Error('Load failed')));

      const successPromise = service.loadModalComponent(successLoader, 'MockComponent');
      const failPromise = service.loadModalComponent(failLoader, 'MockComponent');

      const successResult = await successPromise;
      expect(successResult).toBe(MockComponent);

      try {
        await failPromise;
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toEqual(new Error('Load failed'));
      }
    });
  });

  describe('edge cases and performance', () => {
    it('should handle very large module objects', async () => {
      const largeModule: { [key: string]: Type<any> } = {};
      for (let i = 0; i < 1000; i++) {
        largeModule[`Component${i}`] = MockComponent;
      }
      largeModule['TargetComponent'] = MockComponent;

      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(largeModule));

      const result = await service.loadModalComponent(mockLoader, 'TargetComponent');
      expect(result).toBe(MockComponent);
    });

    it('should handle long component names', async () => {
      const longName = 'VeryLongComponentNameThatExceedsNormalLimits'.repeat(10);
      const moduleWithLongName = {
        [longName]: MockComponent
      };

      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(moduleWithLongName));

      const result = await service.loadModalComponent(mockLoader, longName);
      expect(result).toBe(MockComponent);
    });

    it('should handle special characters in component names', async () => {
      const specialName = 'Component$With@Special#Characters';
      const moduleWithSpecialName = {
        [specialName]: MockComponent
      };

      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(moduleWithSpecialName));

      const result = await service.loadModalComponent(mockLoader, specialName);
      expect(result).toBe(MockComponent);
    });

    it('should handle numeric component names', async () => {
      const numericName = '123Component456';
      const moduleWithNumericName = {
        [numericName]: MockComponent
      };

      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(moduleWithNumericName));

      const result = await service.loadModalComponent(mockLoader, numericName);
      expect(result).toBe(MockComponent);
    });

    it('should handle rapid successive calls', async () => {
      const mockLoader = jasmine.createSpy('loader').and.returnValue(Promise.resolve(mockModule));
      
      const promises = Array.from({ length: 10 }, (_, i) => 
        service.loadModalComponent(mockLoader, 'MockComponent')
      );

      const results = await Promise.all(promises);
      
      expect(mockLoader).toHaveBeenCalledTimes(10);
      results.forEach(result => {
        expect(result).toBe(MockComponent);
      });
    });
  });
});