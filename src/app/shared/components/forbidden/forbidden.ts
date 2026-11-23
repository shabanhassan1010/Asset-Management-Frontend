import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '../../pipes/translate.pipe';
@Component({
  selector: 'app-forbidden',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.css',
})
export class Forbidden {

}
