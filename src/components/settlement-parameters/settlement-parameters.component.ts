import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

// Simplified interfaces for dropdown data
interface Afp {
  afpCode: number;
  description: string;
}

interface HealthSystem {
  healthCode: number;
  description: string;
}

@Component({
  selector: 'app-settlement-parameters',
  templateUrl: './settlement-parameters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class SettlementParametersComponent implements OnInit {
  private fb = inject(FormBuilder);

  isSaving = signal(false);
  saveSuccess = signal(false);

  // --- Master Data for Dropdowns (simulated) ---
  afps = signal<Afp[]>([
    { afpCode: 1, description: 'CAPITAL' },
    { afpCode: 2, description: 'CUPRUM' },
    { afpCode: 3, description: 'HABITAT' },
    { afpCode: 4, description: 'MODELO' },
  ]);

  healthSystems = signal<HealthSystem[]>([
    { healthCode: 1, description: 'FONASA' },
    { healthCode: 2, description: 'CONSALUD' },
    { healthCode: 3, description: 'CRUZBLANCA' },
    { healthCode: 4, description: 'BANMEDICA' },
  ]);

  // --- Form Definition ---
  paramsForm = this.fb.group({
    sueldoMinimo: [460000, [Validators.required, Validators.min(0)]],
    ufMesAnterior: [37482.89, [Validators.required, Validators.min(0)]],
    ufMesActual: [37522.57, [Validators.required, Validators.min(0)]],
    ufMesSiguiente: [37540.10, [Validators.required, Validators.min(0)]],
    
    ufImposiciones: [81.6, [Validators.required, Validators.min(0)]],
    ufImpoRegAntiguo: [60.0, [Validators.required, Validators.min(0)]],
    ufTopeSeguroCesantia: [122.6, [Validators.required, Validators.min(0)]],
    
    tramo1: [18473, [Validators.required, Validators.min(0)]],
    tramo2: [11352, [Validators.required, Validators.min(0)]],
    tramo3: [3586, [Validators.required, Validators.min(0)]],
    tramo4: [0, [Validators.required, Validators.min(0)]],

    porcFondoPension: [10.0, [Validators.required, Validators.min(0), Validators.max(100)]],
    porcPrestacionSalud: [7.0, [Validators.required, Validators.min(0), Validators.max(100)]],
    porcSis: [1.49, [Validators.required, Validators.min(0), Validators.max(100)]],
    porcAfpCapIndividual: [10.0, [Validators.required, Validators.min(0), Validators.max(100)]],
    porcSegSocialExpectativaVida: [1.99, [Validators.required, Validators.min(0), Validators.max(100)]],
    porcSegSocialRentabilidadProtegida: [1.15, [Validators.required, Validators.min(0), Validators.max(100)]],

    factorHeDiaria: [0.0077777, [Validators.required, Validators.min(0)]],
    factorHeMensual: [1.5, [Validators.required, Validators.min(0)]],
    codigoAfp: [null as number | null, Validators.required],
    codigoFonasa: [null as number | null, Validators.required]
  });

  ngOnInit() {
    // Set default FONASA code
    const fonasa = this.healthSystems().find(h => h.description.toUpperCase() === 'FONASA');
    if (fonasa) {
      this.paramsForm.patchValue({ codigoFonasa: fonasa.healthCode });
    }
  }

  saveChanges(): void {
    if (this.paramsForm.invalid) {
      this.paramsForm.markAllAsTouched();
      console.error('Formulario inválido');
      return;
    }

    this.isSaving.set(true);
    this.saveSuccess.set(false);
    console.log('Guardando cambios:', this.paramsForm.value);

    // Simulate API call
    setTimeout(() => {
      this.isSaving.set(false);
      this.saveSuccess.set(true);
      // Reset after a short delay
      setTimeout(() => this.saveSuccess.set(false), 2000);
    }, 1500);
  }
}
