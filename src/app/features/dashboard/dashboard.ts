import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DashboardSummary } from '../../core/models/Dashboard.model';
import { Auth } from '../../core/services/auth';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { DashboardService } from '../../core/services/DashboardService';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  private auth = inject(Auth);

  displayName = this.auth.displayName;
  isAdmin = this.auth.isAdmin;

  summary = signal<DashboardSummary | null>(null);
  loading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load the dashboard. Check your connection and try again.');
        this.loading.set(false);
      },
    });
  }

  private maxCategoryCount = computed(() =>
    Math.max(1, ...(this.summary()?.assetsByCategory ?? []).map((c) => c.count)),
  );

  barWidth(count: number): string {
    return `${(count / this.maxCategoryCount()) * 100}%`;
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
}
