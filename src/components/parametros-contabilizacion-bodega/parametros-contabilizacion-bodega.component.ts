import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-parametros-contabilizacion-bodega',
  templateUrl: './parametros-contabilizacion-bodega.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ParametrosContabilizacionBodegaComponent {
  private fb = inject(FormBuilder);

  isSaving = signal(false);
  saveSuccess = signal(false);

  paramsForm = this.fb.group({
    cuentaExistencias: ['1106001', [Validators.required, Validators.pattern('^[0-9]+$')]],
    cuentaCostoVenta: ['6101001', [Validators.required, Validators.pattern('^[0-9]+$')]],
    cuentaConsumoInterno: ['6201001', [Validators.required, Validators.pattern('^[0-9]+$')]],
    utilizaCentroCosto: [true, Validators.required]
  });

  saveChanges(): void {
    if (this.paramsForm.invalid) {
      this.paramsForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.saveSuccess.set(false);
    console.log('Guardando parámetros contables de bodega:', this.paramsForm.value);

    // Simulate API call
    setTimeout(() => {
      this.isSaving.set(false);
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 2000);
      this.paramsForm.markAsPristine();
    }, 1500);
  }
}
