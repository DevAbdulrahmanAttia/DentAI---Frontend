import { Component, OnInit, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryCategory, InventoryItem } from '@core/models/inventory-item.model';
import { InventoryService } from '@features/inventory/services/inventory.service';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';

@Component({
  selector: 'app-inventory-item-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './inventory-item-form.component.html',
  styleUrl: './inventory-item-form.component.css'
})
export class InventoryItemFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  private readonly i18n = inject(I18nService);

  mode = input<'add' | 'edit'>('add');
  initialValue = input<InventoryItem | undefined>(undefined);

  saved = output<InventoryItem>();

  protected readonly categories: InventoryCategory[] = [
    'consumable',
    'equipment',
    'medication',
    'ppe',
    'other'
  ];

  protected saveError = '';
  protected isSaving = false;

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    category: ['consumable' as InventoryCategory, Validators.required],
    unit: ['', Validators.required],
    quantityInStock: [0, [Validators.required, Validators.min(0)]],
    unitCost: [0, [Validators.required, Validators.min(0)]],
    lowStockThreshold: [0, [Validators.required, Validators.min(0)]],
    expiryDate: ['']
  });

  ngOnInit(): void {
    const item = this.initialValue();
    if (this.mode() === 'edit' && item) {
      this.form.setValue({
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantityInStock: Number(item.quantityInStock),
        unitCost: Number(item.unitCost),
        lowStockThreshold: Number(item.lowStockThreshold),
        expiryDate: item.expiryDate ?? ''
      });
    }
  }

  /** i18n key — resolved via the `t` pipe in the template. */
  get submitLabel(): string {
    if (this.isSaving) return this.mode() === 'add' ? 'inventory.adding' : 'inventory.saving';
    return this.mode() === 'add' ? 'inventory.addItemAction' : 'inventory.saveChanges';
  }

  submit(): void {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.saveError = '';
    const { name, category, unit, quantityInStock, unitCost, lowStockThreshold, expiryDate } =
      this.form.getRawValue();
    const payload = {
      name,
      category,
      unit,
      quantityInStock,
      unitCost,
      lowStockThreshold,
      expiryDate: expiryDate || undefined
    };

    const request =
      this.mode() === 'add'
        ? this.inventoryService.createItem(payload)
        : this.inventoryService.updateItem(this.initialValue()!.id, payload);

    request.subscribe({
      next: (item) => {
        this.isSaving = false;
        this.saved.emit(item);
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = err?.error?.message || this.i18n.t('inventory.saveFailed');
      }
    });
  }
}
