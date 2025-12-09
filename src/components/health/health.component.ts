import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface HealthSystem {
  healthCode: number;
  previredCode: number;
  description: string;
  accountingAux: number;
  isActive: boolean;
}

@Component({
  selector: 'app-health',
  templateUrl: './health.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class HealthComponent {
  private fb = inject(FormBuilder);

  healthSystems = signal<HealthSystem[]>([
    { healthCode: 1, previredCode: 1, description: 'FONASA', accountingAux: 2105005, isActive: true },
    { healthCode: 2, previredCode: 67, description: 'CONSALUD', accountingAux: 2105006, isActive: true },
    { healthCode: 3, previredCode: 99, description: 'CRUZBLANCA', accountingAux: 2105007, isActive: false },
    { healthCode: 4, previredCode: 78, description: 'BANMEDICA', accountingAux: 2105008, isActive: true },
  ]);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  healthSystemToToggleVigencia = signal<HealthSystem | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  sortColumn = signal<keyof HealthSystem>('healthCode');
  sortDirection = signal<'asc' | 'desc'>('asc');

  sortedHealthSystems = computed(() => {
    const healthSystemsList = this.healthSystems();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return [...healthSystemsList].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
      
      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        comparison = aValue === bValue ? 0 : aValue ? -1 : 1;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  });

  healthForm = this.fb.group({
    healthCode: [0, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    previredCode: [0, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    description: ['', Validators.required],
    accountingAux: [0, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
  });

  openNewPanel(): void {
    this.formMode.set('new');
    this.healthForm.reset();
    this.healthForm.get('healthCode')?.enable();
    this.healthForm.get('healthCode')?.setValidators([
      Validators.required, 
      Validators.pattern(/^[0-9]+$/),
      this.codeExistsValidator.bind(this)
    ]);
    this.healthForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(system: HealthSystem): void {
    this.formMode.set('edit');
    this.healthForm.reset();
    this.healthForm.patchValue(system);
    this.healthForm.get('healthCode')?.disable();
    this.healthForm.get('healthCode')?.clearValidators();
    this.healthForm.get('healthCode')?.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveHealthSystem(): void {
    if (this.healthForm.invalid) {
      return;
    }

    const formValue = this.healthForm.getRawValue();

    if (this.formMode() === 'new') {
      const newSystem: HealthSystem = {
        healthCode: Number(formValue.healthCode),
        previredCode: Number(formValue.previredCode),
        description: formValue.description || '',
        accountingAux: Number(formValue.accountingAux),
        isActive: true
      };
      this.healthSystems.update(systems => [...systems, newSystem]);
    } else {
      this.healthSystems.update(systems => 
        systems.map(s => 
          s.healthCode === formValue.healthCode ? { 
            ...s, 
            previredCode: Number(formValue.previredCode),
            description: formValue.description || '',
            accountingAux: Number(formValue.accountingAux),
          } : s
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(system: HealthSystem): void {
    this.healthSystemToToggleVigencia.set(system);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const systemToToggle = this.healthSystemToToggleVigencia();
    if (systemToToggle) {
      this.healthSystems.update(systems => 
        systems.map(s => 
          s.healthCode === systemToToggle.healthCode ? { ...s, isActive: !s.isActive } : s
        )
      );
      this.closeConfirmModal();
    }
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen.set(false);
    this.healthSystemToToggleVigencia.set(null);
  }
  
  onSort(column: keyof HealthSystem): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.healthSystems().some(s => s.healthCode === code);
    return codeExists ? { codeExists: true } : null;
  }

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['Cód. Salud', 'Cód. Previred', 'Descripción', 'Aux. Contable', 'Vigencia']];
    const body = this.sortedHealthSystems().map(s => [
      s.healthCode,
      s.previredCode,
      s.description,
      s.accountingAux,
      s.isActive ? 'Vigente' : 'No Vigente'
    ]);

    doc.setFontSize(18);
    doc.text('Reporte de Sistemas de Salud', 14, 22);

    autoTable(doc, {
      startY: 30,
      head: head,
      body: body,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      const text = `Página ${i} de ${pageCount} | Generado el: ${new Date().toLocaleDateString()}`;
      const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor;
      const textOffset = (doc.internal.pageSize.width - textWidth) / 2;
      doc.text(text, textOffset, doc.internal.pageSize.height - 10);
    }

    doc.save('Reporte_Salud.pdf');
  }
}
