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

interface ActiveIngredient {
    id: number;
    name: string;
}

interface Species {
    id: number;
    name: string;
}

interface Articulo {
  companyId: number;
  familyId: number;
  subFamilyId: number;
  itemCode: number;
  name: string;
  unitOfMeasureId: number;
  category: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  activeIngredientId: number | null;
  waitingDays: number;
  reentryHours: number;
  chargeableCode: number | null;
  hasValidity: boolean;
  validityDate: string | null; // YYYY-MM-DD
  speciesId: number | null;
  isActive: boolean;
}

@Component({
  selector: 'app-maestro-articulos',
  templateUrl: './maestro-articulos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class MaestroArticulosComponent implements OnInit {
  private fb = inject(FormBuilder);

  // --- Master Data (simulated) ---
  companies = signal<Company[]>([
    { id: 1, name: 'Agrícola San José' },
    { id: 2, name: 'Exportadora del Valle' }
  ]);

  allFamilies = signal<Family[]>([
      { id: 1, name: 'Fertilizantes' },
      { id: 2, name: 'Herbicidas' },
      { id: 3, name: 'Semillas' }
  ]);
  allSubFamilies = signal<SubFamily[]>([
      { id: 101, familyId: 1, name: 'Nitrogenados' },
      { id: 102, familyId: 1, name: 'Fosfatados' },
      { id: 201, familyId: 2, name: 'Sistémicos' },
      { id: 202, familyId: 2, name: 'De Contacto' },
      { id: 301, familyId: 3, name: 'Híbridas' },
      { id: 302, familyId: 3, name: 'Orgánicas' }
  ]);
  allUnitsOfMeasure = signal<UnitOfMeasure[]>([
      { id: 1, name: 'Unidad', abbreviation: 'UN' },
      { id: 2, name: 'Kilo', abbreviation: 'KG' },
      { id: 3, name: 'Litro', abbreviation: 'LT' },
      { id: 4, name: 'Saco', abbreviation: 'SA' },
  ]);
  allActiveIngredients = signal<ActiveIngredient[]>([
    { id: 1, name: 'Glifosato' },
    { id: 2, name: 'Mancozeb' },
    { id: 3, name: 'Clorpirifos' },
  ]);
  allSpecies = signal<Species[]>([
    { id: 1, name: 'Uva de Mesa' },
    { id: 2, name: 'Cerezas' },
    { id: 3, name: 'Manzanas' },
  ]);
  
  allItems = signal<Articulo[]>([
    { companyId: 1, familyId: 1, subFamilyId: 101, itemCode: 1001, name: 'Urea Granulada', unitOfMeasureId: 4, category: 'Fertilizante Mayor', minStock: 50, maxStock: 200, reorderPoint: 75, activeIngredientId: null, waitingDays: 0, reentryHours: 0, chargeableCode: 5001, hasValidity: false, validityDate: null, speciesId: null, isActive: true },
    { companyId: 1, familyId: 3, subFamilyId: 301, itemCode: 2005, name: 'Semilla de Maíz DK-7210', unitOfMeasureId: 2, category: 'Semilla Híbrida', minStock: 100, maxStock: 500, reorderPoint: 150, activeIngredientId: null, waitingDays: 0, reentryHours: 0, chargeableCode: 5002, hasValidity: false, validityDate: null, speciesId: 3, isActive: true },
    { companyId: 2, familyId: 2, subFamilyId: 201, itemCode: 5010, name: 'Glifosato 48% SL', unitOfMeasureId: 3, category: 'Herbicida Post-emergente', minStock: 20, maxStock: 100, reorderPoint: 30, activeIngredientId: 1, waitingDays: 15, reentryHours: 24, chargeableCode: 5003, hasValidity: true, validityDate: '2025-12-31', speciesId: 1, isActive: false },
  ]);

  // --- State Signals ---
  selectedCompanyId = signal<number | null>(null);
  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<Articulo | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  sortColumn = signal<keyof ReturnType<this['displayItems']>[0]>('itemCode');
  sortDirection = signal<'asc' | 'desc'>('asc');

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
          familyName: this.allFamilies().find(f => f.id === item.familyId)?.name || 'N/A',
          subFamilyName: this.allSubFamilies().find(sf => sf.id === item.subFamilyId)?.name || 'N/A',
          unitOfMeasureAbbreviation: this.allUnitsOfMeasure().find(u => u.id === item.unitOfMeasureId)?.abbreviation || 'N/A',
          activeIngredientName: this.allActiveIngredients().find(a => a.id === item.activeIngredientId)?.name || 'N/A',
          speciesName: this.allSpecies().find(s => s.id === item.speciesId)?.name || 'N/A'
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
    const selectedFamilyId = this.articleForm.get('familyId')?.value;
    if (!selectedFamilyId) return [];
    return this.allSubFamilies().filter(sf => sf.familyId === Number(selectedFamilyId));
  });

  // --- Form ---
  articleForm = this.fb.group({
    familyId: [null as number | null, Validators.required],
    subFamilyId: [{value: null as number | null, disabled: true}, Validators.required],
    itemCode: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    name: ['', Validators.required],
    unitOfMeasureId: [null as number | null, Validators.required],
    category: [''],
    minStock: [0, [Validators.required, Validators.min(0)]],
    maxStock: [0, [Validators.required, Validators.min(0)]],
    reorderPoint: [0, [Validators.required, Validators.min(0), Validators.pattern('^[0-9]+$')]],
    activeIngredientId: [null as number | null],
    waitingDays: [0, [Validators.required, Validators.min(0)]],
    reentryHours: [0, [Validators.required, Validators.min(0)]],
    chargeableCode: [null as number | null, [Validators.pattern('^[0-9]+$')]],
    hasValidity: [false, Validators.required],
    validityDate: [{value: null as string | null, disabled: true}],
    speciesId: [null as number | null],
  });

  ngOnInit() {
      this.articleForm.get('familyId')?.valueChanges.subscribe(familyId => {
          const subFamilyControl = this.articleForm.get('subFamilyId');
          subFamilyControl?.reset();
          if (familyId) subFamilyControl?.enable();
          else subFamilyControl?.disable();
      });

      this.articleForm.get('hasValidity')?.valueChanges.subscribe(hasValidity => {
            const validityDateControl = this.articleForm.get('validityDate');
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
    this.articleForm.reset({ minStock: 0, maxStock: 0, reorderPoint: 0, waitingDays: 0, reentryHours: 0, hasValidity: false });
    this.articleForm.get('itemCode')?.enable();
    this.articleForm.get('subFamilyId')?.disable();
    this.articleForm.get('validityDate')?.disable();
    this.articleForm.get('itemCode')?.setValidators([Validators.required, Validators.pattern('^[0-9]+$'), this.codeExistsValidator.bind(this)]);
    this.articleForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: Articulo): void {
    this.formMode.set('edit');
    this.articleForm.reset();
    this.articleForm.patchValue(item);
    this.articleForm.get('itemCode')?.disable();
    this.articleForm.get('subFamilyId')?.enable();
    this.articleForm.get('itemCode')?.clearValidators();
    if (item.hasValidity) this.articleForm.get('validityDate')?.enable();
    else this.articleForm.get('validityDate')?.disable();
    this.articleForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveItem(): void {
    if (this.articleForm.invalid || !this.selectedCompanyId()) return;

    const formValue = this.articleForm.getRawValue();
    const companyId = this.selectedCompanyId()!;

    if (this.formMode() === 'new') {
      const newItem: Articulo = {
        companyId: companyId,
        familyId: Number(formValue.familyId),
        subFamilyId: Number(formValue.subFamilyId),
        itemCode: Number(formValue.itemCode),
        name: formValue.name || '',
        unitOfMeasureId: Number(formValue.unitOfMeasureId),
        category: formValue.category || '',
        minStock: Number(formValue.minStock),
        maxStock: Number(formValue.maxStock),
        reorderPoint: Number(formValue.reorderPoint),
        activeIngredientId: formValue.activeIngredientId ? Number(formValue.activeIngredientId) : null,
        waitingDays: Number(formValue.waitingDays),
        reentryHours: Number(formValue.reentryHours),
        chargeableCode: formValue.chargeableCode ? Number(formValue.chargeableCode) : null,
        hasValidity: formValue.hasValidity,
        validityDate: formValue.validityDate || null,
        speciesId: formValue.speciesId ? Number(formValue.speciesId) : null,
        isActive: true
      };
      this.allItems.update(items => [...items, newItem]);
    } else {
      this.allItems.update(items => items.map(item => 
          item.itemCode === formValue.itemCode && item.companyId === companyId 
          ? { ...item, 
              name: formValue.name || '',
              familyId: Number(formValue.familyId),
              subFamilyId: Number(formValue.subFamilyId),
              unitOfMeasureId: Number(formValue.unitOfMeasureId),
              category: formValue.category || '',
              minStock: Number(formValue.minStock),
              maxStock: Number(formValue.maxStock),
              reorderPoint: Number(formValue.reorderPoint),
              activeIngredientId: formValue.activeIngredientId ? Number(formValue.activeIngredientId) : null,
              waitingDays: Number(formValue.waitingDays),
              reentryHours: Number(formValue.reentryHours),
              chargeableCode: formValue.chargeableCode ? Number(formValue.chargeableCode) : null,
              hasValidity: formValue.hasValidity,
              validityDate: formValue.validityDate || null,
              speciesId: formValue.speciesId ? Number(formValue.speciesId) : null,
            } 
          : item
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(item: Articulo): void {
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

  closePanel = () => this.isPanelOpen.set(false);
  closeConfirmModal = () => { this.isConfirmModalOpen.set(false); this.itemToToggleVigencia.set(null); };
  
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
    const head = [['Código', 'Nombre', 'Familia', 'U.M.', 'Ing. Activo', 'D.C.', 'H.R.', 'Vig. SAG', 'F. Vig.', 'Especie', 'Vigencia']];
    const body = this.sortedItems().map(d => [
        d.itemCode, 
        d.name,
        d.familyName,
        d.unitOfMeasureAbbreviation,
        d.activeIngredientName,
        d.waitingDays,
        d.reentryHours,
        d.hasValidity ? 'Sí' : 'No',
        d.validityDate || 'N/A',
        d.speciesName,
        d.isActive ? 'Vigente' : 'No Vigente'
    ]);

    doc.setFontSize(18);
    doc.text(`Reporte Maestro de Artículos - ${this.selectedCompanyName()}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: head,
      body: body,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 8 },
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

    doc.save(`Reporte_Articulos_${this.selectedCompanyName().replace(/\s+/g, '_')}.pdf`);
  }
}
