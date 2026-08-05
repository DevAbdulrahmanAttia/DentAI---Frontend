import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { InventoryCategory, InventoryItem } from '@core/models/inventory-item.model';
import { InventoryService } from '@features/inventory/services/inventory.service';
import { InventoryItemFormComponent } from '@features/inventory/components/inventory-item-form/inventory-item-form.component';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { StatusPillComponent } from '@shared/ui/status-pill/status-pill.component';
import { stockStatusInfo } from '@shared/utils/status-maps';

type CategoryFilter = 'all' | InventoryCategory;

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [ReactiveFormsModule, InventoryItemFormComponent, ModalComponent, StatusPillComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  private readonly route = inject(ActivatedRoute);
  protected readonly authService = inject(AuthService);

  protected readonly searchControl = this.fb.control('');
  protected readonly items = signal<InventoryItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);

  protected readonly categories: InventoryCategory[] = [
    'consumable',
    'equipment',
    'medication',
    'ppe',
    'other'
  ];
  protected readonly categoryFilter = signal<CategoryFilter>('all');

  protected readonly filteredItems = computed(() => {
    const query = (this.searchControl.value ?? '').trim().toLowerCase();
    const category = this.categoryFilter();
    return this.items().filter((item) => {
      const matchesQuery = !query || item.name.toLowerCase().includes(query);
      const matchesCategory = category === 'all' || item.category === category;
      return matchesQuery && matchesCategory;
    });
  });

  protected readonly stockStatusInfo = stockStatusInfo;

  protected readonly showAddForm = signal(false);
  protected readonly editingItem = signal<InventoryItem | null>(null);

  ngOnInit(): void {
    // Lets the alerts panel deep-link here with the flagged item pre-filtered
    // (e.g. "?q=Race Test Gloves" from a low-stock/near-expiry alert click).
    const initialQuery = this.route.snapshot.queryParamMap.get('q');
    if (initialQuery) {
      this.searchControl.setValue(initialQuery);
    }
    this.loadItems();
  }

  onCategoryFilterChange(value: CategoryFilter): void {
    this.categoryFilter.set(value);
  }

  onItemAdded(item: InventoryItem): void {
    this.showAddForm.set(false);
    this.items.update((current) => [...current, item].sort((a, b) => a.name.localeCompare(b.name)));
  }

  onItemUpdated(item: InventoryItem): void {
    this.editingItem.set(null);
    this.items.update((current) => current.map((i) => (i.id === item.id ? item : i)));
  }

  deleteItem(item: InventoryItem): void {
    if (!confirm(`Delete "${item.name}" from inventory? This can't be undone.`)) return;

    this.inventoryService.deleteItem(item.id).subscribe({
      next: () => this.items.update((current) => current.filter((i) => i.id !== item.id)),
      error: () => alert(`Couldn't delete "${item.name}". It may already be referenced by logged usage.`)
    });
  }

  private loadItems(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.inventoryService.listItems().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }
}
