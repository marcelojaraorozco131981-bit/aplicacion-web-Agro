import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-plant',
  templateUrl: './plant.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlantComponent {}