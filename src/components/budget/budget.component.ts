
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-budget',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Presupuesto</h2>
    <p class="text-gray-400">Módulo de Presupuesto en construcción. Aquí se planificarán y controlarán los presupuestos por área y proyecto.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetComponent {}
