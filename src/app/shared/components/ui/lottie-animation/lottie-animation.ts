import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import lottie, { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-lottie-animation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #lottieContainer class="lottie-container" [style.width]="width" [style.height]="height"></div>
  `,
  styles: [`
    .lottie-container {
      width: 100%;
      height: 100%;
    }
  `]
})
export class LottieAnimationComponent implements OnInit, AfterViewInit {
  @Input() path!: string;
  @Input() width: string = '200px';
  @Input() height: string = '200px';
  @Input() autoplay: boolean = true;
  @Input() loop: boolean = true;
  
  @ViewChild('lottieContainer', { static: true }) lottieContainer!: ElementRef;
  
  private animation!: AnimationItem;

  ngOnInit() {}

  ngAfterViewInit() {
    this.loadAnimation();
  }

  private loadAnimation() {
    this.animation = lottie.loadAnimation({
      container: this.lottieContainer.nativeElement,
      renderer: 'svg',
      loop: this.loop,
      autoplay: this.autoplay,
      path: this.path
    });
  }
}