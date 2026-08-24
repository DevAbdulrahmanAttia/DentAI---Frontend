/**
 * Translate Pipe — `{{ 'nav.dashboard' | t }}`
 *
 * Impure by design: reading `I18nService.lang()` inside `transform` registers
 * the view as a consumer of that signal, so switching language marks the view
 * dirty; being impure is what then lets the same key re-resolve to the new
 * string (a pure pipe would return its memoised value for an unchanged key).
 * The work per call is a single map lookup, which is cheap enough at this scale.
 */

import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from './i18n.service';
import { TranslateParams } from './i18n.types';

@Pipe({ name: 't', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string, params?: TranslateParams): string {
    // Establishes the reactive dependency on the active language.
    this.i18n.lang();
    return this.i18n.translate(key, params);
  }
}
