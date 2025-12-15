import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface IngredienteActivo {
  code: number;
  name: string;
  isActive: boolean;
}

@Component({
  selector: 'app-ingredientes-activos',
  templateUrl: './ingredientes-activos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class IngredientesActivosComponent {
  private fb = inject(FormBuilder);

  items = signal<IngredienteActivo[]>([
    { code: 1, name: 'Glifosato', isActive: true },
    { code: 2, name: 'Mancozeb', isActive: true },
    { code: 3, name: 'Clorpirifos', isActive: false },
  ]);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<IngredienteActivo | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  sortColumn = signal<keyof IngredienteActivo>('code');
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  isDeleteModalOpen = signal(false);
  itemToDelete = signal<IngredienteActivo | null>(null);


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
    name: ['', Validators.required]
  });

  openNewPanel(): void {
    this.formMode.set('new');
    this.itemForm.reset();
    this.itemForm.get('code')?.enable();
    this.itemForm.get('code')?.setValidators([Validators.required, Validators.pattern('^[0-9]+$'), this.codeExistsValidator.bind(this)]);
    this.itemForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: IngredienteActivo): void {
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
      const newItem: IngredienteActivo = { code: Number(formValue.code), name: formValue.name!, isActive: true };
      this.items.update(items => [...items, newItem]);
    } else {
      this.items.update(items => items.map(item => item.code === formValue.code ? { ...item, name: formValue.name! } : item));
    }
    this.closePanel();
  }

  openVigenciaModal(item: IngredienteActivo): void {
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

  openDeleteModal(item: IngredienteActivo): void {
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
  
  onSort(column: keyof IngredienteActivo): void {
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
    doc.text('Reporte de Ingredientes Activos', 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [['Código', 'Nombre', 'Vigencia']],
      body: this.sortedItems().map(item => [item.code, item.name, item.isActive ? 'Vigente' : 'No Vigente']),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
    });
    doc.save('Reporte_Ingredientes_Activos.pdf');
  }
}
