import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AssetService } from '../../../core/services/AssetService';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { ASSET_STATUSES, AssetFilters, AssetListItem, DEFAULT_FILTERS, RETIRED_STATUS_ID } 
from '../../../core/models/Asset.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Auth } from '../../../core/services/auth';
import { AssetLookups } from '../../../core/models/Lookup.model';
import { LookupService } from '../../../core/services/LookupService';
import { RetireAsset } from '../retire-asset/retire-asset';

@Component({
  selector: 'app-asset-list',
  imports: [RouterLink, DecimalPipe, RetireAsset],
  templateUrl: './asset-list.html',
  styleUrl: './asset-list.css',
})
export class AssetList implements OnInit {
  private assetService = inject(AssetService);
  private lookupService = inject(LookupService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(Auth);

  isAdmin = this.auth.isAdmin;
  statuses = ASSET_STATUSES;

  filters = signal<AssetFilters>({ ...DEFAULT_FILTERS });

  items = signal<AssetListItem[]>([]);
  totalCount = signal(0);
  loading = signal(true);
  errorMessage = signal('');

  lookups = signal<AssetLookups | null>(null);

  retiringAsset = signal<AssetListItem | null>(null);

  private searchInput = new Subject<string>();

  lastPage = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.filters().pageSize)));

  firstRowNumber = computed(() =>
    this.totalCount() === 0 ? 0 : (this.filters().pageNumber - 1) * this.filters().pageSize + 1,
  );

  lastRowNumber = computed(() =>
    Math.min(this.filters().pageNumber * this.filters().pageSize, this.totalCount()),
  );

  hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(f.search || f.categoryId || f.assetTypeId || f.statusId || f.departmentId ||
              f.locationId || f.employeeId || f.includeRetired || f.warrantyWithinDays);
  });

  constructor() {
    this.searchInput.pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
                    .subscribe((value) => this.patchFilters({ search: value }));

    // Read filters from the URL (e.g. /assets?departmentId=1 coming from the dashboard).
    // Runs on first open AND every time the query params change.
    this.route.queryParamMap.pipe(takeUntilDestroyed())
                            .subscribe((params) => {
                              this.filters.set(this.readFiltersFromUrl(params));
                              this.load();
                            });
  }

  ngOnInit(): void {
    this.lookupService.getAll().subscribe({
      next: (data) => this.lookups.set(data),
      error: (err) => console.error('lookups failed', err),
    });
    // No load() here: the queryParamMap subscription in the constructor already loads on first open.
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.assetService.getPaginated(this.filters()).subscribe({
      next: (result) => {
        this.items.set(result.data);
        this.totalCount.set(result.totalItems);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('assets failed', err);
        // this.errorMessage.set('Could not load assets. Check your connection and try again.');
        this.loading.set(false);
      },
    });
  }

  onSearch(value: string): void {
    this.searchInput.next(value);
  }

  patchFilters(changes: Partial<AssetFilters>): void {
    this.filters.update((current) => ({ ...current, ...changes, pageNumber: 1 }));
    this.load();
  }

  goToPage(page: number): void {
    this.filters.update((current) => ({ ...current, pageNumber: page }));
    this.load();
  }

  changePageSize(size: string): void {
    this.patchFilters({ pageSize: +size });
  }

  sortBy(column: string): void {
    const current = this.filters();
    this.patchFilters({
      sortBy: column,
      sortDesc: current.sortBy === column ? !current.sortDesc : false,
    });
  }

  sortArrow(column: string): string {
    const f = this.filters();
    if (f.sortBy !== column) 
      return '';
    return f.sortDesc ? ' ↓' : ' ↑';
  }

  resetFilters(): void {
    const urlHasFilters = this.route.snapshot.queryParamMap.keys.length > 0;

    if (urlHasFilters) {
      // Clearing the URL makes the queryParamMap subscription reset the filters and reload
      this.router.navigate(['/assets']);
    } else {
      // Same URL → Angular ignores the navigation, so reset by hand
      this.filters.set({ ...DEFAULT_FILTERS });
      this.load();
    }
  }

  isRetired(asset: AssetListItem): boolean {
    return asset.statusId === RETIRED_STATUS_ID;
  }

  statusBadgeClass(statusId: number): string {
    switch (statusId) {
      case 1:
        return 'badge badge-available';
      case 2:
        return 'badge badge-assigned';
      case 3:
        return 'badge badge-maint';
      default:
        return 'badge badge-retired';
    }
  }

  openRetire(asset: AssetListItem): void {
    this.retiringAsset.set(asset);
  }

  closeRetire(): void {
    this.retiringAsset.set(null);
  }

  onRetired(): void {
    this.retiringAsset.set(null);
    this.load();
  }

  // Start from the defaults, then take the filters that exist in the URL.
  // Filters are strings (same as <select> values), so no number conversion is needed.
  // params.get() returns null when the key is missing → ?? '' keeps the "no filter" value.
  private readFiltersFromUrl(params: ParamMap): AssetFilters {
    return {
      ...DEFAULT_FILTERS,
      categoryId: params.get('categoryId') ?? '',
      departmentId: params.get('departmentId') ?? '',
      statusId: params.get('statusId') ?? '',
      warrantyWithinDays: params.get('warrantyWithinDays') ?? '',
    };
  }
}