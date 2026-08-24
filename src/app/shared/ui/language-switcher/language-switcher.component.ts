import { Component, inject } from '@angular/core';
import { I18nService } from '@core/i18n/i18n.service';
import { LANGS, Lang } from '@core/i18n/i18n.types';

/**
 * Two-state language toggle. Rendered as a segmented control so the target
 * language is always visible (an icon-only toggle hides which way it flips).
 * Each label is written in its own language, which is the convention users
 * scan for — an Arabic speaker looks for "العربية", not "Arabic".
 */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  template: `
    <div class="lang-switch" role="group" [attr.aria-label]="i18n.t('lang.label')">
      @for (option of options; track option.code) {
        <button
          type="button"
          class="lang-opt"
          [class.lang-opt-active]="i18n.lang() === option.code"
          [attr.aria-pressed]="i18n.lang() === option.code"
          [attr.lang]="option.code"
          [title]="i18n.t('lang.switchTo', { lang: option.label })"
          (click)="select(option.code)"
        >
          {{ option.short }}
        </button>
      }
    </div>
  `,
  styles: [`
    .lang-switch {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 2px;
      border: 1px solid var(--color-border, #e1e7ea);
      border-radius: 8px;
      background: #fff;
    }

    .lang-opt {
      border: none;
      background: none;
      cursor: pointer;
      padding: 4px 9px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
      line-height: 1.4;
      color: var(--color-mute, #5c6b78);
      transition: background 0.15s, color 0.15s;
    }

    .lang-opt:hover:not(.lang-opt-active) {
      background: var(--color-background, #f5f8f9);
      color: var(--color-text, #16202b);
    }

    .lang-opt-active {
      background: var(--color-navy, #0f2a47);
      color: #fff;
    }

    .lang-opt:focus-visible {
      outline: 2px solid var(--color-teal, #0e7c86);
      outline-offset: 1px;
    }
  `]
})
export class LanguageSwitcherComponent {
  protected readonly i18n = inject(I18nService);

  protected readonly options: { code: Lang; label: string; short: string }[] = [
    { code: 'en', label: LANGS.en.nativeName, short: 'EN' },
    { code: 'ar', label: LANGS.ar.nativeName, short: 'ع' }
  ];

  protected select(lang: Lang): void {
    this.i18n.setLang(lang);
  }
}
