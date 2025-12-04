import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-budget-vs-cost-table',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Cuadro Comparativo: Presupuesto vs Costos</h2>
    <p class="text-gray-400">Módulo para visualizar un cuadro comparativo entre el presupuesto y los costos reales. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetVsCostTableComponent {}
