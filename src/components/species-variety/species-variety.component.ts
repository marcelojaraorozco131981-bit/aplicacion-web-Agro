import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-species-variety',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Gestión de Especies y Variedades</h2>
    <p class="text-gray-400">Módulo para la administración de especies y variedades de cultivos. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeciesVarietyComponent {}
