import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-purchase-request-report',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Informe de Solicitud de Compras</h2>
    <p class="text-gray-400">Módulo para generar informes sobre las solicitudes de compras. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseRequestReportComponent {}