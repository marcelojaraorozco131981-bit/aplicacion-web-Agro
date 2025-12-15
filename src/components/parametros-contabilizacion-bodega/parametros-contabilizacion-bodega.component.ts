import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Interfaces
interface TipoMovimiento { id: string; name: string; }
interface Familia { id: number; name: string; }
interface SubFamilia { id: number; familyId: number; name: string; }
interface CuentaContable { id: string; name: string; }

interface ParametroContable {
  id: number;
  tipoMovimientoId: string;
  familiaId: number | null;
  subFamiliaId: number | null;
  ctaDebe: string;
  ctaHaber: string;
  ctaContableId: string;
  isActive: boolean;
}

@Component({
  selector: 'app-parametros-contabilizacion-bodega',
  templateUrl: './parametros-contabilizacion-bodega.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ParametrosContabilizacionBodegaComponent implements OnInit {
  private fb = inject(FormBuilder);

  // --- Master Data (simulated) ---
  tiposMovimiento = signal<TipoMovimiento[]>([
    { id: 'INGRESO_COMPRA', name: 'Ingreso por Compra' },
    { id: 'SALIDA_CONSUMO', name: 'Salida por Consumo' },
    { id: 'TRASPASO_SALIDA', name: 'Traspaso de Salida' },
    { id: 'TRASPASO_ENTRADA', name: 'Traspaso de Entrada' },
  ]);
  familias = signal<Familia[]>([
      { id: 1, name: 'Fertilizantes' },
      { id: 2, name: 'Herbicidas' },
      { id: 3, name: 'Semillas' }
  ]);
  subFamilias = signal<SubFamilia[]>([
      { id: 101, familyId: 1, name: 'Nitrogenados' },
      { id: 102, familyId: 1, name: 'Fosfatados' },
      { id: 201, familyId: 2, name: 'Sistémicos' },
      { id: 202, familyId: 2, name: 'De Contacto' },
      { id: 301, familyId: 3, name: 'Híbridas' },
  ]);
  cuentasContables = signal<CuentaContable[]>([
    { id: '1106001', name: '1106001 - Existencias' },
    { id: '6101001', name: '6101001 - Costo de Venta' },
    { id: '6201001', name: '6201001 - Consumo Interno' },
    { id: '1108001', name: '1108001 - Bodegas en Tránsito' },
  ]);
  
  // --- State ---
  parametros = signal<ParametroContable[]>([
    { id: 1, tipoMovimientoId: 'INGRESO_COMPRA', familiaId: 1, subFamiliaId: 101, ctaDebe: '1106001', ctaHaber: '2101001', ctaContableId: '1106001', isActive: true},
    { id: 2, tipoMovimientoId: 'SALIDA_CONSUMO', familiaId: 1, subFamiliaId: null, ctaDebe: '6201001', ctaHaber: '1106001', ctaContableId: '6201001', isActive: true},
    { id: 3, tipoMovimientoId: 'TRASPASO_SALIDA', familiaId: null, subFamiliaId: null, ctaDebe: '1108001', ctaHaber: '1106001', ctaContableId: '1108001', isActive: false},
  ]);

  isPanelOpen = signal(false);
  isDeleteModalOpen = signal(false);
  itemToDelete = signal<ParametroContable | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  sortColumn = signal<keyof ReturnType<this['displayItems']>[0]>('id');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // --- Computed ---
  displayItems = computed(() => {
    return this.parametros().map(p => ({
      ...p,
      tipoMovimientoName: this.tiposMovimiento().find(tm => tm.id === p.tipoMovimientoId)?.name || 'N/A',
      familiaName: p.familiaId ? this.familias().find(f => f.id === p.familiaId)?.name : 'Todas',
      subFamiliaName: p.subFamiliaId ? this.subFamilias().find(sf => sf.id === p.subFamiliaId)?.name : 'Todas',
      ctaContableName: this.cuentasContables().find(cc => cc.id === p.ctaContableId)?.name || 'N/A'
    }));
  });

  sortedItems = computed(() => {
    const list = this.displayItems();
    const column = this.sortColumn();
    const direction = this.sortDirection();
    return [...list].sort((a, b) => {
      const aValue = a[column as keyof typeof a];
      const bValue = b[column as keyof typeof b];
      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') comparison = aValue - bValue;
      else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') comparison = aValue === bValue ? 0 : aValue ? -1 : 1;
      else comparison = String(aValue).localeCompare(String(bValue));
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  filteredSubFamilias = computed(() => {
    const familyId = this.paramForm.get('familiaId')?.value;
    if (!familyId) return [];
    return this.subFamilias().filter(sf => sf.familyId === Number(familyId));
  });

  // --- Form ---
  paramForm = this.fb.group({
    id: [null as number | null],
    tipoMovimientoId: [null as string | null, Validators.required],
    familiaId: [null as number | null],
    subFamiliaId: [{value: null as number | null, disabled: true}],
    ctaDebe: ['', [Validators.required, Validators.pattern('^[0-9-]+$')]],
    ctaHaber: ['', [Validators.required, Validators.pattern('^[0-9-]+$')]],
    ctaContableId: [null as string | null, Validators.required],
  });

  ngOnInit() {
    this.paramForm.get('familiaId')?.valueChanges.subscribe(familyId => {
      const subFamiliaControl = this.paramForm.get('subFamiliaId');
      subFamiliaControl?.reset();
      if (familyId) subFamiliaControl?.enable();
      else subFamiliaControl?.disable();
    });
  }

  // --- Methods ---
  onSort(column: keyof ReturnType<this['displayItems']>[0]): void {
    if (this.sortColumn() === column) this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    else { this.sortColumn.set(column); this.sortDirection.set('asc'); }
  }

  openNewPanel(): void {
    this.formMode.set('new');
    this.paramForm.reset();
    this.paramForm.get('subFamiliaId')?.disable();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: ParametroContable): void {
    this.formMode.set('edit');
    this.paramForm.reset();
    this.paramForm.patchValue(item);
    if (item.familiaId) this.paramForm.get('subFamiliaId')?.enable();
    else this.paramForm.get('subFamiliaId')?.disable();
    this.isPanelOpen.set(true);
  }

  saveItem(): void {
    if (this.paramForm.invalid) {
      this.paramForm.markAllAsTouched();
      return;
    }

    const formValue = this.paramForm.getRawValue();

    if (this.formMode() === 'new') {
      const newId = (this.parametros().reduce((max, p) => p.id > max ? p.id : max, 0)) + 1;
      const newItem: ParametroContable = {
        id: newId,
        tipoMovimientoId: formValue.tipoMovimientoId!,
        familiaId: formValue.familiaId || null,
        subFamiliaId: formValue.subFamiliaId || null,
        ctaDebe: formValue.ctaDebe!,
        ctaHaber: formValue.ctaHaber!,
        ctaContableId: formValue.ctaContableId!,
        isActive: true
      };
      this.parametros.update(items => [...items, newItem]);
    } else {
      this.parametros.update(items => items.map(item => item.id === formValue.id ? { ...item, ...formValue } as ParametroContable : item));
    }
    this.closePanel();
  }
  
  openDeleteModal(item: ParametroContable): void {
    this.itemToDelete.set(item);
    this.isDeleteModalOpen.set(true);
  }

  confirmDeleteItem(): void {
    const itemToDelete = this.itemToDelete();
    if (itemToDelete) {
      this.parametros.update(items => items.filter(item => item.id !== itemToDelete.id));
    }
    this.closeDeleteModal();
  }

  closePanel = () => this.isPanelOpen.set(false);
  closeDeleteModal = () => { this.isDeleteModalOpen.set(false); this.itemToDelete.set(null); };

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(18);
    doc.text('Parámetros de Contabilización de Bodega', 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [['Movimiento', 'Familia', 'Subfamilia', 'Cta. Debe', 'Cta. Haber', 'Cta. Contable']],
      body: this.sortedItems().map(item => [
        item.tipoMovimientoName,
        item.familiaName,
        item.subFamiliaName,
        item.ctaDebe,
        item.ctaHaber,
        item.ctaContableName,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
    });
    doc.save('Reporte_Param_Contables_Bodega.pdf');
  }
}
