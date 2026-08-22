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
}
