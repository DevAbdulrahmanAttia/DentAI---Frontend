import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from '@core/i18n/i18n.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('DentAI-Frontend');

  // Injected (unused directly) so the service's constructor runs at bootstrap
  // and stamps lang/dir onto <html> before the first paint, rather than on
  // whatever component happens to inject it first.
  private readonly i18n = inject(I18nService);
}
