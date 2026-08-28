import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-asset-type',
  imports: [],
  templateUrl: './asset-type.html',
  styleUrl: './asset-type.css',
})
export class AssetType {
  
count = signal(0);

  increase() {
    this.count.update(value => value + 1);
  }

  decrease() {
    this.count.update(value => value - 1);
  }
}
