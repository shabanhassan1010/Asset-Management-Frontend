import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AssetService } from '../../../core/services/AssetService';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {ASSET_STATUSES,AssetFilters,AssetListItem,DEFAULT_FILTERS,RETIRED_STATUS_ID,} 
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
  private auth = inject(Auth);

  isAdmin = this.auth.isAdmin;
  statuses = ASSET_STATUSES;

  // نسخة من القيم الافتراضية — مش نفس الكائن، عشان resetFilters()
  // ما يبوّظش الثابت الأصلي.
  filters = signal<AssetFilters>({ ...DEFAULT_FILTERS });

  items = signal<AssetListItem[]>([]);
  totalCount = signal(0);
  loading = signal(true);
  errorMessage = signal('');

  lookups = signal<AssetLookups | null>(null);

  // الأصل اللي الديالوج مفتوح عليه — null معناها الديالوج مقفول
  retiringAsset = signal<AssetListItem | null>(null);

  // البحث بيتأخر 350ms عشان ما نبعتش نداء مع كل حرف.
  private searchInput = new Subject<string>();

  lastPage = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.filters().pageSize)));

  firstRowNumber = computed(() =>
    this.totalCount() === 0 ? 0 : (this.filters().pageNumber - 1) * this.filters().pageSize + 1,
  );

  lastRowNumber = computed(() =>
    Math.min(this.filters().pageNumber * this.filters().pageSize, this.totalCount()),
  );

  // بيتحدد إذا كان فيه أي فلتر شغال — عشان نظهر زرار "Clear filters".
  hasActiveFilters = computed(() => {
    const f = this.filters();
    return !!(
      f.search ||
      f.categoryId ||
      f.assetTypeId ||
      f.statusId ||
      f.departmentId ||
      f.locationId ||
      f.employeeId ||
      f.includeRetired
    );
  });

  constructor() {
    this.searchInput
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        takeUntilDestroyed(), // بيلغي الاشتراك لوحده لما الكومبوننت يتقفل
      )
      .subscribe((value) => this.patchFilters({ search: value }));
  }

  ngOnInit(): void {
    this.lookupService.getAll().subscribe({
      next: (data) => this.lookups.set(data),
      // فشل الـ lookups بيقلل الفلاتر بس، مش بيمنع عرض الجدول —
      // بس بنطبع الغلطة عشان ما تتبلعش من غير ما نعرف.
      error: (err) => console.error('lookups failed', err),
    });
    this.load();
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
        this.errorMessage.set('Could not load assets. Check your connection and try again.');
        this.loading.set(false);
      },
    });
  }

  onSearch(value: string): void {
    this.searchInput.next(value);
  }

  /** أي تغيير في فلتر بيرجّعنا لأول صفحة — وإلا ممكن تقف على صفحة مش موجودة. */
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

  /** أول ضغطة على العمود = تصاعدي، والتانية على نفس العمود بتعكس الاتجاه. */
  sortBy(column: string): void {
    const current = this.filters();
    this.patchFilters({
      sortBy: column,
      sortDesc: current.sortBy === column ? !current.sortDesc : false,
    });
  }

  sortArrow(column: string): string {
    const f = this.filters();
    if (f.sortBy !== column) return '';
    return f.sortDesc ? ' ↓' : ' ↑';
  }

  resetFilters(): void {
    this.filters.set({ ...DEFAULT_FILTERS });
    this.load();
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
    // إعادة التحميل عشان الحالة والـ rowVersion يتحدثوا — الصف
    // اللي في الذاكرة بقى قديم بعد الحفظ.
    this.load();
  }
}