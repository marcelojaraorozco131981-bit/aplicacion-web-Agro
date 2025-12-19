import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

interface Company { id: number; name: string; }
// Simplified interface for this component's needs
interface WarehouseMovement {
  id: number; // Nro Correlativo
  companyId: number;
}
interface Warehouse { id: number; companyId: number; name: string; }
interface Provider { id: number; companyId: number; name: string; }
type MovementType = 'Ingreso' | 'Egreso' | 'Traspaso';
type MovementStatus = 'Pendiente' | 'Procesado' | 'Anulado';


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

            <div class="space-y-10">
              <!-- Empresa -->
              <div class="form-field">
                <label for="empresaId" class="text-base">Empresa</label>
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

              <!-- Filtros Generales -->
              <div class="relative border-2 border-gray-700 rounded-lg p-6 pt-8">
                <h4 class="absolute -top-3 left-4 bg-gray-800 px-2 text-sm font-medium text-gray-400">Filtros Generales</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="form-field">
                    <label for="fechaDesde">Rango de Fechas</label>
                    <div class="flex items-center gap-2">
                      <input type="date" id="fechaDesde" formControlName="fechaDesde" class="form-input">
                      <span class="text-gray-400">-</span>
                      <input type="date" id="fechaHasta" formControlName="fechaHasta" class="form-input">
                    </div>
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
                    <label for="tipoMovimiento">Tipo de Movimiento</label>
                    <select id="tipoMovimiento" formControlName="tipoMovimiento" class="form-input">
                      <option [ngValue]="null">-- Todos --</option>
                      @for (type of movementTypes(); track type.id) {
                        <option [value]="type.id">{{ type.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-field">
                    <label for="estado">Estado de la Guía</label>
                    <select id="estado" formControlName="estado" class="form-input">
                      <option [ngValue]="null">-- Todos --</option>
                      @for (status of statuses(); track status.id) {
                        <option [value]="status.id">{{ status.name }}</option>
                      }
                    </select>
                  </div>
                </div>
              </div>

              <!-- Filtros Especificos -->
               <div class="relative border-2 border-gray-700 rounded-lg p-6 pt-8">
                <h4 class="absolute -top-3 left-4 bg-gray-800 px-2 text-sm font-medium text-gray-400">Filtros Específicos por Movimiento</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="form-field">
                      <label for="bodegaOrigenId">Bodega Origen</label>
                      <select id="bodegaOrigenId" formControlName="bodegaOrigenId" class="form-input" [disabled]="!selectedCompanyId()">
                        <option [ngValue]="null">-- Todas --</option>
                        @for (wh of filteredWarehouses(); track wh.id) {
                          <option [value]="wh.id">{{ wh.name }}</option>
                        }
                      </select>
                    </div>
                    <div class="form-field">
                      <label for="bodegaDestinoId">Bodega Destino</label>
                      <select id="bodegaDestinoId" formControlName="bodegaDestinoId" class="form-input">
                        <option [ngValue]="null">-- Todas --</option>
                        @for (wh of filteredWarehouses(); track wh.id) {
                          <option [value]="wh.id">{{ wh.name }}</option>
                        }
                      </select>
                      <p class="mt-1 text-xs text-gray-500">Se activa para movimientos de 'Traspaso'.</p>
                    </div>
                    <div class="form-field md:col-span-2">
                      <label for="proveedorId">Proveedor</label>
                      <select id="proveedorId" formControlName="proveedorId" class="form-input">
                        <option [ngValue]="null">-- Todos --</option>
                        @for (p of filteredProviders(); track p.id) {
                          <option [value]="p.id">{{ p.name }}</option>
                        }
                      </select>
                       <p class="mt-1 text-xs text-gray-500">Se activa para movimientos de 'Ingreso'.</p>
                    </div>
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
      .form-input:disabled { @apply opacity-50 bg-gray-800/50 border-gray-700 cursor-not-allowed; }
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

  allWarehouses = signal<Warehouse[]>([
    { id: 1, companyId: 1, name: 'Bodega Principal (SJO)' },
    { id: 2, companyId: 1, name: 'Bodega Fitosanitarios (SJO)' },
    { id: 3, companyId: 2, name: 'Bodega Central (EDV)' },
  ]);
  allProviders = signal<Provider[]>([
      { id: 1, companyId: 1, name: 'AgroInsumos S.A.' },
      { id: 2, companyId: 1, name: 'Fertilizantes del Sur' },
      { id: 3, companyId: 2, name: 'Semillas Premium del Valle' },
  ]);
  movementTypes = signal<{ id: MovementType, name: string }[]>([
    { id: 'Ingreso', name: 'Ingreso' },
    { id: 'Egreso', name: 'Egreso' },
    { id: 'Traspaso', name: 'Traspaso' },
  ]);
  statuses = signal<{ id: MovementStatus, name: string }[]>([
    { id: 'Pendiente', name: 'Pendiente' },
    { id: 'Procesado', name: 'Procesado' },
    { id: 'Anulado', name: 'Anulado' },
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
  
  filteredWarehouses = computed(() => {
    const companyId = this.selectedCompanyId();
    if (!companyId) return [];
    return this.allWarehouses().filter(w => w.companyId === companyId);
  });
  
  filteredProviders = computed(() => {
      const companyId = this.selectedCompanyId();
      if (!companyId) return [];
      return this.allProviders().filter(p => p.companyId === companyId);
  });

  reportForm = this.fb.group({
    empresaId: [null as number | null, Validators.required],
    tipoMovimiento: [null as MovementType | null],
    estado: [null as MovementStatus | null],
    bodegaOrigenId: [null as number | null],
    bodegaDestinoId: [{ value: null as number | null, disabled: true }],
    proveedorId: [{ value: null as number | null, disabled: true }],
    correlativoDesde: [null as number | null],
    correlativoHasta: [null as number | null],
    fechaDesde: [''],
    fechaHasta: [''],
  });

  ngOnInit() {
    this.reportForm.get('empresaId')?.valueChanges.subscribe(companyId => {
      this.selectedCompanyId.set(companyId ? Number(companyId) : null);
      this.reportForm.patchValue({
        correlativoDesde: null,
        correlativoHasta: null,
        bodegaOrigenId: null,
        bodegaDestinoId: null,
        proveedorId: null,
      });
    });

    this.reportForm.get('tipoMovimiento')?.valueChanges.subscribe(type => {
        const proveedorCtrl = this.reportForm.get('proveedorId');
        const bodegaDestinoCtrl = this.reportForm.get('bodegaDestinoId');

        if (type === 'Ingreso') {
            proveedorCtrl?.enable();
        } else {
            proveedorCtrl?.disable();
            proveedorCtrl?.reset();
        }

        if (type === 'Traspaso') {
            bodegaDestinoCtrl?.enable();
        } else {
            bodegaDestinoCtrl?.disable();
            bodegaDestinoCtrl?.reset();
        }
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
