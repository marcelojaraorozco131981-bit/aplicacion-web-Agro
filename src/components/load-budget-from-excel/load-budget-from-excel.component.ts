import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-load-budget-from-excel',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Cargar Presupuesto desde Excel</h2>
    <p class="text-gray-400">Módulo para la carga masiva de presupuestos desde un archivo Excel. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadBudgetFromExcelComponent {}
