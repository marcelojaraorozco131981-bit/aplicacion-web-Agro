import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-sales',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Gestión de Ventas</h2>
    <p class="text-gray-400">Módulo para la administración de clientes, cuentas por cobrar y facturación. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesComponent {}