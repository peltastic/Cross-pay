import { Component } from '@angular/core';
import { DarkModeService } from '../../../core/services/dark-mode.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dark-mode-toggle',
  imports: [AsyncPipe],
  templateUrl: './dark-mode-toggle.html',
})
export class DarkModeToggleComponent {
  isDarkMode$;

  constructor(private darkModeService: DarkModeService) {
    this.isDarkMode$ = this.darkModeService.isDarkMode$;
  }

  toggleDarkMode(): void {
    this.darkModeService.toggleDarkMode();
  }
}
