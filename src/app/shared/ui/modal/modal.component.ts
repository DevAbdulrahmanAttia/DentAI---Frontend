import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  input,
  output
} from '@angular/core';

export type ModalVariant = 'center' | 'sheet';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <!-- Backdrop click-to-dismiss is pointer-only sugar; Escape (handled via
         the host listener below) is the real keyboard equivalent, so this
         intentionally isn't a focusable control. -->
    <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div
        class="modal-panel"
        [class.modal-panel-sheet]="variant() === 'sheet'"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title() || null"
        tabindex="-1"
        #panel
      >
        @if (title()) {
          <div class="modal-header">
            <h2>{{ title() }}</h2>
            <button type="button" class="modal-close" (click)="closed.emit()" aria-label="Close">
              &times;
            </button>
          </div>
        }
        <div class="modal-body">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 34, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fade-in 0.15s ease;
    }

    .modal-panel {
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(15, 23, 34, 0.25);
      max-width: 560px;
      width: calc(100% - 32px);
      max-height: calc(100vh - 64px);
      overflow-y: auto;
      outline: none;
      animation: pop-in 0.15s ease;
    }

    .modal-panel-sheet {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      max-height: 100vh;
      width: 420px;
      max-width: calc(100% - 32px);
      border-radius: 0;
      animation: slide-in 0.18s ease;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 22px;
      border-bottom: 1px solid var(--color-border, #e3e8ec);
      position: sticky;
      top: 0;
      background: #fff;
    }

    .modal-header h2 {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-text, #1e2b33);
      margin: 0;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 22px;
      line-height: 1;
      color: var(--color-faint, #8a96a1);
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 6px;
    }

    .modal-close:hover {
      background: var(--color-background-muted, #f4f6f8);
      color: var(--color-text, #1e2b33);
    }

    .modal-body {
      padding: 20px 22px;
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes pop-in {
      from { opacity: 0; transform: scale(0.97); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes slide-in {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `]
})
export class ModalComponent implements OnInit, OnDestroy {
  variant = input<ModalVariant>('center');
  title = input<string>('');
  closeOnBackdrop = input<boolean>(true);

  closed = output<void>();

  @ViewChild('panel') private readonly panelRef?: ElementRef<HTMLElement>;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    queueMicrotask(() => this.panelRef?.nativeElement.focus());
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop() && event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
