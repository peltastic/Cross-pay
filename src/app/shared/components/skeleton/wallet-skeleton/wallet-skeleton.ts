import { Component } from '@angular/core';

@Component({
  selector: 'app-wallet-skeleton',
  standalone: true,
  template: `
    <div class="max-w-md">
      <div class="relative bg-white rounded-3xl p-6 sm:p-8 overflow-hidden animate-pulse">
        <div
          class="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-gray-50/25 pointer-events-none"
        ></div>

        <div
          class="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 mb-6 sm:mb-8"
        >
          <div class="h-6 bg-gray-200 rounded w-48"></div>
          <div class="h-8 bg-gray-200 rounded w-20 self-end sm:self-auto"></div>
        </div>

        <div class="relative z-10 text-center mb-6 sm:mb-8">
          <div class="h-12 bg-gray-200 rounded mb-2 w-48"></div>
        </div>

        <div class="relative z-10 mt-6 sm:mt-8">
          <div class="h-10 bg-gray-200 rounded-xl w-full"></div>
        </div>
      </div>
    </div>
  `,
})
export class WalletSkeletonComponent {}
