import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-warehouse-accounting-transfer',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Traspaso Contable de Bodega</h2>
    <p class="text-gray-400">Módulo para generar y gestionar el traspaso de información de bodega a contabilidad. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseAccountingTransferComponent {}