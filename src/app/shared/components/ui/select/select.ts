import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroChevronDownSolid } from '@ng-icons/heroicons/solid';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, NgIconComponent, ClickOutsideDirective],
  providers: [
    provideIcons({ heroChevronDownSolid }),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  templateUrl: './select.html',
})
export class SelectComponent implements ControlValueAccessor {
  @Input() set options(value: { value: string; label: string }[]) {
    this._options = value || [];
  }
  get options(): { value: string; label: string }[] {
    return this._options;
  }
  private _options: { value: string; label: string }[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() disabled: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() selectionChange = new EventEmitter<string>();

  isOpen = false;
  selectedValue: string = '';
  selectedLabel: string = '';

  private onChange = (value: string) => {};
  private onTouched = () => {};

  toggleDropdown() {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.onTouched();
      }
    }
  }

  selectOption(option: { value: string; label: string }) {
    this.selectedValue = option.value;
    this.selectedLabel = option.label;
    this.isOpen = false;
    this.onChange(option.value);
    this.onTouched();
    this.selectionChange.emit(option.value);
  }

  writeValue(value: string): void {
    this.selectedValue = value;
    const option = this.options.find((opt) => opt.value === value);
    this.selectedLabel = option ? option.label : '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get sizeClasses() {
    return {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    }[this.size];
  }

  isOptionDisabled(option: { value: string; label: string }): boolean {
    return this.disabled;
  }

  onMouseEnter(option: { value: string; label: string }) {
  }

  onMouseLeave(option: { value: string; label: string }) {
  }
}
