import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-asignacion-permisos-usuario',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Asignación de Permisos de Usuario</h2>
    <p class="text-gray-400">Módulo para asignar permisos de compras a los usuarios por departamento. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsignacionPermisosUsuarioComponent {}
