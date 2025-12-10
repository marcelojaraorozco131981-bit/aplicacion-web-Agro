import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface ControlUnit {
  code: number;
  description: string;
  productionControl: 'fija' | 'variable' | 'sin_control';
  unitType: 'total_hectareas' | 'plantas_adultas' | 'plantas_formacion' | 'total_plantas' | 'n_hileras';
  isActive: boolean;
}

@Component({
  selector: 'app-control-units',
  templateUrl: './control-units.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ControlUnitsComponent {
  private fb = inject(FormBuilder);

  controlUnits = signal<ControlUnit[]>([
    { code: 1, description: 'Caja Cosecha Manzanas', productionControl: 'variable', unitType: 'total_plantas', isActive: true },
    { code: 2, description: 'Hectárea Riego', productionControl: 'fija', unitType: 'total_hectareas', isActive: true },
    { code: 3, description: 'Jornal Limpieza', productionControl: 'sin_control', unitType: 'total_plantas', isActive: false },
    { code: 4, description: 'Hilera Aplicación', productionControl: 'fija', unitType: 'n_hileras', isActive: true },
  ]);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<ControlUnit | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  sortColumn = signal<keyof ControlUnit>('code');
  sortDirection = signal<'asc' | 'desc'>('asc');

  sortedControlUnits = computed(() => {
    const list = this.controlUnits();
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

  controlUnitForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    description: ['', Validators.required],
    productionControl: [null as ControlUnit['productionControl'] | null, Validators.required],
    unitType: [null as ControlUnit['unitType'] | null, Validators.required],
  });
  
  // For template display
  productionControlLabels: Record<ControlUnit['productionControl'], string> = {
    fija: 'Prod. Fija',
    variable: 'Prod. Variable',
    sin_control: 'Sin Control'
  };

  unitTypeLabels: Record<ControlUnit['unitType'], string> = {
    total_hectareas: 'Total Hectáreas',
    plantas_adultas: 'Plantas Adultas',
    plantas_formacion: 'Plantas en Formación',
    total_plantas: 'Total Plantas',
    n_hileras: 'N° Hileras'
  };


  openNewPanel(): void {
    this.formMode.set('new');
    this.controlUnitForm.reset();
    this.controlUnitForm.get('code')?.enable();
    this.controlUnitForm.get('code')?.setValidators([
      Validators.required, 
      Validators.pattern(/^[0-9]+$/),
      this.codeExistsValidator.bind(this)
    ]);
    this.controlUnitForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: ControlUnit): void {
    this.formMode.set('edit');
    this.controlUnitForm.reset();
    this.controlUnitForm.patchValue(item);
    this.controlUnitForm.get('code')?.disable();
    this.controlUnitForm.get('code')?.clearValidators();
    this.controlUnitForm.get('code')?.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveControlUnit(): void {
    if (this.controlUnitForm.invalid) {
      return;
    }

    const formValue = this.controlUnitForm.getRawValue();

    if (this.formMode() === 'new') {
      const newItem: ControlUnit = {
        code: Number(formValue.code),
        description: formValue.description || '',
        productionControl: formValue.productionControl!,
        unitType: formValue.unitType!,
        isActive: true
      };
      this.controlUnits.update(items => [...items, newItem]);
    } else {
      this.controlUnits.update(items => 
        items.map(item => 
          item.code === formValue.code ? { 
            ...item, 
            description: formValue.description || '',
            productionControl: formValue.productionControl!,
            unitType: formValue.unitType!,
          } : item
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(item: ControlUnit): void {
    this.itemToToggleVigencia.set(item);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const itemToToggle = this.itemToToggleVigencia();
    if (itemToToggle) {
      this.controlUnits.update(items => 
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
  
  onSort(column: keyof ControlUnit): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.controlUnits().some(item => item.code === code);
    return codeExists ? { codeExists: true } : null;
  }

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['Código', 'Descripción', 'Control Prod.', 'Tipo Unidad', 'Vigencia']];
    const body = this.sortedControlUnits().map(item => [
      item.code,
      item.description,
      this.productionControlLabels[item.productionControl],
      this.unitTypeLabels[item.unitType],
      item.isActive ? 'Vigente' : 'No Vigente'
    ]);

    doc.setFontSize(18);
    doc.text('Reporte de Unidades de Control', 14, 22);

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

    doc.save('Reporte_Unidades_Control.pdf');
  }
}
