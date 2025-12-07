import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contractors',
  templateUrl: './contractors.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractorsComponent {}
