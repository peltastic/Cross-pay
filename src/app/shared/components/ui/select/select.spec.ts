import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectComponent } from './select';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;

  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should set options correctly', () => {
      component.options = mockOptions;
      expect(component.options).toEqual(mockOptions);
    });

    it('should handle null options', () => {
      component.options = null as any;
      expect(component.options).toEqual([]);
    });

    it('should handle undefined options', () => {
      component.options = undefined as any;
      expect(component.options).toEqual([]);
    });

    it('should set placeholder correctly', () => {
      const placeholder = 'Custom placeholder';
      component.placeholder = placeholder;
      expect(component.placeholder).toBe(placeholder);
    });

    it('should have default placeholder', () => {
      expect(component.placeholder).toBe('Select an option');
    });

    it('should set disabled state', () => {
      component.disabled = true;
      expect(component.disabled).toBe(true);
    });

    it('should have default disabled state as false', () => {
      expect(component.disabled).toBe(false);
    });

    it('should set size correctly', () => {
      component.size = 'lg';
      expect(component.size).toBe('lg');
    });

    it('should have default size as md', () => {
      expect(component.size).toBe('md');
    });
  });

  describe('toggleDropdown', () => {
    it('should toggle dropdown when not disabled', () => {
      component.disabled = false;
      component.isOpen = false;
      
      component.toggleDropdown();
      
      expect(component.isOpen).toBe(true);
    });

    it('should not toggle dropdown when disabled', () => {
      component.disabled = true;
      component.isOpen = false;
      
      component.toggleDropdown();
      
      expect(component.isOpen).toBe(false);
    });

    it('should close dropdown when already open', () => {
      component.disabled = false;
      component.isOpen = true;
      
      component.toggleDropdown();
      
      expect(component.isOpen).toBe(false);
    });

    it('should call onTouched when opening dropdown', () => {
      spyOn(component, 'onTouched' as any);
      component.disabled = false;
      component.isOpen = false;
      
      component.toggleDropdown();
      
      expect((component as any).onTouched).toHaveBeenCalled();
    });

    it('should not call onTouched when closing dropdown', () => {
      spyOn(component, 'onTouched' as any);
      component.disabled = false;
      component.isOpen = true;
      
      component.toggleDropdown();
      
      expect((component as any).onTouched).not.toHaveBeenCalled();
    });

    it('should not call onTouched when disabled', () => {
      spyOn(component, 'onTouched' as any);
      component.disabled = true;
      component.isOpen = false;
      
      component.toggleDropdown();
      
      expect((component as any).onTouched).not.toHaveBeenCalled();
    });
  });

  describe('selectOption', () => {
    const testOption = { value: 'test', label: 'Test Label' };

    it('should set selected value and label', () => {
      component.selectOption(testOption);
      
      expect(component.selectedValue).toBe(testOption.value);
      expect(component.selectedLabel).toBe(testOption.label);
    });

    it('should close dropdown', () => {
      component.isOpen = true;
      
      component.selectOption(testOption);
      
      expect(component.isOpen).toBe(false);
    });

    it('should call onChange callback', () => {
      spyOn(component, 'onChange' as any);
      
      component.selectOption(testOption);
      
      expect((component as any).onChange).toHaveBeenCalledWith(testOption.value);
    });

    it('should call onTouched callback', () => {
      spyOn(component, 'onTouched' as any);
      
      component.selectOption(testOption);
      
      expect((component as any).onTouched).toHaveBeenCalled();
    });

    it('should emit selectionChange event', () => {
      spyOn(component.selectionChange, 'emit');
      
      component.selectOption(testOption);
      
      expect(component.selectionChange.emit).toHaveBeenCalledWith(testOption.value);
    });
  });

  describe('ControlValueAccessor implementation', () => {
    describe('writeValue', () => {
      beforeEach(() => {
        component.options = mockOptions;
      });

      it('should set selected value and find corresponding label', () => {
        component.writeValue('option2');
        
        expect(component.selectedValue).toBe('option2');
        expect(component.selectedLabel).toBe('Option 2');
      });

      it('should set empty label when value not found in options', () => {
        component.writeValue('nonexistent');
        
        expect(component.selectedValue).toBe('nonexistent');
        expect(component.selectedLabel).toBe('');
      });

      it('should handle null value', () => {
        component.writeValue(null as any);
        
        expect(component.selectedValue).toBe(null as any);
        expect(component.selectedLabel).toBe('');
      });

      it('should handle undefined value', () => {
        component.writeValue(undefined as any);
        
        expect(component.selectedValue).toBe(undefined as any);
        expect(component.selectedLabel).toBe('');
      });

      it('should handle empty options array', () => {
        component.options = [];
        
        component.writeValue('option1');
        
        expect(component.selectedValue).toBe('option1');
        expect(component.selectedLabel).toBe('');
      });
    });

    describe('registerOnChange', () => {
      it('should register onChange callback', () => {
        const mockCallback = jasmine.createSpy('onChange');
        
        component.registerOnChange(mockCallback);
        
        expect((component as any).onChange).toBe(mockCallback);
      });
    });

    describe('registerOnTouched', () => {
      it('should register onTouched callback', () => {
        const mockCallback = jasmine.createSpy('onTouched');
        
        component.registerOnTouched(mockCallback);
        
        expect((component as any).onTouched).toBe(mockCallback);
      });
    });

    describe('setDisabledState', () => {
      it('should enable component when false', () => {
        component.setDisabledState(false);
        
        expect(component.disabled).toBe(false);
      });

      it('should disable component when true', () => {
        component.setDisabledState(true);
        
        expect(component.disabled).toBe(true);
      });
    });
  });

  describe('sizeClasses getter', () => {
    it('should return correct classes for small size', () => {
      component.size = 'sm';
      
      expect(component.sizeClasses).toBe('px-2 py-1 text-xs');
    });

    it('should return correct classes for medium size', () => {
      component.size = 'md';
      
      expect(component.sizeClasses).toBe('px-3 py-2 text-sm');
    });

    it('should return correct classes for large size', () => {
      component.size = 'lg';
      
      expect(component.sizeClasses).toBe('px-4 py-3 text-base');
    });
  });

  describe('isOptionDisabled', () => {
    it('should return true when component is disabled', () => {
      component.disabled = true;
      const option = { value: 'test', label: 'Test' };
      
      expect(component.isOptionDisabled(option)).toBe(true);
    });

    it('should return false when component is enabled', () => {
      component.disabled = false;
      const option = { value: 'test', label: 'Test' };
      
      expect(component.isOptionDisabled(option)).toBe(false);
    });
  });

  describe('mouse event handlers', () => {
    const testOption = { value: 'test', label: 'Test' };

    it('should handle onMouseEnter', () => {
      expect(() => component.onMouseEnter(testOption)).not.toThrow();
    });

    it('should handle onMouseLeave', () => {
      expect(() => component.onMouseLeave(testOption)).not.toThrow();
    });
  });

  describe('integration tests', () => {
    it('should work with form controls', () => {
      const onChange = jasmine.createSpy('onChange');
      const onTouched = jasmine.createSpy('onTouched');
      
      component.registerOnChange(onChange);
      component.registerOnTouched(onTouched);
      component.options = mockOptions;
      
      component.selectOption(mockOptions[1]);
      
      expect(onChange).toHaveBeenCalledWith('option2');
      expect(onTouched).toHaveBeenCalled();
    });

    it('should maintain state through disabled changes', () => {
      component.options = mockOptions;
      component.selectOption(mockOptions[0]);
      
      component.setDisabledState(true);
      expect(component.selectedValue).toBe('option1');
      expect(component.selectedLabel).toBe('Option 1');
      
      component.setDisabledState(false);
      expect(component.selectedValue).toBe('option1');
      expect(component.selectedLabel).toBe('Option 1');
    });

    it('should handle rapid option changes', () => {
      component.options = mockOptions;
      const selectionChangeSpy = spyOn(component.selectionChange, 'emit');
      
      component.selectOption(mockOptions[0]);
      component.selectOption(mockOptions[1]);
      component.selectOption(mockOptions[2]);
      
      expect(component.selectedValue).toBe('option3');
      expect(component.selectedLabel).toBe('Option 3');
      expect(selectionChangeSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('edge cases', () => {
    it('should handle options with same value but different labels', () => {
      const duplicateOptions = [
        { value: 'same', label: 'Label 1' },
        { value: 'same', label: 'Label 2' }
      ];
      component.options = duplicateOptions;
      
      component.writeValue('same');
      
      // Should find the first matching option
      expect(component.selectedLabel).toBe('Label 1');
    });

    it('should handle empty string values', () => {
      const emptyOptions = [
        { value: '', label: 'Empty Value' },
        { value: 'normal', label: 'Normal Value' }
      ];
      component.options = emptyOptions;
      
      component.writeValue('');
      
      expect(component.selectedValue).toBe('');
      expect(component.selectedLabel).toBe('Empty Value');
    });

    it('should handle whitespace-only values', () => {
      const whitespaceOptions = [
        { value: '   ', label: 'Whitespace Value' },
        { value: 'normal', label: 'Normal Value' }
      ];
      component.options = whitespaceOptions;
      
      component.writeValue('   ');
      
      expect(component.selectedValue).toBe('   ');
      expect(component.selectedLabel).toBe('Whitespace Value');
    });
  });
});
