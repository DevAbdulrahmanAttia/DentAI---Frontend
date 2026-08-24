/**
 * I18n Service
 *
 * Single source of truth for the active UI language, the writing direction it
 * implies, and string lookup. The active language is a signal, so anything that
 * reads it (the `t` pipe, `dir`-bound templates, computed labels) re-renders on
 * switch without a page reload.
 */

import { Injectable, computed, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { StorageService } from '@core/services/storage.service';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { DEFAULT_LANG, LANGS, Lang, TranslateParams } from './i18n.types';
import { EN } from './translations/en';
import { AR } from './translations/ar';

const DICTIONARIES: Record<Lang, Record<string, string>> = { en: EN, ar: AR };

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly storage = inject(StorageService);
  private readonly document = inject(DOCUMENT);

  private readonly _lang = signal<Lang>(this.readInitialLang());

  /** The active UI language. */
  readonly lang = this._lang.asReadonly();

  /** `rtl` for Arabic, `ltr` otherwise — bind this to `[dir]` or `[attr.dir]`. */
  readonly dir = computed(() => LANGS[this._lang()].dir);

  readonly isRtl = computed(() => this.dir() === 'rtl');

  /** BCP 47 tag for `Intl.*`, `toLocaleDateString`, and Angular's date pipe. */
  readonly intlLocale = computed(() => LANGS[this._lang()].intlLocale);

  constructor() {
    this.applyToDocument(this._lang());
  }

  setLang(lang: Lang): void {
    if (lang === this._lang()) return;
    this._lang.set(lang);
    this.storage.setItem(STORAGE_KEYS.LANG, lang);
    this.applyToDocument(lang);
  }

  toggle(): void {
    this.setLang(this._lang() === 'ar' ? 'en' : 'ar');
  }

  /**
   * Looks up `key` in the active dictionary, falling back to English and then
   * to the key itself, so a missing translation degrades to readable text
   * rather than a blank. `{placeholder}` tokens are replaced from `params`.
   */
  translate(key: string, params?: TranslateParams): string {
    const active = this._lang();
    const raw = DICTIONARIES[active][key] ?? EN[key] ?? key;
    return params ? interpolate(raw, params) : raw;
  }

  /** Terse alias — what the `t` pipe and component code call. */
  t(key: string, params?: TranslateParams): string {
    return this.translate(key, params);
  }

  private readInitialLang(): Lang {
    const stored = this.storage.getItem<string>(STORAGE_KEYS.LANG);
    if (stored && stored in LANGS) return stored as Lang;

    // Fall back to the browser's preference so an Arabic-locale machine opens
    // in Arabic on first visit.
    const browser = this.document.defaultView?.navigator?.language ?? '';
    return browser.toLowerCase().startsWith('ar') ? 'ar' : DEFAULT_LANG;
  }

  /**
   * Mirrors language onto `<html lang dir>`. Everything direction-aware in the
   * stylesheets keys off that `dir`, so this one write flips the whole layout.
   */
  private applyToDocument(lang: Lang): void {
    const root = this.document.documentElement;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', LANGS[lang].dir);
  }
}

function interpolate(template: string, params: TranslateParams): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match
  );
}
