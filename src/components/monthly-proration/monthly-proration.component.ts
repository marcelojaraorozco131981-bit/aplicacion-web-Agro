import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-monthly-proration',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Prorrateo Mensual</h2>
    <p class="text-gray-400">Módulo para ejecutar el proceso de prorrateo mensual de costos de maquinaria. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlyProrationComponent {}