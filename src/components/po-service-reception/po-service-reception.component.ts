import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-po-service-reception',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Recepción de Órdenes de Compra de Servicios</h2>
    <p class="text-gray-400">Módulo para registrar la recepción de servicios asociados a órdenes de compra. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoServiceReceptionComponent {}