import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-maintain-season-budget',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Mantención de Presupuesto por Temporada</h2>
    <p class="text-gray-400">Módulo para la mantención y ajuste de los presupuestos de la temporada. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintainSeasonBudgetComponent {}
