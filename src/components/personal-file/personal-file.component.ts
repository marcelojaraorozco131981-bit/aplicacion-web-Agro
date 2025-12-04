import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-personal-file',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Ficha Personal</h2>
    <p class="text-gray-400">Módulo para la gestión de la ficha de personal. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalFileComponent {}
