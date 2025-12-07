import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-treasury',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Gestión de Tesorería</h2>
    <p class="text-gray-400">Módulo para la administración de flujos de caja, bancos y conciliaciones. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreasuryComponent {}