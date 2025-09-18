import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    this.initializeDarkMode();
  }

  private initializeDarkMode(): void {
    const isDark = localStorage["theme"] === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    this.isDarkMode.next(isDark);
  }

  private applyTheme(): void {
    const isDark = localStorage["theme"] === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    document.documentElement.classList.toggle("dark", isDark);
    this.isDarkMode.next(isDark);
  }

  toggleDarkMode(): void {
    const currentMode = this.isDarkMode.value;
    if (currentMode) {
      this.setLightMode();
    } else {
      this.setDarkMode();
    }
  }

  setDarkMode(): void {
    localStorage["theme"] = "dark";
    this.applyTheme();
  }

  setLightMode(): void {
    localStorage["theme"] = "light";
    this.applyTheme();
  }

  respectOSPreference(): void {
    localStorage.removeItem("theme");
    this.applyTheme();
  }

  getCurrentMode(): boolean {
    return this.isDarkMode.value;
  }
}