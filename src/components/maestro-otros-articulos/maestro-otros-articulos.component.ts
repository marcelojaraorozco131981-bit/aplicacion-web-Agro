import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Interfaces
interface Company {
  id: number;
  name: string;
}

interface Family {
  id: number;
  name: string;
}

interface SubFamily {
  id: number;
  familyId: number;
  name: string;
}

interface UnitOfMeasure {
    id: number;
    name: string;
    abbreviation: string;
}

interface OtrosArticulos {
  companyId: number;
  purchaseType: 1 | 2 | 3; // 1: Existencias, 2: Activo Fijo, 3: Servicios/Otros
  familyId: number;
  subFamilyId: number;
  itemCode: number;
  name: string;
  unitOfMeasureId: number;
  chargeableCode: number | null;
  hasValidity: boolean;
  validityDate: string | null; // YYYY-MM-DD
  isActive: boolean;
}

@Component({
  selector: 'app-maestro-otros-articulos',
  templateUrl: './maestro-otros-articulos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class MaestroOtrosArticulosComponent implements OnInit {
  private fb = inject(FormBuilder);

  // --- Master Data (simulated) ---
  companies = signal<Company[]>([
    { id: 1, name: 'Agrícola San José' },
    { id: 2, name: 'Exportadora del Valle' }
  ]);
  allFamilies = signal<Family[]>([
      { id: 1, name: 'Oficina' },
      { id: 2, name: 'Activos' },
      { id: 3, name: 'Servicios Profesionales' }
  ]);
  allSubFamilies = signal<SubFamily[]>([
      { id: 101, familyId: 1, name: 'Artículos de Escritorio' },
      { id: 102, familyId: 1, name: 'Consumibles Impresión' },
      { id: 201, familyId: 2, name: 'Equipos Computacionales' },
      { id: 301, familyId: 3, name: 'Asesorías Contables' },
  ]);
  allUnitsOfMeasure = signal<UnitOfMeasure[]>([
      { id: 1, name: 'Unidad', abbreviation: 'UN' },
      { id: 2, name: 'Hora', abbreviation: 'HR' },
      { id: 3, name: 'Servicio', abbreviation: 'SV' },
      { id: 5, name: 'Caja', abbreviation: 'CJ' },
  ]);

  allItems = signal<OtrosArticulos[]>([
    { companyId: 1, purchaseType: 1, familyId: 1, subFamilyId: 101, itemCode: 7001, name: 'Resma de Papel Carta', unitOfMeasureId: 5, chargeableCode: 9010, hasValidity: false, validityDate: null, isActive: true },
    { companyId: 1, purchaseType: 2, familyId: 2, subFamilyId: 201, itemCode: 8005, name: 'Laptop Dell Latitude', unitOfMeasureId: 1, chargeableCode: 9020, hasValidity: true, validityDate: '2027-08-01', isActive: true },
    { companyId: 2, purchaseType: 3, familyId: 3, subFamilyId: 301, itemCode: 9010, name: 'Servicio Contabilidad Mensual', unitOfMeasureId: 3, chargeableCode: 9030, hasValidity: false, validityDate: null, isActive: false },
  ]);

  // --- State Signals ---
  selectedCompanyId = signal<number | null>(null);
  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<OtrosArticulos | null>(null);
  isDeleteModalOpen = signal(false);
  itemToDelete = signal<OtrosArticulos | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  sortColumn = signal<keyof ReturnType<this['displayItems']>[0]>('itemCode');
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  purchaseTypes: Record<1|2|3, string> = { 1: 'Existencias', 2: 'Activo Fijo', 3: 'Servicios/Otros'};

  // --- Computed Signals ---
  selectedCompanyName = computed(() => this.companies().find(c => c.id === this.selectedCompanyId())?.name || '');
  
  filteredItems = computed(() => {
    const companyId = this.selectedCompanyId();
    if (!companyId) return [];
    return this.allItems().filter(d => d.companyId === companyId);
  });
  
  displayItems = computed(() => {
      return this.filteredItems().map(item => ({
          ...item,
          purchaseTypeName: this.purchaseTypes[item.purchaseType],
          familyName: this.allFamilies().find(f => f.id === item.familyId)?.name || 'N/A',
          subFamilyName: this.allSubFamilies().find(sf => sf.id === item.subFamilyId)?.name || 'N/A',
          unitOfMeasureAbbreviation: this.allUnitsOfMeasure().find(u => u.id === item.unitOfMeasureId)?.abbreviation || 'N/A',
      }));
  });

  sortedItems = computed(() => {
    const list = this.displayItems();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return [...list].sort((a, b) => {
      const aValue = (a as any)[column];
      const bValue = (b as any)[column];
      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') comparison = aValue - bValue;
      else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') comparison = aValue === bValue ? 0 : aValue ? -1 : 1;
      else comparison = String(aValue).localeCompare(String(bValue));
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  filteredSubFamilies = computed(() => {
    const selectedFamilyId = this.itemForm.get('familyId')?.value;
    if (!selectedFamilyId) return [];
    return this.allSubFamilies().filter(sf => sf.familyId === Number(selectedFamilyId));
  });

  // --- Form ---
  itemForm = this.fb.group({
    purchaseType: [null as OtrosArticulos['purchaseType'] | null, Validators.required],
    familyId: [null as number | null, Validators.required],
    subFamilyId: [{value: null as number | null, disabled: true}, Validators.required],
    itemCode: [null as number | null, [Validators.required, Validators.pattern('^[0-9]+$')]],
    name: ['', Validators.required],
    unitOfMeasureId: [null as number | null, Validators.required],
    chargeableCode: [null as number | null, [Validators.pattern('^[0-9]+$')]],
    hasValidity: [false, Validators.required],
    validityDate: [{value: null as string | null, disabled: true}],
  });

  ngOnInit() {
      this.itemForm.get('familyId')?.valueChanges.subscribe(familyId => {
          const subFamilyControl = this.itemForm.get('subFamilyId');
          subFamilyControl?.reset();
          if (familyId) subFamilyControl?.enable(); else subFamilyControl?.disable();
      });

      this.itemForm.get('hasValidity')?.valueChanges.subscribe(hasValidity => {
            const validityDateControl = this.itemForm.get('validityDate');
            if (hasValidity) {
                validityDateControl?.enable();
                validityDateControl?.setValidators(Validators.required);
            } else {
                validityDateControl?.disable();
                validityDateControl?.clearValidators();
                validityDateControl?.reset();
            }
            validityDateControl?.updateValueAndValidity();
        });
  }

  // --- Methods ---
  onCompanyChange = (event: Event) => this.selectedCompanyId.set(Number((event.target as HTMLSelectElement).value) || null);

  openNewPanel(): void {
    this.formMode.set('new');
    this.itemForm.reset({ hasValidity: false });
    this.itemForm.get('itemCode')?.enable();
    this.itemForm.get('subFamilyId')?.disable();
    this.itemForm.get('validityDate')?.disable();
    this.itemForm.get('itemCode')?.setValidators([Validators.required, Validators.pattern('^[0-9]+$'), this.codeExistsValidator.bind(this)]);
    this.itemForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: OtrosArticulos): void {
    this.formMode.set('edit');
    this.itemForm.reset();
    this.itemForm.patchValue(item);
    this.itemForm.get('itemCode')?.disable();
    this.itemForm.get('subFamilyId')?.enable();
    this.itemForm.get('itemCode')?.clearValidators();
    if (item.hasValidity) this.itemForm.get('validityDate')?.enable(); else this.itemForm.get('validityDate')?.disable();
    this.itemForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveItem(): void {
    if (this.itemForm.invalid || !this.selectedCompanyId()) return;

    const formValue = this.itemForm.getRawValue();
    const companyId = this.selectedCompanyId()!;

    if (this.formMode() === 'new') {
      const newItem: OtrosArticulos = {
        companyId: companyId,
        purchaseType: formValue.purchaseType!,
        familyId: Number(formValue.familyId),
        subFamilyId: Number(formValue.subFamilyId),
        itemCode: Number(formValue.itemCode),
        name: formValue.name || '',
        unitOfMeasureId: Number(formValue.unitOfMeasureId),
        chargeableCode: formValue.chargeableCode ? Number(formValue.chargeableCode) : null,
        hasValidity: formValue.hasValidity,
        validityDate: formValue.validityDate || null,
        isActive: true
      };
      this.allItems.update(items => [...items, newItem]);
    } else {
      this.allItems.update(items => items.map(item => 
          item.itemCode === formValue.itemCode && item.companyId === companyId 
          ? { ...item, ...formValue, companyId } as OtrosArticulos
          : item
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(item: OtrosArticulos): void {
    this.itemToToggleVigencia.set(item);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const itemToToggle = this.itemToToggleVigencia();
    if (itemToToggle) {
      this.allItems.update(items => items.map(item => 
          item.itemCode === itemToToggle.itemCode && item.companyId === itemToToggle.companyId
          ? { ...item, isActive: !item.isActive } 
          : item
        )
      );
    }
    this.closeConfirmModal();
  }

  openDeleteModal(item: OtrosArticulos): void {
    this.itemToDelete.set(item);
    this.isDeleteModalOpen.set(true);
  }

  confirmDeleteItem(): void {
    const itemToDelete = this.itemToDelete();
    if (itemToDelete) {
      this.allItems.update(items =>
        items.filter(item =>
          !(item.itemCode === itemToDelete.itemCode && item.companyId === itemToDelete.companyId)
        )
      );
    }
    this.closeDeleteModal();
  }

  closePanel = () => this.isPanelOpen.set(false);
  closeConfirmModal = () => { this.isConfirmModalOpen.set(false); this.itemToToggleVigencia.set(null); };
  closeDeleteModal = () => { this.isDeleteModalOpen.set(false); this.itemToDelete.set(null); };
  
  onSort(column: keyof ReturnType<this['displayItems']>[0]): void {
    if (this.sortColumn() === column) this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    else { this.sortColumn.set(column); this.sortDirection.set('asc'); }
  }

  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.filteredItems().some(d => d.itemCode === code);
    return codeExists ? { codeExists: true } : null;
  }

  async exportToPdf(): Promise<void> {
    if (!this.selectedCompanyId()) return;

    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'landscape' });
    const head = [['Ítem', 'Nombre', 'Tipo Compra', 'Familia', 'U.M.', 'Cód. Imputable', 'Vigencia', 'F. Vigencia', 'Activo']];
    const body = this.sortedItems().map(d => [
        d.itemCode, 
        d.name,
        d.purchaseTypeName,
        d.familyName,
        d.unitOfMeasureAbbreviation,
        d.chargeableCode || 'N/A',
        d.hasValidity ? 'Sí' : 'No',
        d.validityDate || 'N/A',
        d.isActive ? 'Sí' : 'No'
    ]);

    doc.setFontSize(18);
    doc.text(`Reporte Otros Artículos y Servicios - ${this.selectedCompanyName()}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: head,
      body: body,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 },
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

    doc.save(`Reporte_Otros_Articulos_${this.selectedCompanyName().replace(/\s+/g, '_')}.pdf`);
  }
}
