import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div [class]="'brand brand-' + size()">
      <svg viewBox="0 0 40 40" fill="none" class="brand-svg">
        <path d="M20 4c-4.5 0-7 2.6-9.2 2.6-2.6 0-4.3-1.6-4.3 3 0 7 2.4 15 5.6 19.8 1.6 2.4 3 3.6 4 3.6.9 0 1.3-1 1.9-3.4.5-2 1-3.4 2-3.4s1.5 1.4 2 3.4c.6 2.4 1 3.4 1.9 3.4 1 0 2.4-1.2 4-3.6C31.2 24.6 33.6 16.6 33.6 9.6c0-4.6-1.7-3-4.3-3C27.1 6.6 24.5 4 20 4z" fill="#0e7c86"/>
      </svg>
      <div class="wordmark">Dent<span class="wordmark-span">AI</span></div>
    </div>
  `,
  styles: [`
    .brand {
      display: flex;
      align-items: center;
    }
    .brand-lg {
      gap: 10px;
    }
    .brand-lg .brand-svg {
      width: 34px;
      height: 34px;
    }
    .brand-lg .wordmark {
      font-size: 23px;
      font-weight: 700;
      color: #fff;
      letter-spacing: -.01em;
      font-family: 'Space Grotesk', sans-serif;
    }
    
    .brand-sm {
      gap: 9px;
    }
    .brand-sm .brand-svg {
      width: 24px;
      height: 24px;
    }
    .brand-sm .wordmark {
      font-size: 17px;
      font-weight: 700;
      color: #fff;
      font-family: 'Space Grotesk', sans-serif;
    }
    
    .wordmark-span {
      color: var(--color-teal-dim, #b7dcdf);
    }
  `]
})
export class LogoComponent {
  size = input<'sm' | 'lg'>('lg');
}
