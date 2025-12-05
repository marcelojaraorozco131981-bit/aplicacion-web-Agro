import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-machinery',
  template: `<div class="container mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-bold text-gray-100">Resumen de Maquinaria</h2>
      <button class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200">
        Agregar Maquinaria
      </button>
    </div>
    <div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
      <p class="text-gray-400">Módulo de Maquinarias en construcción. Aquí se gestionará el inventario, mantenimiento y operación de la maquinaria agrícola.</p>
    </div>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MachineryComponent {}