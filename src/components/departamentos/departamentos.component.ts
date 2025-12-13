import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Interfaces
interface Company {
  id: number;
  name: string;
}

interface Departamento {
  companyId: number;
  code: number;
  description: string;
  isActive: boolean;
}

@Component({
  selector: 'app-departamentos',
  templateUrl: './departamentos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class DepartamentosComponent {
  private fb = inject(FormBuilder);

  // --- Master Data (simulated) ---
  companies = signal<Company[]>([
    { id: 1, name: 'Agrícola San José' },
    { id: 2, name: 'Exportadora del Valle' }
  ]);
  
  allDepartments = signal<Departamento[]>([
    { companyId: 1, code: 10, description: 'Administración', isActive: true },
    { companyId: 1, code: 20, description: 'Operaciones Campo', isActive: true },
    { companyId: 2, code: 15, description: 'Comercial Exportación', isActive: true },
    { companyId: 1, code: 30, description: 'Bodega Insumos', isActive: false },
  ]);

  // --- State Signals ---
  selectedCompanyId = signal<number | null>(null);
  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<Departamento | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  sortColumn = signal<keyof Departamento>('code');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // --- Computed Signals ---
  selectedCompanyName = computed(() => {
    const companyId = this.selectedCompanyId();
    if (!companyId) return '';
    return this.companies().find(c => c.id === companyId)?.name || '';
  });

  filteredDepartments = computed(() => {
    const companyId = this.selectedCompanyId();
    if (!companyId) return [];
    return this.allDepartments().filter(d => d.companyId === companyId);
  });

  sortedDepartments = computed(() => {
    const list = this.filteredDepartments();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return [...list].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') comparison = aValue - bValue;
      else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') comparison = aValue === bValue ? 0 : aValue ? -1 : 1;
      else comparison = String(aValue).localeCompare(String(bValue));
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  // --- Form ---
  departmentForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    description: ['', Validators.required],
  });

  // --- Methods ---
  onCompanyChange(event: Event): void {
    const selectedId = (event.target as HTMLSelectElement).value;
    this.selectedCompanyId.set(selectedId ? Number(selectedId) : null);
  }

  openNewPanel(): void {
    this.formMode.set('new');
    this.departmentForm.reset();
    this.departmentForm.get('code')?.enable();
    this.departmentForm.get('code')?.setValidators([
      Validators.required, 
      Validators.pattern('^[0-9]+$'),
      this.codeExistsValidator.bind(this)
    ]);
    this.departmentForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: Departamento): void {
    this.formMode.set('edit');
    this.departmentForm.reset();
    this.departmentForm.patchValue(item);
    this.departmentForm.get('code')?.disable();
    this.departmentForm.get('code')?.clearValidators();
    this.departmentForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveDepartment(): void {
    if (this.departmentForm.invalid || !this.selectedCompanyId()) {
      return;
    }

    const formValue = this.departmentForm.getRawValue();
    const companyId = this.selectedCompanyId()!;

    if (this.formMode() === 'new') {
      const newItem: Departamento = {
        companyId: companyId,
        code: Number(formValue.code),
        description: formValue.description || '',
        isActive: true
      };
      this.allDepartments.update(items => [...items, newItem]);
    } else {
      this.allDepartments.update(items => 
        items.map(item => 
          item.code === formValue.code && item.companyId === companyId 
          ? { ...item, description: formValue.description || '' } 
          : item
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(item: Departamento): void {
    this.itemToToggleVigencia.set(item);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const itemToToggle = this.itemToToggleVigencia();
    if (itemToToggle) {
      this.allDepartments.update(items => 
        items.map(item => 
          item.code === itemToToggle.code && item.companyId === itemToToggle.companyId
          ? { ...item, isActive: !item.isActive } 
          : item
        )
      );
      this.closeConfirmModal();
    }
  }

  closePanel = () => this.isPanelOpen.set(false);
  closeConfirmModal = () => { this.isConfirmModalOpen.set(false); this.itemToToggleVigencia.set(null); };
  
  onSort(column: keyof Departamento): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.filteredDepartments().some(d => d.code === code);
    return codeExists ? { codeExists: true } : null;
  }

  async exportToPdf(): Promise<void> {
    if (!this.selectedCompanyId()) return;

    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['Código', 'Descripción', 'Vigencia']];
    const body = this.sortedDepartments().map(d => [
        d.code, 
        d.description, 
        d.isActive ? 'Vigente' : 'No Vigente'
    ]);

    doc.setFontSize(18);
    doc.text(`Reporte de Departamentos - ${this.selectedCompanyName()}`, 14, 22);

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

    doc.save(`Reporte_Departamentos_${this.selectedCompanyName().replace(' ', '_')}.pdf`);
  }
}
