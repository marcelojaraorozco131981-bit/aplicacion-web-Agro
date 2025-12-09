import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface Afp {
  afpCode: number;
  previredCode: number;
  description: string;
  commission: number;
  accountingAux: number;
  retirementCommission: number;
  isActive: boolean;
}

@Component({
  selector: 'app-afp',
  templateUrl: './afp.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AfpComponent {
  private fb = inject(FormBuilder);

  afps = signal<Afp[]>([
    { afpCode: 1, previredCode: 30, description: 'CAPITAL', commission: 1.44, accountingAux: 2105001, retirementCommission: 0.0, isActive: true },
    { afpCode: 2, previredCode: 33, description: 'CUPRUM', commission: 1.44, accountingAux: 2105002, retirementCommission: 0.0, isActive: true },
    { afpCode: 3, previredCode: 35, description: 'HABITAT', commission: 1.27, accountingAux: 2105003, retirementCommission: 0.0, isActive: false },
    { afpCode: 4, previredCode: 38, description: 'MODELO', commission: 0.58, accountingAux: 2105004, retirementCommission: 0.0, isActive: true },
  ]);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  afpToToggleVigencia = signal<Afp | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  sortColumn = signal<keyof Afp>('afpCode');
  sortDirection = signal<'asc' | 'desc'>('asc');

  sortedAfps = computed(() => {
    const afpsList = this.afps();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return [...afpsList].sort((a, b) => {
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

  afpForm = this.fb.group({
    afpCode: [0, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    previredCode: [0, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    description: ['', Validators.required],
    commission: [0, [Validators.required, Validators.min(0)]],
    accountingAux: [0, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    retirementCommission: [0, [Validators.required, Validators.min(0)]],
  });

  openNewPanel(): void {
    this.formMode.set('new');
    this.afpForm.reset();
    this.afpForm.get('afpCode')?.enable();
    this.afpForm.get('afpCode')?.setValidators([
      Validators.required, 
      Validators.pattern(/^[0-9]+$/),
      this.codeExistsValidator.bind(this)
    ]);
    this.afpForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(afp: Afp): void {
    this.formMode.set('edit');
    this.afpForm.reset();
    this.afpForm.patchValue(afp);
    this.afpForm.get('afpCode')?.disable();
    this.afpForm.get('afpCode')?.clearValidators();
    this.afpForm.get('afpCode')?.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveAfp(): void {
    if (this.afpForm.invalid) {
      return;
    }

    const formValue = this.afpForm.getRawValue();

    if (this.formMode() === 'new') {
      const newAfp: Afp = {
        afpCode: Number(formValue.afpCode),
        previredCode: Number(formValue.previredCode),
        description: formValue.description || '',
        commission: Number(formValue.commission),
        accountingAux: Number(formValue.accountingAux),
        retirementCommission: Number(formValue.retirementCommission),
        isActive: true
      };
      this.afps.update(afps => [...afps, newAfp]);
    } else {
      this.afps.update(afps => 
        afps.map(a => 
          a.afpCode === formValue.afpCode ? { 
            ...a, 
            previredCode: Number(formValue.previredCode),
            description: formValue.description || '',
            commission: Number(formValue.commission),
            accountingAux: Number(formValue.accountingAux),
            retirementCommission: Number(formValue.retirementCommission),
          } : a
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(afp: Afp): void {
    this.afpToToggleVigencia.set(afp);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const afpToToggle = this.afpToToggleVigencia();
    if (afpToToggle) {
      this.afps.update(afps => 
        afps.map(a => 
          a.afpCode === afpToToggle.afpCode ? { ...a, isActive: !a.isActive } : a
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
    this.afpToToggleVigencia.set(null);
  }
  
  onSort(column: keyof Afp): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.afps().some(a => a.afpCode === code);
    return codeExists ? { codeExists: true } : null;
  }

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['Cód. AFP', 'Cód. Previred', 'Descripción', 'Comisión %', 'Aux. Contable', 'Com. Jub. %', 'Vigencia']];
    const body = this.sortedAfps().map(a => [
      a.afpCode,
      a.previredCode,
      a.description,
      `${a.commission}%`,
      a.accountingAux,
      `${a.retirementCommission}%`,
      a.isActive ? 'Vigente' : 'No Vigente'
    ]);

    doc.setFontSize(18);
    doc.text('Reporte de AFP', 14, 22);

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

    doc.save('Reporte_AFP.pdf');
  }
}
