import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface Labor {
  code: number;
  description: string;
  valoriza: boolean;
  productiva: boolean;
  isActive: boolean;
}

@Component({
  selector: 'app-labor',
  templateUrl: './labor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LaborComponent {
  private fb = inject(FormBuilder);

  labores = signal<Labor[]>([
    { code: 1, description: 'Poda de Formación', valoriza: true, productiva: false, isActive: true },
    { code: 2, description: 'Raleo de Frutos', valoriza: true, productiva: true, isActive: true },
    { code: 3, description: 'Limpieza de Canales', valoriza: false, productiva: false, isActive: false },
    { code: 4, description: 'Cosecha Manual', valoriza: true, productiva: true, isActive: true },
  ]);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<Labor | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  sortColumn = signal<keyof Labor>('code');
  sortDirection = signal<'asc' | 'desc'>('asc');

  sortedLabores = computed(() => {
    const list = this.labores();
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

  laborForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    description: ['', Validators.required],
    valoriza: [null as boolean | null, Validators.required],
    productiva: [null as boolean | null, Validators.required],
  });

  openNewPanel(): void {
    this.formMode.set('new');
    this.laborForm.reset();
    this.laborForm.get('code')?.enable();
    this.laborForm.get('code')?.setValidators([
      Validators.required, 
      Validators.pattern('^[0-9]+$'),
      this.codeExistsValidator.bind(this)
    ]);
    this.laborForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: Labor): void {
    this.formMode.set('edit');
    this.laborForm.reset();
    this.laborForm.patchValue(item);
    this.laborForm.get('code')?.disable();
    this.laborForm.get('code')?.clearValidators();
    this.laborForm.get('code')?.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveLabor(): void {
    if (this.laborForm.invalid) {
      return;
    }

    const formValue = this.laborForm.getRawValue();

    if (this.formMode() === 'new') {
      const newItem: Labor = {
        code: Number(formValue.code),
        description: formValue.description || '',
        valoriza: formValue.valoriza === true,
        productiva: formValue.productiva === true,
        isActive: true
      };
      this.labores.update(items => [...items, newItem]);
    } else {
      this.labores.update(items => 
        items.map(item => 
          item.code === formValue.code ? { 
            ...item, 
            description: formValue.description || '',
            valoriza: formValue.valoriza === true,
            productiva: formValue.productiva === true,
          } : item
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(item: Labor): void {
    this.itemToToggleVigencia.set(item);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const itemToToggle = this.itemToToggleVigencia();
    if (itemToToggle) {
      this.labores.update(items => 
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
  
  onSort(column: keyof Labor): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.labores().some(item => item.code === code);
    return codeExists ? { codeExists: true } : null;
  }

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['Código', 'Descripción', 'Valoriza', 'Productiva', 'Vigencia']];
    const body = this.sortedLabores().map(item => [
      item.code,
      item.description,
      item.valoriza ? 'Sí' : 'No',
      item.productiva ? 'Sí' : 'No',
      item.isActive ? 'Vigente' : 'No Vigente'
    ]);

    doc.setFontSize(18);
    doc.text('Reporte de Labores', 14, 22);

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

    doc.save('Reporte_Labores.pdf');
  }
}
