import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

interface Company { id: number; name: string; }
// Simplified interface for this component's needs
interface WarehouseMovement {
  id: number; // Nro Correlativo
  companyId: number;
}

@Component({
  selector: 'app-warehouse-guides-report',
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-gray-100">Informe de Guías de Bodega</h2>
      </div>

      <div class="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <form [formGroup]="reportForm" (ngSubmit)="generarReporte()">
          <div class="p-6 lg:p-8">
            <h3 class="flex items-center text-xl font-semibold text-emerald-400 border-b border-gray-700/50 pb-4 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-emerald-500/80" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                </svg>
                Filtros del Reporte
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                
                <div class="form-field md:col-span-2">
                  <label for="empresaId">Empresa</label>
                  <select id="empresaId" formControlName="empresaId" class="form-input">
                    <option [ngValue]="null" disabled>-- Seleccione una Empresa --</option>
                    @for (company of companies(); track company.id) {
                      <option [value]="company.id">{{ company.name }}</option>
                    }
                  </select>
                   @if (reportForm.get('empresaId')?.hasError('required') && reportForm.get('empresaId')?.touched) {
                      <p class="mt-1 text-xs text-red-400">Debe seleccionar una empresa.</p>
                   }
                </div>

                <div class="form-field">
                  <label for="correlativoDesde">Rango de Correlativos</label>
                  <div class="flex items-center gap-2">
                    <select id="correlativoDesde" formControlName="correlativoDesde" class="form-input" [disabled]="!selectedCompanyId()">
                      <option [ngValue]="null">-- Desde --</option>
                      @for (id of availableCorrelativos(); track id) {
                        <option [value]="id">{{ id }}</option>
                      }
                    </select>
                    <span class="text-gray-400">-</span>
                    <select id="correlativoHasta" formControlName="correlativoHasta" class="form-input" [disabled]="!selectedCompanyId()">
                      <option [ngValue]="null">-- Hasta --</option>
                      @for (id of availableCorrelativos(); track id) {
                        <option [value]="id">{{ id }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="form-field">
                  <label for="fechaDesde">Rango de Fechas</label>
                   <div class="flex items-center gap-2">
                    <input type="date" id="fechaDesde" formControlName="fechaDesde" class="form-input">
                    <span class="text-gray-400">-</span>
                    <input type="date" id="fechaHasta" formControlName="fechaHasta" class="form-input">
                  </div>
                </div>

              </div>
          </div>
          <div class="bg-gray-800/50 px-6 py-4 flex justify-end border-t border-gray-700/80 rounded-b-lg">
            <button type="submit" [disabled]="reportForm.invalid" class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
              </svg>
              Generar Reporte
            </button>
          </div>
        </form>
      </div>
    </div>
    <style>
      .form-field { @apply flex flex-col; }
      .form-field label { @apply block text-sm font-medium text-gray-400 mb-2; }
      .form-input { @apply block w-full bg-gray-900/70 border-2 border-gray-600/80 rounded-lg shadow-sm py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 sm:text-sm transition-all duration-200; }
      .form-input:hover { @apply border-gray-500; }
      .form-input:disabled { @apply opacity-50 bg-gray-800/50 cursor-not-allowed; }
      .form-input option { @apply text-gray-900; }
    </style>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class WarehouseGuidesReportComponent implements OnInit {
  private fb = inject(FormBuilder);

  companies = signal<Company[]>([
    { id: 1, name: 'Agrícola San José' },
    { id: 2, name: 'Exportadora del Valle' }
  ]);

  // Simulate having access to all movements
  allMovements = signal<WarehouseMovement[]>([
    { id: 1001, companyId: 1 },
    { id: 1002, companyId: 1 },
    { id: 1003, companyId: 2 },
    { id: 1004, companyId: 1 },
    { id: 1005, companyId: 2 },
  ]);

  selectedCompanyId = signal<number | null>(null);

  availableCorrelativos = computed(() => {
    const companyId = this.selectedCompanyId();
    if (!companyId) return [];

    return this.allMovements()
        .filter(m => m.companyId === companyId)
        .map(m => m.id)
        .sort((a, b) => a - b);
  });

  reportForm = this.fb.group({
    empresaId: [null as number | null, Validators.required],
    correlativoDesde: [null as number | null],
    correlativoHasta: [null as number | null],
    fechaDesde: [''],
    fechaHasta: ['']
  });

  ngOnInit() {
    this.reportForm.get('empresaId')?.valueChanges.subscribe(companyId => {
      this.selectedCompanyId.set(companyId ? Number(companyId) : null);
      this.reportForm.get('correlativoDesde')?.reset(null);
      this.reportForm.get('correlativoHasta')?.reset(null);
    });
  }

  generarReporte(): void {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      console.error('Formulario de reporte inválido.');
      return;
    }
    console.log('Generando reporte con los siguientes filtros:', this.reportForm.value);
    // Future: Call a service to generate and display/download the report.
  }
}
