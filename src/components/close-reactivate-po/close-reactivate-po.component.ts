import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-close-reactivate-po',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Cerrar o Reactivar Órdenes de Compra</h2>
    <p class="text-gray-400">Módulo para cerrar o reactivar órdenes de compra existentes. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CloseReactivatePoComponent {}