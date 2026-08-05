import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppointmentDetailsPanelComponent } from '@features/appointments/components/appointment-details-panel/appointment-details-panel.component';

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [RouterLink, AppointmentDetailsPanelComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly appointmentId = this.route.snapshot.paramMap.get('id') ?? '';
}
