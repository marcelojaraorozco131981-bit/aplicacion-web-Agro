import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-maintain-kg-boxes-by-cc',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Mantención de Kilos/Cajas por Centro de Costo</h2>
    <p class="text-gray-400">Módulo para la mantención de la relación de kilos y cajas por centro de costo. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintainKgBoxesByCcComponent {}
