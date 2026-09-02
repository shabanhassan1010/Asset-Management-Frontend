import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrentUser, UserRole } from '../../core/models/auth.model';
import { Auth } from '../../core/services/auth';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private userService = inject(UserService);
  private auth = inject(Auth);

  profile = signal<CurrentUser | null>(null);
  loading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {

    this.userService.me().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.auth.currentUser.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Your profile could not be loaded.');
        this.loading.set(false);
      },
    });
  }

  isAdmin(): boolean {
    return this.profile()?.role === UserRole.Admin;
  }

  isAccountActive(): boolean {
    return this.profile()?.isActive === true;
  }
  
  initials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
