import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-department-user-report',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Informe por Departamento y Usuario</h2>
    <p class="text-gray-400">Módulo para generar informes de compras filtrados por departamento y usuario. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentUserReportComponent {}