
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contractors',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Contratistas</h2>
    <p class="text-gray-400">Módulo de Contratistas en construcción. Aquí se gestionará la información, contratos y pagos a contratistas externos.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractorsComponent {}
