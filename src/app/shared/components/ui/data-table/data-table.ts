import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SUPPORTED_CURRENCIES_FULL } from '../../../../core/constants/currencies';

export interface DataTableColumn {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.html',
})
export class DataTableComponent {
  @Input() columns: DataTableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
  @Input() error: string | null = null;

  get safeData(): any[] {
    return this.data || [];
  }

  getValue(item: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj && obj[k], item);
  }

  private getCurrencySymbol(currencyCode: string): string {
    const currency = SUPPORTED_CURRENCIES_FULL.find((c) => c.code === currencyCode);
    return currency ? currency.symbol : '$';
  }

  formatValue(value: any, column: DataTableColumn, item?: any): string {
    if (value === null || value === undefined) {
      return '-';
    }

    if (column.key === 'amount' && item) {
      const direction = this.getValue(item, 'direction');
      const currency = this.getValue(item, 'currency');
      const transactionType = this.getValue(item, 'transactionType');
      const currencySymbol = this.getCurrencySymbol(currency);

      if (transactionType === 'swap') {
        return `${currencySymbol}${Math.abs(value).toFixed(2)}`;
      }

      const sign = direction === 'credit' ? '+' : '-';
      return `${sign}${currencySymbol}${Math.abs(value).toFixed(2)}`;
    }

    if (column.key === 'transactionType') {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    return value.toString();
  }
}
