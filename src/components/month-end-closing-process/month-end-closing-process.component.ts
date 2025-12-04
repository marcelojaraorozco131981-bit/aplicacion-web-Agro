import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-month-end-closing-process',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Proceso de Cierre de Mes</h2>
    <p class="text-gray-400">Módulo para ejecutar las tareas de cierre de mes del módulo de remuneraciones. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthEndClosingProcessComponent {}
