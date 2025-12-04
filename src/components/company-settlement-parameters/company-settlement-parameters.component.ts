import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-company-settlement-parameters',
  template: `<div class="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
    <h2 class="text-3xl font-bold mb-4 text-gray-100">Parámetros de Liquidación Empresa</h2>
    <p class="text-gray-400">Módulo para configurar los parámetros de liquidación a nivel de empresa. En construcción.</p>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanySettlementParametersComponent {}
