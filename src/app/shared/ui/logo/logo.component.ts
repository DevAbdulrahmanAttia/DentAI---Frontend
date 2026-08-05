import { Component, computed, input } from '@angular/core';

/**
 * `white` (light lockup) is for dark backgrounds — the sidebar and the login
 * page's dark art panel, both #0f2a3d-family navy. `color` (navy/teal
 * lockup) is for light/white backgrounds, once one exists.
 */
export type LogoVariant = 'color' | 'white';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <img [src]="src()" alt="DentAI" [class]="'brand brand-' + size()" />
  `,
  styles: [`
    .brand {
      display: block;
      width: auto;
    }
    .brand-lg {
      height: 56px;
    }
    .brand-sm {
      height: 38px;
    }
  `]
})
export class LogoComponent {
  size = input<'sm' | 'lg'>('lg');
  variant = input<LogoVariant>('white');
  /** Icon only (no "DentAI" wordmark) — for very tight spaces like a favicon-style badge. */
  iconOnly = input(false);

  protected readonly src = computed(() => {
    const base = this.iconOnly() ? 'logo' : 'logo-text';
    const suffix = this.variant() === 'white' ? '-white' : '';
    return `assets/logo/${base}${suffix}.png`;
  });
}
