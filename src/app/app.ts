import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { Component, OnInit, signal, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit, AfterViewInit {
  protected readonly title = signal('cross-pay');
  
  constructor(private swUpdate: SwUpdate) {}
  
  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(
          filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
          take(1)
        )
        .subscribe((evt) => {
          if (confirm('New version available. Load new version?')) {
            document.location.reload();
          }
        });
    }
  }

  ngAfterViewInit() {
    // Remove loading state after Angular has rendered
    const loadingEl = document.querySelector('.loading');
    if (loadingEl) {
      loadingEl.remove();
    }
  }
}
