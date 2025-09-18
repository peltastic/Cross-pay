import { TestBed } from '@angular/core/testing';
import { SessionStorageService } from './session-storage.service';

describe('SessionStorageService', () => {
  let service: SessionStorageService;
  let mockSessionStorage: any;

  beforeEach(() => {
    mockSessionStorage = {
      data: {},
      setItem: jasmine.createSpy('setItem').and.callFake((key: string, value: string) => {
        mockSessionStorage.data[key] = value;
      }),
      getItem: jasmine.createSpy('getItem').and.callFake((key: string) => {
        return mockSessionStorage.data[key] || null;
      }),
      removeItem: jasmine.createSpy('removeItem').and.callFake((key: string) => {
        delete mockSessionStorage.data[key];
      }),
      clear: jasmine.createSpy('clear').and.callFake(() => {
        mockSessionStorage.data = {};
      })
    };

    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set item as JSON string', () => {
    const testKey = 'testKey';
    const testValue = { name: 'test', age: 25 };

    service.setItem(testKey, testValue);

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(testKey, JSON.stringify(testValue));
    expect(mockSessionStorage.data[testKey]).toBe(JSON.stringify(testValue));
  });

  it('should get item and parse as JSON', () => {
    const testKey = 'testKey';
    const testValue = { name: 'test', age: 25 };
    mockSessionStorage.data[testKey] = JSON.stringify(testValue);

    const result = service.getItem(testKey);

    expect(mockSessionStorage.getItem).toHaveBeenCalledWith(testKey);
    expect(result).toEqual(testValue);
  });

  it('should return null for non-existent key', () => {
    const result = service.getItem('nonExistentKey');

    expect(result).toBeNull();
  });

  it('should return null for key with null value', () => {
    const testKey = 'nullKey';
    mockSessionStorage.data[testKey] = null;

    const result = service.getItem(testKey);

    expect(result).toBeNull();
  });

  it('should handle different data types', () => {
    
    service.setItem('stringKey', 'testString');
    expect(service.getItem('stringKey')).toBe('testString');

    
    service.setItem('numberKey', 42);
    expect(service.getItem('numberKey')).toBe(42);

    
    service.setItem('booleanKey', true);
    expect(service.getItem('booleanKey')).toBe(true);

    
    const testArray = [1, 2, 3];
    service.setItem('arrayKey', testArray);
    expect(service.getItem('arrayKey')).toEqual(testArray);
    const testObject = { nested: { value: 'deep' } };
    service.setItem('objectKey', testObject);
    expect(service.getItem('objectKey')).toEqual(testObject);
  });

  it('should remove item', () => {
    const testKey = 'testKey';
    service.setItem(testKey, 'testValue');

    service.removeItem(testKey);

    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(testKey);
    expect(mockSessionStorage.data[testKey]).toBeUndefined();
  });

  it('should clear all items', () => {
    service.setItem('key1', 'value1');
    service.setItem('key2', 'value2');

    service.clear();

    expect(mockSessionStorage.clear).toHaveBeenCalled();
    expect(mockSessionStorage.data).toEqual({});
  });

  it('should handle JSON parse errors gracefully', () => {
    const testKey = 'invalidJsonKey';
    mockSessionStorage.data[testKey] = 'invalid json {';

    expect(() => service.getItem(testKey)).toThrow();
  });

  it('should work with generic types', () => {
    interface TestInterface {
      id: number;
      name: string;
    }

    const testData: TestInterface = { id: 1, name: 'test' };
    service.setItem('genericKey', testData);

    const result = service.getItem<TestInterface>('genericKey');
    expect(result).toEqual(testData);
    expect(result?.id).toBe(1);
    expect(result?.name).toBe('test');
  });
});