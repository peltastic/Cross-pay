import { Component } from '@angular/core';
import { OnboardingLayout } from '../../layout/onboarding-layout/onboarding-layout';
import { OnboardingForm } from '../../shared/components/forms/onboarding-form/onboarding-form';
import { LazyLottieAnimationComponent } from '../../shared/components/ui/lazy-lottie-animation/lazy-lottie-animation';
import { DarkModeToggleComponent } from '../../shared/components/dark-mode-toggle/dark-mode-toggle';

@Component({
  selector: 'app-onboarding',
  imports: [OnboardingLayout, OnboardingForm, LazyLottieAnimationComponent, DarkModeToggleComponent],
  templateUrl: './onboarding.html',
})
export class Onboarding {
  chartOptions = {
    path: '/chart.json'
  };

  moneyBagOptions = {
    path: '/money-bag.json'
  };

  moneyTransferOptions = {
    path: '/money-tranfer.json'
  };

  networkIconOptions = {
    path: '/network-icon.json'
  };
}
