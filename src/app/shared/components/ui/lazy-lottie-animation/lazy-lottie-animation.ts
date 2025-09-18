import { Component, Input, ViewChild, ViewContainerRef, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyLoadService } from '../../../../core/services/lazy-load.service';

@Component({
  selector: 'app-lazy-lottie-animation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #animationContainer 
         [style.width]="width" 
         [style.height]="height"
         class="flex items-center justify-center">
      @if (loading) {
        <div class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg w-full h-full"></div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LazyLottieAnimationComponent implements OnInit {
  @Input() path!: string;
  @Input() width: string = '100%';
  @Input() height: string = '100%';
  @Input() loop: boolean = true;
  @Input() autoplay: boolean = true;

  @ViewChild('animationContainer', { read: ViewContainerRef, static: true }) 
  animationContainer!: ViewContainerRef;

  loading = true;

  constructor(private lazyLoadService: LazyLoadService) {}

  async ngOnInit() {
    await this.loadLottieAnimation();
  }

  private async loadLottieAnimation() {
    try {
      const animationRef = await this.lazyLoadService.loadComponent(
        () => import('../lottie-animation/lottie-animation'),
        'LottieAnimationComponent',
        this.animationContainer
      );

      // Pass inputs to the loaded component
      animationRef.instance.path = this.path;
      animationRef.instance.width = this.width;
      animationRef.instance.height = this.height;
      animationRef.instance.loop = this.loop;
      animationRef.instance.autoplay = this.autoplay;

      this.loading = false;
    } catch (error) {
      console.error('Error loading Lottie animation:', error);
      this.loading = false;
    }
  }
}