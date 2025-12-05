import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cost-center-distribution-report',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Informe de Distribución por Centro de Costo</h2>
    <p class="text-gray-400">Módulo para generar informes sobre la distribución de las compras por centro de costo. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostCenterDistributionReportComponent {}