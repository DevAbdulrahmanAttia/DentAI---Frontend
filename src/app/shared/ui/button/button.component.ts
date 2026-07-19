import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="'btn btn-' + variant()"
      [attr.aria-busy]="loading() ? 'true' : null"
      (click)="onClick($event)"
    >
      @if (loading()) {
        <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25" stroke="currentColor"></circle>
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" class="opacity-75" fill="currentColor"></path>
        </svg>
      }
      <span class="btn-content" [class.loading-content]="loading()">
        <ng-content />
      </span>
    </button>
  `,
  styles: [`
    .btn {
      width: 100%;
      padding: 13.5px;
      border-radius: 9px;
      border: none;
      font-size: 15px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.15s ease;
      position: relative;
    }
    
    .btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background: var(--color-navy, #0f2a47);
      color: #fff;
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--color-teal, #0e7c86);
    }
    
    .btn-save {
      padding: 10px 20px;
      border-radius: 8px;
      background: var(--color-navy, #0f2a47);
      color: #fff;
      font-size: 13.5px;
    }
    .btn-save:hover:not(:disabled) {
      background: var(--color-teal, #0e7c86);
    }

    .btn-ghost {
      padding: 9px 16px;
      border-radius: 8px;
      border: 1.5px solid var(--color-border, #e1e7ea);
      background: #fff;
      color: var(--color-text, #16202b);
      font-size: 13px;
    }
    .btn-ghost:hover:not(:disabled) {
      background: var(--color-background, #f5f8f9);
      border-color: var(--color-faint, #8a96a1);
    }
    
    .spinner {
      width: 18px;
      height: 18px;
      animation: spin 1s linear infinite;
    }
    
    .btn-content {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .loading-content {
      opacity: 0.8;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .opacity-25 { opacity: 0.25; }
    .opacity-75 { opacity: 0.75; }
  `]
})
export class ButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'ghost' | 'save'>('primary');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  
  clicked = output<MouseEvent>();
  
  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}
