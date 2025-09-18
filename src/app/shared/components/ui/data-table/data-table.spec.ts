import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DataTableComponent, DataTableColumn } from './data-table';

describe('DataTableComponent', () => {
  let component: DataTableComponent;
  let fixture: ComponentFixture<DataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.columns).toEqual([]);
    expect(component.data).toEqual([]);
    expect(component.loading).toBe(false);
    expect(component.error).toBe(null);
  });

  it('should return safe data when data is provided', () => {
    const testData = [{ id: 1, name: 'test' }];
    component.data = testData;
    
    expect(component.safeData).toBe(testData);
  });

  it('should return empty array when data is null or undefined', () => {
    component.data = null as any;
    expect(component.safeData).toEqual([]);
    
    component.data = undefined as any;
    expect(component.safeData).toEqual([]);
  });

  it('should get value from nested object keys', () => {
    const item = { user: { profile: { name: 'John' } } };
    
    expect(component.getValue(item, 'user.profile.name')).toBe('John');
    expect(component.getValue(item, 'user.profile')).toEqual({ name: 'John' });
    expect(component.getValue(item, 'nonexistent')).toBeUndefined();
  });

  it('should handle null/undefined values in getValue', () => {
    expect(component.getValue(null, 'test')).toBe(null);
    expect(component.getValue(undefined, 'test')).toBe(undefined);
    expect(component.getValue({}, 'nonexistent')).toBe(undefined);
    expect(component.getValue({ test: null }, 'test')).toBe(null);
  });

  it('should format null/undefined values as dash', () => {
    const column: DataTableColumn = { key: 'test', header: 'Test' };
    
    expect(component.formatValue(null, column)).toBe('-');
    expect(component.formatValue(undefined, column)).toBe('-');
  });

  it('should format amount values correctly with direction', () => {
    const column: DataTableColumn = { key: 'amount', header: 'Amount' };
    const creditItem = { amount: 123.45, direction: 'credit' };
    const debitItem = { amount: 123.45, direction: 'debit' };
    
    expect(component.formatValue(123.45, column, creditItem)).toBe('+$123.45');
    expect(component.formatValue(123.45, column, debitItem)).toBe('-$123.45');
  });

  it('should handle negative amounts correctly', () => {
    const column: DataTableColumn = { key: 'amount', header: 'Amount' };
    const item = { amount: -50.75, direction: 'debit' };
    
    expect(component.formatValue(-50.75, column, item)).toBe('-$50.75');
  });

  it('should capitalize transaction type', () => {
    const typeColumn: DataTableColumn = { key: 'transactionType', header: 'Type' };
    
    expect(component.formatValue('deposit', typeColumn)).toBe('Deposit');
    expect(component.formatValue('withdrawal', typeColumn)).toBe('Withdrawal');
    expect(component.formatValue('transfer', typeColumn)).toBe('Transfer');
  });

  it('should return string representation for other values', () => {
    const column: DataTableColumn = { key: 'test', header: 'Test' };
    
    expect(component.formatValue(123, column)).toBe('123');
    expect(component.formatValue(true, column)).toBe('true');
    expect(component.formatValue('hello', column)).toBe('hello');
  });

  it('should display loading state', () => {
    component.loading = true;
    component.columns = [
      { key: 'test', header: 'Test' }
    ];
    fixture.detectChanges();
    
    const loadingRows = fixture.debugElement.queryAll(By.css('.animate-pulse'));
    expect(loadingRows.length).toBe(5); // Should show 5 skeleton rows
    
    const loadingDiv = fixture.debugElement.query(By.css('.bg-gray-200.rounded'));
    expect(loadingDiv).toBeTruthy(); // Should show skeleton loading div
  });

  it('should display no data message when data array is empty', () => {
    component.columns = [{ key: 'test', header: 'Test' }];
    component.data = [];
    component.loading = false;
    component.error = null;
    
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('No data available');
  });

  it('should display error message when error is present', () => {
    component.columns = [{ key: 'test', header: 'Test' }];
    component.data = [];
    component.loading = false;
    component.error = 'Test error';
    
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Error: Test error');
  });

  it('should render table headers correctly', () => {
    component.columns = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' }
    ];
    component.data = [{ id: 1, name: 'test' }];
    
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const headers = compiled.querySelectorAll('th');
    expect(headers[0].textContent.trim()).toBe('ID');
    expect(headers[1].textContent.trim()).toBe('Name');
  });

  it('should render table data correctly', () => {
    component.columns = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' }
    ];
    component.data = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ];
    
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    const rows = compiled.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    
    const firstRowCells = rows[0].querySelectorAll('td');
    expect(firstRowCells[0].textContent.trim()).toBe('1');
    expect(firstRowCells[1].textContent.trim()).toBe('John');
  });
});