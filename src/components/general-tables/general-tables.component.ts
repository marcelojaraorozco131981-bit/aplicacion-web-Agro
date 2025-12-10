import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Interfaces
interface TableItem {
  itemCode: number;
  description: string;
  isActive: boolean;
}

interface GeneralTable {
  tableCode: number;
  description: string;
  isActive: boolean;
  items: TableItem[];
}

@Component({
  selector: 'app-general-tables',
  templateUrl: './general-tables.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class GeneralTablesComponent {
  private fb = inject(FormBuilder);

  // --- Master (Table) State ---
  tables = signal<GeneralTable[]>([
    { tableCode: 1, description: 'Tipos de Contrato', isActive: true, items: [
        { itemCode: 1, description: 'Plazo Fijo', isActive: true },
        { itemCode: 2, description: 'Indefinido', isActive: true },
        { itemCode: 3, description: 'Por Obra o Faena', isActive: false },
    ] },
    { tableCode: 2, description: 'Nacionalidades', isActive: true, items: [
        { itemCode: 1, description: 'Chilena', isActive: true },
        { itemCode: 2, description: 'Peruana', isActive: true },
        { itemCode: 3, description: 'Venezolana', isActive: true },
    ] },
    { tableCode: 3, description: 'Estados Civiles', isActive: false, items: [] },
  ]);
  selectedTable = signal<GeneralTable | null>(null);
  isTablePanelOpen = signal(false);
  isTableConfirmModalOpen = signal(false);
  tableToToggleVigencia = signal<GeneralTable | null>(null);
  tableFormMode = signal<'new' | 'edit'>('new');
  tableSortColumn = signal<keyof GeneralTable>('tableCode');
  tableSortDirection = signal<'asc' | 'desc'>('asc');

  // --- Detail (Item) State ---
  isItemPanelOpen = signal(false);
  isItemConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<TableItem | null>(null);
  itemFormMode = signal<'new' | 'edit'>('new');
  itemSortColumn = signal<keyof TableItem>('itemCode');
  itemSortDirection = signal<'asc' | 'desc'>('asc');

  // --- Master (Table) Computed & Forms ---
  sortedTables = computed(() => this.sort<GeneralTable>(this.tables(), this.tableSortColumn(), this.tableSortDirection()));
  tableForm = this.fb.group({
    tableCode: [0, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    description: ['', Validators.required],
  });

  // --- Detail (Item) Computed & Forms ---
  sortedItems = computed(() => {
    const items = this.selectedTable()?.items || [];
    return this.sort<TableItem>(items, this.itemSortColumn(), this.itemSortDirection());
  });
  itemForm = this.fb.group({
    itemCode: [0, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    description: ['', Validators.required],
  });

  // --- Generic Sort Helper ---
  private sort<T>(items: T[], column: keyof T, direction: 'asc' | 'desc'): T[] {
    return [...items].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') comparison = aValue - bValue;
      else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') comparison = aValue === bValue ? 0 : aValue ? -1 : 1;
      else comparison = String(aValue).localeCompare(String(bValue));
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  // --- Master (Table) Methods ---
  selectTable(table: GeneralTable): void {
    this.selectedTable.set(table);
  }

  onTableSort(column: keyof GeneralTable): void {
    if (this.tableSortColumn() === column) this.tableSortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    else { this.tableSortColumn.set(column); this.tableSortDirection.set('asc'); }
  }
  
  openNewTablePanel(): void {
    this.tableFormMode.set('new');
    this.tableForm.reset();
    this.tableForm.get('tableCode')?.enable();
    this.tableForm.get('tableCode')?.setValidators([Validators.required, Validators.pattern(/^[0-9]+$/), this.tableCodeExistsValidator.bind(this)]);
    this.tableForm.updateValueAndValidity();
    this.isTablePanelOpen.set(true);
  }

  openEditTablePanel(table: GeneralTable): void {
    this.tableFormMode.set('edit');
    this.tableForm.reset();
    this.tableForm.patchValue(table);
    this.tableForm.get('tableCode')?.disable();
    this.tableForm.get('tableCode')?.clearValidators();
    this.tableForm.updateValueAndValidity();
    this.isTablePanelOpen.set(true);
  }

  saveTable(): void {
    if (this.tableForm.invalid) return;

    const formValue = this.tableForm.getRawValue();

    if (this.tableFormMode() === 'new') {
      const newTable: GeneralTable = {
        tableCode: Number(formValue.tableCode),
        description: formValue.description || '',
        isActive: true,
        items: [],
      };
      this.tables.update(tables => [...tables, newTable]);
    } else {
      this.tables.update(tables => 
        tables.map(t => t.tableCode === formValue.tableCode ? { ...t, description: formValue.description || '' } : t)
      );
    }
    this.closeTablePanel();
  }

  openTableVigenciaModal(table: GeneralTable): void {
    this.tableToToggleVigencia.set(table);
    this.isTableConfirmModalOpen.set(true);
  }

  confirmToggleTableVigencia(): void {
    const tableToToggle = this.tableToToggleVigencia();
    if (tableToToggle) {
      this.tables.update(tables => tables.map(t => t.tableCode === tableToToggle.tableCode ? { ...t, isActive: !t.isActive } : t));
      if (this.selectedTable()?.tableCode === tableToToggle.tableCode) {
        this.selectedTable.set(null);
      }
      this.closeTableConfirmModal();
    }
  }

  closeTablePanel = () => this.isTablePanelOpen.set(false);
  closeTableConfirmModal = () => { this.isTableConfirmModalOpen.set(false); this.tableToToggleVigencia.set(null); };

  tableCodeExistsValidator(control: AbstractControl): ValidationErrors | null {
    return this.tables().some(t => t.tableCode === Number(control.value)) ? { codeExists: true } : null;
  }

  // --- Detail (Item) Methods ---
  onItemSort(column: keyof TableItem): void {
    if (this.itemSortColumn() === column) this.itemSortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    else { this.itemSortColumn.set(column); this.itemSortDirection.set('asc'); }
  }

  openNewItemPanel(): void {
    this.itemFormMode.set('new');
    this.itemForm.reset();
    this.itemForm.get('itemCode')?.enable();
    this.itemForm.get('itemCode')?.setValidators([Validators.required, Validators.pattern(/^[0-9]+$/), this.itemCodeExistsValidator.bind(this)]);
    this.itemForm.updateValueAndValidity();
    this.isItemPanelOpen.set(true);
  }
  
  openEditItemPanel(item: TableItem): void {
    this.itemFormMode.set('edit');
    this.itemForm.reset();
    this.itemForm.patchValue(item);
    this.itemForm.get('itemCode')?.disable();
    this.itemForm.get('itemCode')?.clearValidators();
    this.itemForm.updateValueAndValidity();
    this.isItemPanelOpen.set(true);
  }

  saveItem(): void {
    if (this.itemForm.invalid || !this.selectedTable()) return;
    const formValue = this.itemForm.getRawValue();
    const tableCode = this.selectedTable()!.tableCode;

    if (this.itemFormMode() === 'new') {
      const newItem: TableItem = {
        itemCode: Number(formValue.itemCode),
        description: formValue.description || '',
        isActive: true,
      };
      this.tables.update(tables => tables.map(t => t.tableCode === tableCode ? { ...t, items: [...t.items, newItem] } : t));
    } else {
      this.tables.update(tables => tables.map(t => t.tableCode === tableCode ? { ...t, items: t.items.map(it => it.itemCode === formValue.itemCode ? { ...it, description: formValue.description || '' } : it) } : t));
    }
    const updatedTable = this.tables().find(t => t.tableCode === tableCode);
    if(updatedTable) this.selectedTable.set(updatedTable);

    this.closeItemPanel();
  }

  openItemVigenciaModal(item: TableItem): void {
    this.itemToToggleVigencia.set(item);
    this.isItemConfirmModalOpen.set(true);
  }

  confirmToggleItemVigencia(): void {
    const itemToToggle = this.itemToToggleVigencia();
    const tableCode = this.selectedTable()?.tableCode;
    if (itemToToggle && tableCode) {
      this.tables.update(tables => tables.map(t => t.tableCode === tableCode ? { ...t, items: t.items.map(it => it.itemCode === itemToToggle.itemCode ? { ...it, isActive: !it.isActive } : it) } : t));
      const updatedTable = this.tables().find(t => t.tableCode === tableCode);
      if(updatedTable) this.selectedTable.set(updatedTable);
      this.closeItemConfirmModal();
    }
  }

  closeItemPanel = () => this.isItemPanelOpen.set(false);
  closeItemConfirmModal = () => { this.isItemConfirmModalOpen.set(false); this.itemToToggleVigencia.set(null); };

  itemCodeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.selectedTable()?.items.some(it => it.itemCode === code);
    return codeExists ? { codeExists: true } : null;
  }

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    let currentY = 22;

    doc.setFontSize(18);
    doc.text('Reporte de Tablas Generales y sus Ítems', 14, currentY);
    currentY += 12;

    this.sortedTables().forEach(table => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129); // Emerald color
      doc.text(`Tabla: ${table.tableCode} - ${table.description}`, 14, currentY);
      currentY += 7;
      
      doc.setFontSize(10);
      doc.setTextColor(40);
      doc.text(`Vigencia: ${table.isActive ? 'Vigente' : 'No Vigente'}`, 14, currentY);
      currentY += 10;

      if (table.items.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['Cód. Ítem', 'Descripción', 'Vigencia']],
          body: table.items.map(item => [
            item.itemCode,
            item.description,
            item.isActive ? 'Vigente' : 'No Vigente'
          ]),
          theme: 'grid',
          headStyles: { fillColor: [74, 85, 104] },
          margin: { left: 14, right: 14 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 12;
      } else {
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text('Sin ítems registrados para esta tabla.', 14, currentY);
        currentY += 10;
      }
    });
    
    // Footer
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

    doc.save('Reporte_Tablas_Generales.pdf');
  }
}
