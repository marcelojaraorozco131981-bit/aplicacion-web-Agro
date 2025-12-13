import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface ProvidentFund {
  institutionCode: number;
  description: string;
  rate: number;
  accountingAux: number;
  isActive: boolean;
}

@Component({
  selector: 'app-provident-funds',
  templateUrl: './provident-funds.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class ProvidentFundsComponent {
  private fb = inject(FormBuilder);

  providentFunds = signal<ProvidentFund[]>([
    { institutionCode: 1, description: 'Caja de Comp. Los Andes', rate: 0.6, accountingAux: 2105010, isActive: true },
    { institutionCode: 2, description: 'Caja de Comp. La Araucana', rate: 0.6, accountingAux: 2105011, isActive: true },
    { institutionCode: 3, description: 'Caja de Comp. 18 de Sept.', rate: 0.6, accountingAux: 2105012, isActive: false },
    { institutionCode: 4, description: 'Caja de Comp. Gabriela Mistral', rate: 0.6, accountingAux: 2105013, isActive: true },
  ]);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<ProvidentFund | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  sortColumn = signal<keyof ProvidentFund>('institutionCode');
  sortDirection = signal<'asc' | 'desc'>('asc');

  sortedProvidentFunds = computed(() => {
    const list = this.providentFunds();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return [...list].sort((a, b) => {
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

  providentFundForm = this.fb.group({
    institutionCode: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    description: ['', Validators.required],
    rate: [0, [Validators.required, Validators.min(0)]],
    accountingAux: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
  });

  openNewPanel(): void {
    this.formMode.set('new');
    this.providentFundForm.reset();
    this.providentFundForm.get('institutionCode')?.enable();
    this.providentFundForm.get('institutionCode')?.setValidators([
      Validators.required, 
      Validators.pattern('^[0-9]+$'),
      this.codeExistsValidator.bind(this)
    ]);
    this.providentFundForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: ProvidentFund): void {
    this.formMode.set('edit');
    this.providentFundForm.reset();
    this.providentFundForm.patchValue(item);
    this.providentFundForm.get('institutionCode')?.disable();
    this.providentFundForm.get('institutionCode')?.clearValidators();
    this.providentFundForm.get('institutionCode')?.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveProvidentFund(): void {
    if (this.providentFundForm.invalid) {
      return;
    }

    const formValue = this.providentFundForm.getRawValue();

    if (this.formMode() === 'new') {
      const newItem: ProvidentFund = {
        institutionCode: Number(formValue.institutionCode),
        description: formValue.description || '',
        rate: Number(formValue.rate),
        accountingAux: Number(formValue.accountingAux),
        isActive: true
      };
      this.providentFunds.update(items => [...items, newItem]);
    } else {
      this.providentFunds.update(items => 
        items.map(item => 
          item.institutionCode === formValue.institutionCode ? { 
            ...item, 
            description: formValue.description || '',
            rate: Number(formValue.rate),
            accountingAux: Number(formValue.accountingAux),
          } : item
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(item: ProvidentFund): void {
    this.itemToToggleVigencia.set(item);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const itemToToggle = this.itemToToggleVigencia();
    if (itemToToggle) {
      this.providentFunds.update(items => 
        items.map(item => 
          item.institutionCode === itemToToggle.institutionCode ? { ...item, isActive: !item.isActive } : item
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
    this.itemToToggleVigencia.set(null);
  }
  
  onSort(column: keyof ProvidentFund): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.providentFunds().some(item => item.institutionCode === code);
    return codeExists ? { codeExists: true } : null;
  }

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['Cód. Institución', 'Descripción', 'Tasa (%)', 'Aux. Contable', 'Vigencia']];
    const body = this.sortedProvidentFunds().map(item => [
      item.institutionCode,
      item.description,
      `${item.rate}%`,
      item.accountingAux,
      item.isActive ? 'Vigente' : 'No Vigente'
    ]);

    doc.setFontSize(18);
    doc.text('Reporte de Cajas de Previsión', 14, 22);

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

    doc.save('Reporte_Cajas_Prevision.pdf');
  }
}
