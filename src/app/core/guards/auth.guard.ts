import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const emailData = sessionStorage.getItem('email');
  
  if (!emailData) {
    router.navigate(['/get-started']);
    return false;
  }
  
  try {
    const email = JSON.parse(emailData);
    if (!email || email === '' || email === null) {
      router.navigate(['/get-started']);
      return false;
    }
  } catch (error) {
    // Invalid JSON in session storage
    router.navigate(['/get-started']);
    return false;
  }
  
  return true;
};