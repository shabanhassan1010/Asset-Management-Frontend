import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';

import { TranslatePipe } from '../../pipes/translate.pipe';
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {

  private location = inject(Location);

    goBack(): void {
    this.location.back();
  }

}
