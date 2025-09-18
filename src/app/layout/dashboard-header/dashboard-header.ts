import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getUserEmail } from '../../store/user/user.selector';

@Component({
  selector: 'app-dashboard-header',
  imports: [CommonModule],
  templateUrl: './dashboard-header.html',
})
export class DashboardHeader {
  user$: Observable<any>;

  constructor(private store: Store) {
    this.user$ = this.store.select(getUserEmail);
  }
}
