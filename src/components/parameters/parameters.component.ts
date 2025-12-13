import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ParametersComponent {
  private fb = inject(FormBuilder);

  parametersForm = this.fb.group({
    companyName: ['AgroSys S.A.', Validators.required],
    currentSeason: ['2024-2025', Validators.required],
    defaultCurrency: ['CLP', Validators.required],
    timezone: ['UTC-4', Validators.required]
  });

  saveChanges(): void {
    if (this.parametersForm.invalid) {
      this.parametersForm.markAllAsTouched();
      console.error('Formulario de parámetros generales inválido');
      return;
    }
    console.log('Guardando parámetros generales:', this.parametersForm.value);
    // Aquí iría la lógica para guardar los datos en un servicio
  }
}
