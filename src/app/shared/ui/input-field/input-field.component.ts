import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFieldComponent),
      multi: true
    }
  ],
  template: `
    <div class="field">
      @if (label()) {
        <label [attr.for]="id()">{{ label() }}</label>
      }
      <input
        [id]="id()"
        [type]="type()"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        [attr.dir]="forcedDir()"
        [attr.aria-invalid]="hasError() ? 'true' : 'false'"
        [attr.aria-describedby]="hasError() && errorMessage() ? id() + '-error' : null"
        (input)="onInput($event)"
        (blur)="onBlur()"
        class="input-control"
        [class.input-error]="hasError()"
      />
      @if (hasError() && errorMessage()) {
        <div [id]="id() + '-error'" class="error-msg" role="alert">{{ errorMessage() }}</div>
      }
    </div>
  `,
  styles: [`
    .field {
      margin-bottom: 18px;
      width: 100%;
    }
    .field label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text, #16202b);
      margin-bottom: 7px;
    }
    .input-control {
      width: 100%;
      padding: 12px 14px;
      border: 1.5px solid var(--color-border, #e1e7ea);
      border-radius: 9px;
      font-size: 14.5px;
      font-family: 'Inter', sans-serif;
      color: var(--color-text, #16202b);
      background: #fff;
      transition: border-color .15s;
      box-sizing: border-box;
    }
    .input-control:focus {
      outline: none;
      border-color: var(--color-teal, #0e7c86);
    }
    .input-control:disabled {
      background: var(--color-background, #f5f8f9);
      color: var(--color-faint, #8a96a1);
      cursor: not-allowed;
    }
    .input-error {
      border-color: var(--color-red, #c4433d) !important;
    }
    .error-msg {
      color: var(--color-red, #c4433d);
      font-size: 12px;
      margin-top: 5px;
      font-weight: 500;
    }
  `]
})
export class InputFieldComponent implements ControlValueAccessor {
  id = input<string>('input-' + Math.random().toString(36).substring(2, 9));
  label = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  errorMessage = input<string>('');
  hasError = input<boolean>(false);

  /**
   * Phone/email/password/url values are always Latin-script and read
   * left-to-right (a phone number typed in an RTL form must not have its
   * digit order visually reversed by the surrounding `dir="rtl"`), so those
   * types force `dir="ltr"` on the control regardless of UI language.
   */
  protected readonly forcedDir = computed(() =>
    ['tel', 'email', 'password', 'url'].includes(this.type()) ? 'ltr' : null
  );

  value = signal<string>('');
  disabled = signal<boolean>(false);

  onChange: (value: string) => void = (_value: string) => { /* noop */ };
  onTouched: () => void = () => { /* noop */ };

  writeValue(val: string): void {
    this.value.set(val || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const inputVal = (event.target as HTMLInputElement).value;
    this.value.set(inputVal);
    this.onChange(inputVal);
  }

  onBlur(): void {
    this.onTouched();
  }
}
