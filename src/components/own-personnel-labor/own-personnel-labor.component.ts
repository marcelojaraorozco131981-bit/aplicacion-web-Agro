import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-own-personnel-labor',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Mano de Obra Personal Propio</h2>
    <p class="text-gray-400">Módulo para la gestión de la mano de obra del personal propio. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OwnPersonnelLaborComponent {}
