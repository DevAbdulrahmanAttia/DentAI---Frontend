import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WaitlistOfferPreview } from '@core/models/waitlist.model';
import { WaitlistService } from '@features/waitlist/services/waitlist.service';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

type ViewState = 'loading' | 'preview' | 'confirming' | 'confirmed' | 'invalid';

@Component({
  selector: 'app-waitlist-confirm',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.css'
})
export class ConfirmComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);
  private readonly waitlistService = inject(WaitlistService);

  protected readonly state = signal<ViewState>('loading');
  protected readonly preview = signal<WaitlistOfferPreview | null>(null);
  protected readonly errorMessage = signal('');

  private id = '';
  private token = '';

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.id || !this.token) {
      this.state.set('invalid');
      this.errorMessage.set(this.i18n.t('waitlist.linkMissingInfo'));
      return;
    }

    this.waitlistService.getOfferPreview(this.id, this.token).subscribe({
      next: (preview) => {
        this.preview.set(preview);
        this.state.set('preview');
      },
      error: (err) => {
        this.state.set('invalid');
        this.errorMessage.set(
          err?.error?.message || this.i18n.t('waitlist.offerNoLongerValid')
        );
      }
    });
  }

  confirm(): void {
    if (this.state() !== 'preview') return;
    this.state.set('confirming');

    this.waitlistService.confirmOffer(this.id, this.token).subscribe({
      next: () => this.state.set('confirmed'),
      error: (err) => {
        this.state.set('invalid');
        this.errorMessage.set(
          err?.error?.message || this.i18n.t('waitlist.offerConfirmFailed')
        );
      }
    });
  }

  formatScheduledAt(iso: string): string {
    return new Date(iso).toLocaleString(this.i18n.intlLocale(), {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
