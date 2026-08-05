import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupportService } from '@features/support/services/support.service';

@Component({
  selector: 'app-faq-assistant',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './faq-assistant.component.html',
  styleUrl: './faq-assistant.component.css'
})
export class FaqAssistantComponent {
  private readonly fb = inject(FormBuilder);
  private readonly supportService = inject(SupportService);

  protected readonly form = this.fb.nonNullable.group({
    question: ['', [Validators.required, Validators.maxLength(500)]]
  });

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly suggestedResponse = signal<string | null | undefined>(undefined);
  protected readonly copied = signal(false);

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.suggestedResponse.set(undefined);
    this.copied.set(false);

    const { question } = this.form.getRawValue();
    this.supportService.suggestFaqResponse(question).subscribe({
      next: ({ suggestedResponse }) => {
        this.loading.set(false);
        this.suggestedResponse.set(suggestedResponse);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Could not generate a suggestion. Please try again.');
      }
    });
  }

  copyResponse(): void {
    const text = this.suggestedResponse();
    if (!text) return;
    void navigator.clipboard.writeText(text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
