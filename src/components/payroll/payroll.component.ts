
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-payroll',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Remuneraciones</h2>
    <p class="text-gray-400">Módulo de Remuneraciones en construcción. Aquí se gestionarán nóminas, pagos y liquidaciones de sueldo.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayrollComponent {}
