import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface ResponsibilityCenter {
  code: number;
  description: string;
  isActive: boolean;
}

@Component({
  selector: 'app-responsibility-center',
  templateUrl: './responsibility-center.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class ResponsibilityCenterComponent {
  private fb = inject(FormBuilder);

  responsibilityCenters = signal<ResponsibilityCenter[]>([
    { code: 1, description: 'Administración Central', isActive: true },
    { code: 2, description: 'Operaciones Fundo El Roble', isActive: true },
    { code: 3, description: 'Logística y Transporte', isActive: false },
    { code: 4, description: 'Comercialización Nacional', isActive: true },
  ]);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<ResponsibilityCenter | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  sortColumn = signal<keyof ResponsibilityCenter>('code');
  sortDirection = signal<'asc' | 'desc'>('asc');

  sortedResponsibilityCenters = computed(() => {
    const list = this.responsibilityCenters();
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

  responsibilityCenterForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    description: ['', Validators.required],
  });

  openNewPanel(): void {
    this.formMode.set('new');
    this.responsibilityCenterForm.reset();
    this.responsibilityCenterForm.get('code')?.enable();
    this.responsibilityCenterForm.get('code')?.setValidators([
      Validators.required, 
      Validators.pattern(/^[0-9]+$/),
      this.codeExistsValidator.bind(this)
    ]);
    this.responsibilityCenterForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: ResponsibilityCenter): void {
    this.formMode.set('edit');
    this.responsibilityCenterForm.reset();
    this.responsibilityCenterForm.patchValue(item);
    this.responsibilityCenterForm.get('code')?.disable();
    this.responsibilityCenterForm.get('code')?.clearValidators();
    this.responsibilityCenterForm.get('code')?.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveItem(): void {
    if (this.responsibilityCenterForm.invalid) {
      return;
    }

    const formValue = this.responsibilityCenterForm.getRawValue();

    if (this.formMode() === 'new') {
      const newItem: ResponsibilityCenter = {
        code: Number(formValue.code),
        description: formValue.description || '',
        isActive: true
      };
      this.responsibilityCenters.update(items => [...items, newItem]);
    } else {
      this.responsibilityCenters.update(items => 
        items.map(item => 
          item.code === formValue.code ? { 
            ...item, 
            description: formValue.description || '',
          } : item
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(item: ResponsibilityCenter): void {
    this.itemToToggleVigencia.set(item);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const itemToToggle = this.itemToToggleVigencia();
    if (itemToToggle) {
      this.responsibilityCenters.update(items => 
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
  
  onSort(column: keyof ResponsibilityCenter): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.responsibilityCenters().some(item => item.code === code);
    return codeExists ? { codeExists: true } : null;
  }

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['Código', 'Descripción', 'Vigencia']];
    const body = this.sortedResponsibilityCenters().map(item => [
      item.code,
      item.description,
      item.isActive ? 'Vigente' : 'No Vigente'
    ]);

    doc.setFontSize(18);
    doc.text('Reporte de Centros de Responsabilidad', 14, 22);

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

    doc.save('Reporte_Centros_Responsabilidad.pdf');
  }
}
