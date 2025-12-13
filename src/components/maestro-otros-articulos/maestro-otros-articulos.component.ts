import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-maestro-otros-articulos',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Maestro de Otros Artículos</h2>
    <p class="text-gray-400">Módulo para la gestión del maestro de otros artículos y servicios. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaestroOtrosArticulosComponent {}
