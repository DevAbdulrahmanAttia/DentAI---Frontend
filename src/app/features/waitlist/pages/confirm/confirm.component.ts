import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WaitlistOfferPreview } from '@core/models/waitlist.model';
import { WaitlistService } from '@features/waitlist/services/waitlist.service';

type ViewState = 'loading' | 'preview' | 'confirming' | 'confirmed' | 'invalid';

@Component({
  selector: 'app-waitlist-confirm',
  standalone: true,
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.css'
})
export class ConfirmComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
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
      this.errorMessage.set('This link is missing information and cannot be used.');
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
          err?.error?.message || 'This offer is no longer valid. It may have expired or already been used.'
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
          err?.error?.message || 'This offer could not be confirmed. It may have expired or already been used.'
        );
      }
    });
  }

  formatScheduledAt(iso: string): string {
    return new Date(iso).toLocaleString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
