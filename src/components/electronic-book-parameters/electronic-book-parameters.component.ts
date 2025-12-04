import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-electronic-book-parameters',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Parámetros del Libro Electrónico</h2>
    <p class="text-gray-400">Módulo para la configuración de parámetros del libro de remuneraciones electrónico. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ElectronicBookParametersComponent {}