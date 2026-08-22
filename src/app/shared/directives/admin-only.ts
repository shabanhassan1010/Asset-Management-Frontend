import { Directive } from '@angular/core';

@Directive({
  selector: '[appAdminOnly]',
})
export class AdminOnly {

  constructor() { }

}
