import { Component, input } from '@angular/core';

export type PillTone = 'teal' | 'green' | 'amber' | 'red' | 'grey';

@Component({
  selector: 'app-status-pill',
  standalone: true,
  template: `
    <span class="pill pill-{{ tone() }}">
      <span class="pill-dot"></span>{{ label() }}
    </span>
  `,
  styles: [`
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      white-space: nowrap;
    }
    .pill-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .pill-teal { background: var(--color-teal-light, #e3f1f2); color: var(--color-teal, #0e7c86); }
    .pill-teal .pill-dot { background: var(--color-teal, #0e7c86); }
    .pill-green { background: #e9f5ee; color: var(--color-green, #2e8b57); }
    .pill-green .pill-dot { background: var(--color-green, #2e8b57); }
    .pill-amber { background: #fbf3e1; color: var(--color-amber, #b7791f); }
    .pill-amber .pill-dot { background: var(--color-amber, #b7791f); }
    .pill-red { background: #fbeae9; color: var(--color-red, #c4433d); }
    .pill-red .pill-dot { background: var(--color-red, #c4433d); }
    .pill-grey { background: #eef1f3; color: var(--color-faint, #8a96a1); }
    .pill-grey .pill-dot { background: var(--color-faint, #8a96a1); }
  `]
})
export class StatusPillComponent {
  tone = input.required<PillTone>();
  label = input.required<string>();
}
