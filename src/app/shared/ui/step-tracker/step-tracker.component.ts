import { Component, input } from '@angular/core';

@Component({
  selector: 'app-step-tracker',
  standalone: true,
  template: `
    <div class="step-track" role="img" [attr.aria-label]="'Step ' + activeStep() + ' of ' + totalSteps()">
      @for (step of stepsArray; track $index; let index = $index) {
        <div class="step-dot" [class.on]="index < activeStep()"></div>
      }
    </div>
  `,
  styles: [`
    .step-track {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 26px;
    }
    .step-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-border, #e1e7ea);
      transition: all 0.25s ease-out;
    }
    .step-dot.on {
      background: var(--color-teal, #0e7c86);
      width: 22px;
      border-radius: 5px;
    }
  `]
})
export class StepTrackerComponent {
  totalSteps = input<number>(3);
  activeStep = input<number>(1); // 1-indexed (e.g. 1 means 1 dot is green, 2 means 2 dots are green, etc.)

  get stepsArray(): number[] {
    return Array(this.totalSteps()).fill(0);
  }
}
