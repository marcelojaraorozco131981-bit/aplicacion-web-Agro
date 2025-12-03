
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-bpa',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Buenas Prácticas Agrícolas (BPA)</h2>
    <p class="text-gray-400">Módulo de BPA en construcción. Aquí se realizará el seguimiento y la certificación de buenas prácticas agrícolas.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BpaComponent {}
