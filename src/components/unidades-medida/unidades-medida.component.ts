import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface UnidadMedida {
  code: number;
  name: string;
  abbreviation: string;
  isActive: boolean;
}

@Component({
  selector: 'app-unidades-medida',
  templateUrl: './unidades-medida.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class UnidadesMedidaComponent {
  private fb = inject(FormBuilder);

  items = signal<UnidadMedida[]>([
    { code: 1, name: 'Unidad', abbreviation: 'UN', isActive: true },
    { code: 2, name: 'Kilo', abbreviation: 'KG', isActive: true },
    { code: 3, name: 'Litro', abbreviation: 'LT', isActive: false },
    { code: 4, name: 'Saco', abbreviation: 'SA', isActive: true },
  ]);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<UnidadMedida | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  sortColumn = signal<keyof UnidadMedida>('code');
  sortDirection = signal<'asc' | 'desc'>('asc');

  isDeleteModalOpen = signal(false);
  itemToDelete = signal<UnidadMedida | null>(null);

  sortedItems = computed(() => {
    const list = this.items();
    const column = this.sortColumn();
    const direction = this.sortDirection();
    return [...list].sort((a, b) => {
      const aValue = a[column], bValue = b[column];
      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') comparison = aValue - bValue;
      else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') comparison = aValue === bValue ? 0 : aValue ? -1 : 1;
      else comparison = String(aValue).localeCompare(String(bValue));
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  itemForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    name: ['', Validators.required],
    abbreviation: ['', Validators.required]
  });

  openNewPanel(): void {
    this.formMode.set('new');
    this.itemForm.reset();
    this.itemForm.get('code')?.enable();
    this.itemForm.get('code')?.setValidators([Validators.required, Validators.pattern('^[0-9]+$'), this.codeExistsValidator.bind(this)]);
    this.itemForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: UnidadMedida): void {
    this.formMode.set('edit');
    this.itemForm.reset();
    this.itemForm.patchValue(item);
    this.itemForm.get('code')?.disable();
    this.itemForm.get('code')?.clearValidators();
    this.itemForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveItem(): void {
    if (this.itemForm.invalid) return;
    const formValue = this.itemForm.getRawValue();
    if (this.formMode() === 'new') {
      const newItem: UnidadMedida = { code: Number(formValue.code), name: formValue.name!, abbreviation: formValue.abbreviation!, isActive: true };
      this.items.update(items => [...items, newItem]);
    } else {
      this.items.update(items => items.map(item => item.code === formValue.code ? { ...item, name: formValue.name!, abbreviation: formValue.abbreviation! } : item));
    }
    this.closePanel();
  }

  openVigenciaModal(item: UnidadMedida): void {
    this.itemToToggleVigencia.set(item);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const itemToToggle = this.itemToToggleVigencia();
    if (itemToToggle) {
      this.items.update(items => items.map(item => item.code === itemToToggle.code ? { ...item, isActive: !item.isActive } : item));
    }
    this.closeConfirmModal();
  }

  openDeleteModal(item: UnidadMedida): void {
    this.itemToDelete.set(item);
    this.isDeleteModalOpen.set(true);
  }

  confirmDeleteItem(): void {
    const itemToDelete = this.itemToDelete();
    if (itemToDelete) {
      this.items.update(items => items.filter(item => item.code !== itemToDelete.code));
    }
    this.closeDeleteModal();
  }

  closePanel = () => this.isPanelOpen.set(false);
  closeConfirmModal = () => { this.isConfirmModalOpen.set(false); this.itemToToggleVigencia.set(null); };
  closeDeleteModal = () => { this.isDeleteModalOpen.set(false); this.itemToDelete.set(null); };
  
  onSort(column: keyof UnidadMedida): void {
    if (this.sortColumn() === column) this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    else { this.sortColumn.set(column); this.sortDirection.set('asc'); }
  }

  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    return this.items().some(item => item.code === Number(control.value)) ? { codeExists: true } : null;
  }

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Reporte de Unidades de Medida', 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [['Código', 'Nombre', 'Abreviatura', 'Vigencia']],
      body: this.sortedItems().map(item => [item.code, item.name, item.abbreviation, item.isActive ? 'Vigente' : 'No Vigente']),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
    });
    doc.save('Reporte_Unidades_Medida.pdf');
  }
}
