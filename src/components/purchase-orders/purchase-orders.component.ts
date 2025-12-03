
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-purchase-orders',
  templateUrl: './purchase-orders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseOrdersComponent {}
