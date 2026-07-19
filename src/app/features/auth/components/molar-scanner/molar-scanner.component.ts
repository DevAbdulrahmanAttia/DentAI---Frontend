import { Component } from '@angular/core';

@Component({
  selector: 'app-molar-scanner',
  standalone: true,
  template: `
    <div class="scan-stage">
      <svg class="molar" viewBox="0 0 200 200" fill="none">
        <path d="M100 22c-22 0-34 13-46 13-13 0-21-8-21 15 0 35 12 75 28 99 8 12 15 18 20 18 4.5 0 6.5-5 9.5-17 2.5-10 5-17 10-17s7.5 7 10 17c3 12 5 17 9.5 17 5 0 12-6 20-18 16-24 28-64 28-99 0-23-8-15-21-15-12 0-24-13-46-13z" stroke="#2F5A79" stroke-width="1.5" fill="#123A5E"/>
        <path d="M100 22c-22 0-34 13-46 13-13 0-21-8-21 15 0 35 12 75 28 99 8 12 15 18 20 18 4.5 0 6.5-5 9.5-17 2.5-10 5-17 10-17s7.5 7 10 17c3 12 5 17 9.5 17 5 0 12-6 20-18 16-24 28-64 28-99 0-23-8-15-21-15-12 0-24-13-46-13z" stroke="#4FD2DE" stroke-width=".5" fill="none" opacity=".5"/>
      </svg>
      <div class="scanline"></div>
      <div class="readout"><div class="conf">ANALYSIS · CONFIDENCE 94.2%</div></div>
    </div>
  `,
  styles: [`
    .scan-stage {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    .molar {
      width: 230px;
      height: 230px;
      opacity: .92;
    }
    .scanline {
      position: absolute;
      left: 8%;
      right: 8%;
      height: 2px;
      background: linear-gradient(90deg, rgba(14,124,134,0) 0%, #4fd2de 50%, rgba(14,124,134,0) 100%);
      box-shadow: 0 0 18px 2px rgba(79,210,222,.55);
      animation: sweep 3.4s cubic-bezier(.65,0,.35,1) infinite;
    }
    @keyframes sweep {
      0% { top: 18%; opacity: 0; }
      8% { opacity: 1; }
      50% { top: 82%; opacity: 1; }
      58% { opacity: 0; }
      100% { top: 82%; opacity: 0; }
    }
    .readout {
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
    }
    .readout .conf {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--color-teal-dim, #b7dcdf);
      letter-spacing: .04em;
      white-space: nowrap;
    }
  `]
})
export class MolarScannerComponent {}
