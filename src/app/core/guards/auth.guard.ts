import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const emailData = sessionStorage.getItem('email');
  
  if (!emailData) {
    router.navigate(['/get-started']);
    return false;
  }
  

  
  return true;
};