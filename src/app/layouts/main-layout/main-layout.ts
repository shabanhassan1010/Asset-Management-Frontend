import { Component, computed, inject, signal } from '@angular/core';
import { Auth } from '../../core/services/auth';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  adminOnly: boolean;
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  private auth = inject(Auth);

  displayName = this.auth.displayName;
  isAdmin = this.auth.isAdmin;
  roleLabel = computed(() => (this.isAdmin() ? 'Admin' : 'User'));

  navOpen = signal(false);

  navItems = computed<NavItem[]>(() =>
    [
      { path: '/dashboard', label: 'Dashboard', icon: '▤', adminOnly: false },
      { path: '/assets', label: 'Assets', icon: '▣', adminOnly: false },
      { path: '/ask', label: 'Ask AI', icon: '✦', adminOnly: false },
      { path: '/lookups', label: 'Lookup data', icon: '⛁', adminOnly: true },
      { path: '/users', label: 'Users', icon: '◉', adminOnly: true },
      { path: '/profile', label: 'My profile', icon: '☺', adminOnly: false },
    ].filter((item) => !item.adminOnly || this.isAdmin()),
  );

  initials = computed(() => this.displayName().slice(0, 2).toUpperCase());

  toggleNav() {
    this.navOpen.update((open) => !open);
  }
  closeNav() {
    this.navOpen.set(false);
  }
  signOut() {
    this.auth.logout();
  }
}
