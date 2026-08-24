import { Component, forwardRef, inject, signal, ElementRef, viewChildren } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { I18nService } from '@core/i18n/i18n.service';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OtpInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="otp-row" role="group" [attr.aria-label]="i18n.t('auth.otpAriaLabel')">
      @for (digit of digits(); track $index; let index = $index) {
        <input
          #otpInput
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="1"
          [value]="digit"
          [disabled]="disabled()"
          (input)="onInput($event, index)"
          (keydown)="onKeyDown($event, index)"
          (focus)="onFocus(index)"
          class="otp-box"
          [class.active-box]="index === activeIndex() || (index === 0 && !value())"
        />
      }
    </div>
  `,
  styles: [`
    .otp-row {
      display: flex;
      gap: 9px;
      margin-bottom: 22px;
      width: 100%;
    }
    .otp-box {
      flex: 1;
      min-width: 0;
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 19px;
      padding: 12px 0;
      border-radius: 9px;
      border: 1.5px solid var(--color-border, #e1e7ea);
      background: #fff;
      transition: all 0.15s;
      box-sizing: border-box;
    }
    .otp-box:focus {
      outline: none;
      border-color: var(--color-teal, #0e7c86);
    }
    .otp-box:disabled {
      background: var(--color-background, #f5f8f9);
      color: var(--color-faint, #8a96a1);
      cursor: not-allowed;
    }
    .active-box {
      border-color: var(--color-teal, #0e7c86);
    }
  `]
})
export class OtpInputComponent implements ControlValueAccessor {
  protected readonly i18n = inject(I18nService);

  inputElements = viewChildren<ElementRef<HTMLInputElement>>('otpInput');
  
  digits = signal<string[]>(Array(6).fill(''));
  activeIndex = signal<number>(0);
  disabled = signal<boolean>(false);
  value = signal<string>('');

  onChange: (value: string) => void = (_value: string) => { /* noop */ };
  onTouched: () => void = () => { /* noop */ };

  writeValue(val: string): void {
    const rawVal = val || '';
    this.value.set(rawVal);
    const parsed = Array(6).fill('');
    for (let i = 0; i < Math.min(rawVal.length, 6); i++) {
      parsed[i] = rawVal[i];
    }
    this.digits.set(parsed);
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

  onInput(event: Event, index: number): void {
    const target = event.target as HTMLInputElement;
    let val = target.value.trim();
    
    // Filter non-digits
    val = val.replace(/\D/g, '');
    
    const currentDigits = [...this.digits()];
    currentDigits[index] = val.substring(0, 1);
    this.digits.set(currentDigits);
    
    const combinedVal = currentDigits.join('');
    this.value.set(combinedVal);
    this.onChange(combinedVal);

    if (val && index < 5) {
      const inputs = this.inputElements();
      inputs[index + 1]?.nativeElement.focus();
      this.activeIndex.set(index + 1);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const target = event.target as HTMLInputElement;
    
    if (event.key === 'Backspace') {
      const currentDigits = [...this.digits()];
      
      if (!target.value && index > 0) {
        currentDigits[index - 1] = '';
        this.digits.set(currentDigits);
        const combinedVal = currentDigits.join('');
        this.value.set(combinedVal);
        this.onChange(combinedVal);
        
        const inputs = this.inputElements();
        inputs[index - 1]?.nativeElement.focus();
        this.activeIndex.set(index - 1);
      } else {
        currentDigits[index] = '';
        this.digits.set(currentDigits);
        const combinedVal = currentDigits.join('');
        this.value.set(combinedVal);
        this.onChange(combinedVal);
      }
      event.preventDefault();
    }
  }

  onFocus(index: number): void {
    this.activeIndex.set(index);
  }
}
