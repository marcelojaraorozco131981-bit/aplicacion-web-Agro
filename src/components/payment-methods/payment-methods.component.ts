import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface PaymentMethod {
  code: number;
  description: string;
  paymentMethodCode: number;
  isActive: boolean;
}

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class PaymentMethodsComponent {
  private fb = inject(FormBuilder);

  paymentMethods = signal<PaymentMethod[]>([
    { code: 1, description: 'Transferencia Electrónica', paymentMethodCode: 101, isActive: true },
    { code: 2, description: 'Cheque', paymentMethodCode: 102, isActive: true },
    { code: 3, description: 'Vale Vista', paymentMethodCode: 103, isActive: false },
    { code: 4, description: 'Efectivo', paymentMethodCode: 104, isActive: true },
  ]);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<PaymentMethod | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  sortColumn = signal<keyof PaymentMethod>('code');
  sortDirection = signal<'asc' | 'desc'>('asc');

  sortedPaymentMethods = computed(() => {
    const list = this.paymentMethods();
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

  paymentMethodForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    description: ['', Validators.required],
    paymentMethodCode: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
  });

  openNewPanel(): void {
    this.formMode.set('new');
    this.paymentMethodForm.reset();
    this.paymentMethodForm.get('code')?.enable();
    this.paymentMethodForm.get('code')?.setValidators([
      Validators.required, 
      Validators.pattern('^[0-9]+$'),
      this.codeExistsValidator.bind(this)
    ]);
    this.paymentMethodForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: PaymentMethod): void {
    this.formMode.set('edit');
    this.paymentMethodForm.reset();
    this.paymentMethodForm.patchValue(item);
    this.paymentMethodForm.get('code')?.disable();
    this.paymentMethodForm.get('code')?.clearValidators();
    this.paymentMethodForm.get('code')?.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  savePaymentMethod(): void {
    if (this.paymentMethodForm.invalid) {
      return;
    }

    const formValue = this.paymentMethodForm.getRawValue();

    if (this.formMode() === 'new') {
      const newItem: PaymentMethod = {
        code: Number(formValue.code),
        description: formValue.description || '',
        paymentMethodCode: Number(formValue.paymentMethodCode),
        isActive: true
      };
      this.paymentMethods.update(items => [...items, newItem]);
    } else {
      this.paymentMethods.update(items => 
        items.map(item => 
          item.code === formValue.code ? { 
            ...item, 
            description: formValue.description || '',
            paymentMethodCode: Number(formValue.paymentMethodCode),
          } : item
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(item: PaymentMethod): void {
    this.itemToToggleVigencia.set(item);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const itemToToggle = this.itemToToggleVigencia();
    if (itemToToggle) {
      this.paymentMethods.update(items => 
        items.map(item => 
          item.code === itemToToggle.code ? { ...item, isActive: !item.isActive } : item
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
  
  onSort(column: keyof PaymentMethod): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.paymentMethods().some(item => item.code === code);
    return codeExists ? { codeExists: true } : null;
  }

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['Código', 'Descripción', 'Cód. Medio Pago', 'Vigencia']];
    const body = this.sortedPaymentMethods().map(item => [
      item.code,
      item.description,
      item.paymentMethodCode,
      item.isActive ? 'Vigente' : 'No Vigente'
    ]);

    doc.setFontSize(18);
    doc.text('Reporte de Medios de Pago', 14, 22);

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

    doc.save('Reporte_Medios_Pago.pdf');
  }
}
