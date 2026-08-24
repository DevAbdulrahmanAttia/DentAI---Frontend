/**
 * i18n primitives.
 *
 * `Lang` is the set of UI languages the app ships. Each one carries a writing
 * direction and an Intl locale tag used for dates/numbers/currency.
 */
export type Lang = 'en' | 'ar';

export type Direction = 'ltr' | 'rtl';

export interface LangMeta {
  /** Language name written in that language — how it appears in the switcher. */
  readonly nativeName: string;
  readonly dir: Direction;
  /** BCP 47 tag handed to `Intl` / Angular's date & number pipes. */
  readonly intlLocale: string;
}

export const LANGS: Readonly<Record<Lang, LangMeta>> = {
  en: { nativeName: 'English', dir: 'ltr', intlLocale: 'en-US' },
  ar: { nativeName: 'العربية', dir: 'rtl', intlLocale: 'ar-EG' }
} as const;

export const DEFAULT_LANG: Lang = 'en';

/** Flat dot-notation key → string. Nested objects are flattened at build time. */
export type TranslationMap = Record<string, string>;

/** Values interpolated into a translation via `{name}` placeholders. */
export type TranslateParams = Record<string, string | number>;
