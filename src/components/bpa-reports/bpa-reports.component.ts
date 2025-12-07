import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-bpa-reports',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Informes de BPA</h2>
    <p class="text-gray-400">Módulo para generar informes relacionados con las Buenas Prácticas Agrícolas. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BpaReportsComponent {}