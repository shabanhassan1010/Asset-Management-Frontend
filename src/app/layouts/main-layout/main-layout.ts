import { Component, computed, inject, signal } from '@angular/core';
import { Auth } from '../../core/services/auth';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PreferencesToggle } from '../../shared/components/preferences-toggle/preferences-toggle';

import { TranslatePipe } from '../../shared/pipes/translate.pipe';
interface NavItem {
  path: string;
  label: string; // English text — translated in the template with the t pipe
  icon: string;
  adminOnly: boolean;
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, PreferencesToggle],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  private auth = inject(Auth);
  collapsed = signal(localStorage.getItem('sidebarCollapsed') === '1');

  displayName = this.auth.displayName;
  isAdmin = this.auth.isAdmin;

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

  toggleNav() {
    this.navOpen.update((open) => !open);
  }
  closeNav() {
    this.navOpen.set(false);
  }
  signOut() {
    this.auth.logout();
  }

  toggleCollapsed() {
    this.collapsed.update((v) => !v);
    localStorage.setItem('sidebarCollapsed', this.collapsed() ? '1' : '0');
  }


}