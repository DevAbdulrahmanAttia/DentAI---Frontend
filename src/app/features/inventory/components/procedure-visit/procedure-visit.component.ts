import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { InventoryItem, MaterialUsageEntry } from '@core/models/inventory-item.model';
import { InventoryService } from '@features/inventory/services/inventory.service';

type ChecklistRow = FormGroup<{
  checked: FormControl<boolean>;
  quantity: FormControl<number>;
}>;

@Component({
  selector: 'app-procedure-visit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './procedure-visit.component.html',
  styleUrl: './procedure-visit.component.css'
})
export class ProcedureVisitComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  protected readonly authService = inject(AuthService);

  appointmentId = input.required<string>();

  protected readonly loggedUsage = signal<MaterialUsageEntry[]>([]);
  protected readonly usageLoading = signal(true);

  protected readonly items = signal<InventoryItem[]>([]);
  protected readonly itemsLoading = signal(true);
  protected readonly checklist = this.fb.array<ChecklistRow>([]);

  protected readonly submitting = signal(false);
  protected readonly submitError = signal('');

  ngOnInit(): void {
    this.loadUsage();

    if (this.authService.isClinician()) {
      this.reloadItems();
    }
  }

  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  submitChecklist(): void {
    const selections = this.items()
      .map((item, index) => ({ item, row: this.checklist.at(index) }))
      .filter(({ row }) => row.value.checked);

    if (selections.length === 0 || this.submitting()) return;
    if (selections.some(({ row }) => (row.value.quantity ?? 0) <= 0)) {
      this.submitError.set('Enter a quantity greater than 0 for each checked item.');
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');

    const requests = selections.map(({ item, row }) =>
      this.inventoryService.logUsage({
        appointmentId: this.appointmentId(),
        inventoryItemId: item.id,
        quantityUsed: row.value.quantity!
      })
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.submitting.set(false);
        this.checklist.controls.forEach((row) => row.reset({ checked: false, quantity: 1 }));
        this.loadUsage();
        this.reloadItems();
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err?.error?.message || 'Could not log some of the selected materials.');
      }
    });
  }

  private loadUsage(): void {
    this.usageLoading.set(true);
    this.inventoryService.getUsageForAppointment(this.appointmentId()).subscribe({
      next: (usage) => {
        this.loggedUsage.set(usage);
        this.usageLoading.set(false);
      },
      error: () => this.usageLoading.set(false)
    });
  }

  private reloadItems(): void {
    this.itemsLoading.set(true);
    this.inventoryService.listItems().subscribe({
      next: (items) => {
        this.items.set(items);
        this.checklist.clear();
        items.forEach(() => this.checklist.push(this.buildChecklistRow()));
        this.itemsLoading.set(false);
      },
      error: () => this.itemsLoading.set(false)
    });
  }

  private buildChecklistRow(): ChecklistRow {
    return this.fb.nonNullable.group({
      checked: [false],
      quantity: [1, [Validators.min(0.01)]]
    });
  }
}
