import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup, AbstractControl } from '@angular/forms';

// Interfaces
interface Company { id: number; name: string; }
interface Warehouse { id: number; companyId: number; name: string; }
type MovementStatus = 'Pendiente' | 'Procesado' | 'Anulado';
type MovementType = 'Ingreso' | 'Egreso' | 'Traspaso';

interface Articulo {
  itemCode: number;
  companyId: number;
  name: string;
}

interface Provider { id: number; name: string; }
interface Branch { id: number; providerId: number; name: string; }
interface DocType { id: number; name: string; }
interface PurchaseOrder { id: number; number: string; providerId: number; }
interface Bpa { id: number; description: string; }
interface PurchaseType { id: number; name: string; }
interface CostCenter { id: number; name: string; }
interface WarehouseLocation { id: number; warehouseId: number; name: string; }
interface ItemBalance { itemId: number; warehouseId: number; locationId: number; balance: number; }

interface WarehouseMovementDetail {
  itemId: number;
  quantity: number;
  purchaseTypeId?: number | null;
  unitPrice?: number | null;
  costCenterId?: number | null;
  warehouseLocationId?: number | null;
  newWarehouseLocationId?: number | null;
}

interface WarehouseMovement {
  id: number; // Nro Correlativo
  companyId: number;
  date: string; // YYYY-MM-DD format
  status: MovementStatus;
  type: MovementType;
  warehouseId: number;
  movementWarehouseId?: number | null;
  providerId?: number | null;
  branchId?: number | null;
  docTypeId?: number | null;
  docNum?: string | null;
  exchangeRate?: number | null;
  purchaseOrderId?: number | null;
  bpaId?: number | null;
  observations?: string | null;
  details: WarehouseMovementDetail[];
}

@Component({
  selector: 'app-warehouse-movements',
  templateUrl: './warehouse-movements.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class WarehouseMovementsComponent implements OnInit {
  private fb = inject(FormBuilder);

  // --- Master Data (simulated) ---
  companies = signal<Company[]>([
    { id: 1, name: 'Agrícola San José' },
    { id: 2, name: 'Exportadora del Valle' }
  ]);
  
  warehouses = signal<Warehouse[]>([
    { id: 1, companyId: 1, name: 'Bodega Principal (SJO)' },
    { id: 2, companyId: 1, name: 'Bodega Fitosanitarios (SJO)' },
    { id: 3, companyId: 2, name: 'Bodega Central (EDV)' },
    { id: 4, companyId: 2, name: 'Bodega de Envases (EDV)' },
  ]);

  articulos = signal<Articulo[]>([
    { itemCode: 1001, companyId: 1, name: 'Fertilizante NPK' },
    { itemCode: 1002, companyId: 1, name: 'Semillas de Maíz' },
    { itemCode: 1003, companyId: 1, name: 'Herbicida Glifosato' },
    { itemCode: 2001, companyId: 2, name: 'Cajas de Cartón' },
    { itemCode: 2002, companyId: 2, name: 'Pallets de Madera' },
    { itemCode: 2003, companyId: 2, name: 'Cinta de Embalaje' },
  ]);

  providers = signal<Provider[]>([
    { id: 1, name: 'AgroInsumos S.A.' },
    { id: 2, name: 'Fertilizantes del Sur' },
    { id: 3, name: 'Semillas Premium' }
  ]);

  branches = signal<Branch[]>([
    { id: 1, providerId: 1, name: 'Casa Matriz (Santiago)' },
    { id: 2, providerId: 1, name: 'Sucursal Rancagua' },
    { id: 3, providerId: 2, name: 'Oficina Central' },
    { id: 4, providerId: 3, name: 'Bodega de Semillas' }
  ]);

  docTypes = signal<DocType[]>([
    { id: 1, name: 'Factura' },
    { id: 2, name: 'Guía de Despacho' },
    { id: 3, name: 'Nota de Crédito' }
  ]);
  
  purchaseOrders = signal<PurchaseOrder[]>([
    { id: 1, number: 'OC-2024-001', providerId: 1 },
    { id: 2, number: 'OC-2024-002', providerId: 1 },
    { id: 3, number: 'OC-2024-003', providerId: 2 },
  ]);

  bpas = signal<Bpa[]>([
    { id: 1, description: 'Aplicación Herbicida Fundo A' },
    { id: 2, description: 'Plan Fertilización Cerezos' },
    { id: 3, description: 'Control de Plagas Manzanos' },
  ]);

  purchaseTypes = signal<PurchaseType[]>([
      { id: 1, name: 'Compra Nacional' },
      { id: 2, name: 'Importación' },
      { id: 3, name: 'Ajuste de Inventario' }
  ]);
  costCenters = signal<CostCenter[]>([
      { id: 1, name: 'CC Fundo El Roble' },
      { id: 2, name: 'CC Administración' },
      { id: 3, name: 'CC Packing' }
  ]);
  warehouseLocations = signal<WarehouseLocation[]>([
      { id: 1, warehouseId: 1, name: 'Pasillo A' },
      { id: 2, warehouseId: 1, name: 'Pasillo B' },
      { id: 3, warehouseId: 2, name: 'Estante Químicos' },
      { id: 4, warehouseId: 2, name: 'Área de Mezcla' },
      { id: 5, warehouseId: 3, name: 'Andén 1' },
      { id: 6, warehouseId: 4, name: 'Sector Envases Secos' },
  ]);
  itemBalances = signal<ItemBalance[]>([
      { itemId: 1001, warehouseId: 1, locationId: 1, balance: 120 },
      { itemId: 1001, warehouseId: 1, locationId: 2, balance: 80 },
      { itemId: 1003, warehouseId: 2, locationId: 3, balance: 35 },
      { itemId: 2001, warehouseId: 4, locationId: 6, balance: 2500 },
  ]);

  movementTypes: { id: MovementType, name: string }[] = [
    { id: 'Ingreso', name: 'Ingreso' },
    { id: 'Egreso', name: 'Egreso' },
    { id: 'Traspaso', name: 'Traspaso' },
  ];

  statusColors: Record<MovementStatus, string> = {
    'Pendiente': 'bg-yellow-900 text-yellow-300',
    'Procesado': 'bg-green-900 text-green-300',
    'Anulado': 'bg-red-900 text-red-300'
  };

  // --- State Signals ---
  allMovements = signal<WarehouseMovement[]>([
    { id: 1001, companyId: 1, date: '2024-07-28', status: 'Procesado', type: 'Ingreso', warehouseId: 1, details: [{ itemId: 1001, quantity: 50, purchaseTypeId: 1, unitPrice: 25.50, costCenterId: 1, warehouseLocationId: 1 }], providerId: 1, branchId: 2, docTypeId: 1, docNum: 'F-12345', exchangeRate: 1, purchaseOrderId: 1, bpaId: 2, observations: 'Entrega parcial.' },
    { id: 1002, companyId: 1, date: '2024-07-29', status: 'Pendiente', type: 'Egreso', warehouseId: 1, details: [{ itemId: 1002, quantity: 200, costCenterId: 1, warehouseLocationId: 1 }] },
    { id: 1003, companyId: 2, date: '2024-07-29', status: 'Pendiente', type: 'Ingreso', warehouseId: 4, details: [{ itemId: 2001, quantity: 1000, purchaseTypeId: 2, unitPrice: 0.8, costCenterId: 3, warehouseLocationId: 6 }], providerId: 2, branchId: 3, docTypeId: 2, docNum: 'GD-9876', exchangeRate: 945.5, purchaseOrderId: 3 },
    { id: 1004, companyId: 1, date: '2024-07-30', status: 'Anulado', type: 'Traspaso', warehouseId: 1, movementWarehouseId: 2, details: [{ itemId: 1003, quantity: 10, costCenterId: 2, warehouseLocationId: 2, newWarehouseLocationId: 3 }] },
  ]);
  selectedCompanyId = signal<number | null>(null);
  
  isPanelOpen = signal(false);
  formMode = signal<'new' | 'edit'>('new');
  formType = signal<MovementType | null>(null);
  
  movementToConfirm = signal<WarehouseMovement | null>(null);
  confirmationMode = signal<'process' | 'cancel' | 'delete' | null>(null);

  sortColumn = signal<keyof ReturnType<this['displayMovements']>[0]>('id');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // --- Form-specific signals ---
  formCompanyId = signal<number | null>(null);

  // --- Computed Signals ---
  filteredBranches = computed(() => {
    const providerId = this.movementForm.get('providerId')?.value;
    if (!providerId) return [];
    return this.branches().filter(b => b.providerId === providerId);
  });

  filteredPurchaseOrders = computed(() => {
    const type = this.formType();
    const providerId = this.movementForm.get('providerId')?.value;
    if (type !== 'Ingreso' || !providerId) return [];
    return this.purchaseOrders().filter(po => po.providerId === providerId);
  });

  displayMovements = computed(() => {
    const companyId = this.selectedCompanyId();
    if (!companyId) return [];

    return this.allMovements()
        .filter(m => m.companyId === companyId)
        .map(m => ({
            ...m,
            providerName: m.providerId ? this.providers().find(p => p.id === m.providerId)?.name : '',
            purchaseOrderNumber: m.purchaseOrderId ? this.purchaseOrders().find(po => po.id === m.purchaseOrderId)?.number : '',
            warehouseName: this.warehouses().find(w => w.id === m.warehouseId)?.name || 'N/A',
            movementWarehouseName: m.movementWarehouseId ? this.warehouses().find(w => w.id === m.movementWarehouseId)?.name : ''
        }));
  });

  sortedMovements = computed(() => {
    const list = this.displayMovements();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return [...list].sort((a, b) => {
      const aValue = a[column as keyof typeof a];
      const bValue = b[column as keyof typeof b];
      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') comparison = aValue - bValue;
      else comparison = String(aValue).localeCompare(String(bValue));
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  // NEW computed signals for the form
  formFilteredArticulos = computed(() => {
    const companyId = this.formCompanyId();
    if (!companyId) return [];
    return this.articulos().filter(a => a.companyId === companyId);
  });

  formFilteredWarehouses = computed(() => {
    const companyId = this.formCompanyId();
    if (!companyId) return [];
    return this.warehouses().filter(w => w.companyId === companyId);
  });
  
  formDestinationWarehouses = computed(() => {
    const sourceId = this.movementForm.get('warehouseId')?.value;
    const warehouses = this.formFilteredWarehouses();
    if (!sourceId) return warehouses;
    return warehouses.filter(w => w.id !== sourceId);
  });

  // --- Form ---
  movementForm = this.fb.group({
    id: [0],
    companyId: [null as number | null, Validators.required],
    date: ['', Validators.required],
    type: [null as MovementType | null, Validators.required],
    warehouseId: [null as number | null, Validators.required],
    movementWarehouseId: [null as number | null],
    providerId: [null as number | null],
    branchId: [{ value: null as number | null, disabled: true }],
    docTypeId: [null as number | null],
    docNum: [''],
    exchangeRate: [1, Validators.min(0)],
    purchaseOrderId: [null as number | null],
    bpaId: [null as number | null],
    observations: [''],
    details: this.fb.array([]),
  });

  get details(): FormArray {
    return this.movementForm.get('details') as FormArray;
  }

  newDetailGroup(detail: WarehouseMovementDetail | null = null): FormGroup {
    return this.fb.group({
      purchaseTypeId: [detail?.purchaseTypeId || null],
      itemId: [detail?.itemId || null, Validators.required],
      quantity: [detail?.quantity || null, [Validators.required, Validators.min(0.01)]],
      unitPrice: [detail?.unitPrice || 0],
      costCenterId: [detail?.costCenterId || null],
      warehouseLocationId: [detail?.warehouseLocationId || null],
      newWarehouseLocationId: [detail?.newWarehouseLocationId || null],
    });
  }
  
  updateDetailValidators(group: FormGroup, type: MovementType | null): void {
      const ctrls = {
        purchaseTypeId: group.get('purchaseTypeId'),
        unitPrice: group.get('unitPrice'),
        costCenterId: group.get('costCenterId'),
        warehouseLocationId: group.get('warehouseLocationId'),
        newWarehouseLocationId: group.get('newWarehouseLocationId')
      };

      // Reset all first
      Object.values(ctrls).forEach(c => { c?.clearValidators(); c?.reset(); });

      if (type === 'Ingreso') {
          ctrls.purchaseTypeId?.setValidators(Validators.required);
          ctrls.unitPrice?.setValidators([Validators.required, Validators.min(0)]);
          ctrls.costCenterId?.setValidators(Validators.required);
          ctrls.warehouseLocationId?.setValidators(Validators.required);
      } else if (type === 'Egreso') {
          ctrls.costCenterId?.setValidators(Validators.required);
          ctrls.warehouseLocationId?.setValidators(Validators.required);
      } else if (type === 'Traspaso') {
          ctrls.warehouseLocationId?.setValidators(Validators.required);
          ctrls.newWarehouseLocationId?.setValidators(Validators.required);
      }

      Object.values(ctrls).forEach(c => c?.updateValueAndValidity());
  }

  addDetailLine(): void {
    const type = this.movementForm.get('type')?.value;
    const newGroup = this.newDetailGroup();
    this.updateDetailValidators(newGroup, type as MovementType | null);
    this.details.push(newGroup);
  }

  removeDetailLine(index: number): void {
    this.details.removeAt(index);
  }
  
  ngOnInit() {
    this.movementForm.get('companyId')?.valueChanges.subscribe(companyId => {
        this.formCompanyId.set(companyId ? Number(companyId) : null);
        
        const warehouseId = this.movementForm.get('warehouseId');
        if (warehouseId?.value) warehouseId.reset();

        const movementWarehouseId = this.movementForm.get('movementWarehouseId');
        if (movementWarehouseId?.value) movementWarehouseId.reset();
        
        this.details.controls.forEach(control => {
            const itemId = control.get('itemId');
            if(itemId?.value) itemId.reset();
        });
    });

    this.movementForm.get('type')?.valueChanges.subscribe(type => {
        this.formType.set(type as MovementType | null);
        const movWarehouseCtrl = this.movementForm.get('movementWarehouseId');
        const providerCtrl = this.movementForm.get('providerId');
        const docTypeCtrl = this.movementForm.get('docTypeId');
        const docNumCtrl = this.movementForm.get('docNum');
        const poCtrl = this.movementForm.get('purchaseOrderId');
        
        if (type === 'Ingreso') {
            providerCtrl?.setValidators(Validators.required);
            docTypeCtrl?.setValidators(Validators.required);
            docNumCtrl?.setValidators(Validators.required);
        } else {
            providerCtrl?.clearValidators();
            docTypeCtrl?.clearValidators();
            docNumCtrl?.clearValidators();
            providerCtrl?.reset();
            docTypeCtrl?.reset();
            docNumCtrl?.reset();
            poCtrl?.reset();
        }
        providerCtrl?.updateValueAndValidity();
        docTypeCtrl?.updateValueAndValidity();
        docNumCtrl?.updateValueAndValidity();

        if (type === 'Traspaso') {
            movWarehouseCtrl?.setValidators(Validators.required);
            movWarehouseCtrl?.enable();
        } else {
            movWarehouseCtrl?.clearValidators();
            movWarehouseCtrl?.disable();
            movWarehouseCtrl?.reset();
        }
        movWarehouseCtrl?.updateValueAndValidity();
        
        this.details.controls.forEach(control => {
            this.updateDetailValidators(control as FormGroup, type as MovementType | null);
        });
    });

    this.movementForm.get('providerId')?.valueChanges.subscribe(providerId => {
      const branchCtrl = this.movementForm.get('branchId');
      const poCtrl = this.movementForm.get('purchaseOrderId');
      branchCtrl?.reset();
      poCtrl?.reset();
      if (providerId) {
        branchCtrl?.enable();
      } else {
        branchCtrl?.disable();
      }
    });

    this.movementForm.get('warehouseId')?.valueChanges.subscribe(sourceId => {
        const destCtrl = this.movementForm.get('movementWarehouseId');
        if (destCtrl?.value === sourceId) {
            destCtrl.reset();
        }
        this.details.controls.forEach(c => c.get('warehouseLocationId')?.reset());
    });

     this.movementForm.get('movementWarehouseId')?.valueChanges.subscribe(() => {
        this.details.controls.forEach(c => c.get('newWarehouseLocationId')?.reset());
    });
  }

  getLocationsWithBalances(detailGroup: AbstractControl, warehouseId: number | null): { id: number; name: string; balance: number }[] {
      if (!(detailGroup instanceof FormGroup) || !warehouseId) {
          return [];
      }
      const itemId = detailGroup.get('itemId')?.value;
      if (!itemId) {
          return [];
      }

      const relevantLocations = this.warehouseLocations().filter(l => l.warehouseId === warehouseId);
      
      return relevantLocations.map(location => {
          const balanceEntry = this.itemBalances().find(b => 
              b.itemId === itemId &&
              b.warehouseId === warehouseId &&
              b.locationId === location.id
          );
          return {
              id: location.id,
              name: location.name,
              balance: balanceEntry?.balance || 0
          };
      });
  }

  getItemBalance(detailGroup: AbstractControl): number {
    if (! (detailGroup instanceof FormGroup)) return 0;

    const detailValue = detailGroup.value;
    const mainWarehouseId = this.movementForm.get('warehouseId')?.value;
    
    if (!detailValue.itemId || !mainWarehouseId || !detailValue.warehouseLocationId) {
        return 0;
    }

    const balanceEntry = this.itemBalances().find(b => 
        b.itemId === detailValue.itemId &&
        b.warehouseId === mainWarehouseId &&
        b.locationId === detailValue.warehouseLocationId
    );
    
    return balanceEntry?.balance || 0;
  }

  // --- Methods ---
  onCompanyChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedCompanyId.set(id ? Number(id) : null);
  }

  onSort(column: keyof ReturnType<this['displayMovements']>[0]): void {
    if (this.sortColumn() === column) this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    else { this.sortColumn.set(column as any); this.sortDirection.set('asc'); }
  }
  
  openNewPanel(): void {
    this.formMode.set('new');
    const today = new Date().toISOString().split('T')[0];
    const newId = Math.max(0, ...this.allMovements().map(m => m.id)) + 1;
    this.movementForm.reset({ 
        id: newId, 
        companyId: this.selectedCompanyId(),
        date: today, 
        exchangeRate: 1 
    });
    this.formCompanyId.set(this.selectedCompanyId());
    this.formType.set(null);
    this.details.clear();
    this.addDetailLine();
    this.movementForm.get('id')?.disable();
    this.movementForm.get('companyId')?.enable();
    this.movementForm.get('movementWarehouseId')?.disable();
    this.movementForm.get('branchId')?.disable();
    this.isPanelOpen.set(true);
  }

  openEditPanel(movement: WarehouseMovement): void {
    this.formMode.set('edit');
    this.movementForm.patchValue(movement);
    this.formCompanyId.set(movement.companyId);
    this.formType.set(movement.type);
    this.details.clear();
    movement.details.forEach(detail => {
        const newGroup = this.newDetailGroup(detail);
        this.updateDetailValidators(newGroup, movement.type);
        this.details.push(newGroup);
    });
    this.movementForm.get('id')?.disable();
    this.movementForm.get('companyId')?.disable();
    if(movement.type === 'Traspaso') {
      this.movementForm.get('movementWarehouseId')?.enable();
    } else {
      this.movementForm.get('movementWarehouseId')?.disable();
    }
    if (movement.providerId) {
        this.movementForm.get('branchId')?.enable();
    } else {
        this.movementForm.get('branchId')?.disable();
    }
    this.isPanelOpen.set(true);
  }

  saveMovement(): void {
    if (this.movementForm.invalid) return;

    const formValue = this.movementForm.getRawValue();

    if (this.formMode() === 'new') {
      const newMovement: WarehouseMovement = {
        id: formValue.id!,
        companyId: formValue.companyId!,
        date: formValue.date!,
        type: formValue.type!,
        status: 'Pendiente',
        warehouseId: formValue.warehouseId!,
        movementWarehouseId: formValue.movementWarehouseId || null,
        providerId: formValue.providerId || null,
        branchId: formValue.branchId || null,
        docTypeId: formValue.docTypeId || null,
        docNum: formValue.docNum || null,
        exchangeRate: formValue.exchangeRate || null,
        purchaseOrderId: formValue.purchaseOrderId || null,
        bpaId: formValue.bpaId || null,
        observations: formValue.observations || null,
        details: formValue.details || [],
      };
      this.allMovements.update(m => [...m, newMovement]);
    } else {
      this.allMovements.update(m => m.map(mov => 
        mov.id === formValue.id 
        ? { ...mov, 
            date: formValue.date!, 
            type: formValue.type!, 
            warehouseId: formValue.warehouseId!,
            movementWarehouseId: formValue.movementWarehouseId || null,
            providerId: formValue.providerId || null,
            branchId: formValue.branchId || null,
            docTypeId: formValue.docTypeId || null,
            docNum: formValue.docNum || null,
            exchangeRate: formValue.exchangeRate || null,
            purchaseOrderId: formValue.purchaseOrderId || null,
            bpaId: formValue.bpaId || null,
            observations: formValue.observations || null,
            details: formValue.details || [],
          }
        : mov
      ));
    }
    this.closePanel();
  }
  
  openConfirmationModal(movement: WarehouseMovement, mode: 'process' | 'cancel' | 'delete'): void {
    this.movementToConfirm.set(movement);
    this.confirmationMode.set(mode);
  }

  closeConfirmationModal = () => {
    this.movementToConfirm.set(null);
    this.confirmationMode.set(null);
  }

  confirmAction(): void {
    const movement = this.movementToConfirm();
    const mode = this.confirmationMode();
    if (!movement || !mode) return;

    if (mode === 'delete') {
      this.allMovements.update(m => m.filter(mov => mov.id !== movement.id));
    } else {
      const newStatus: MovementStatus = mode === 'process' ? 'Procesado' : 'Anulado';
      this.allMovements.update(m => m.map(mov => 
        mov.id === movement.id ? { ...mov, status: newStatus } : mov
      ));
    }
    this.closeConfirmationModal();
  }

  closePanel = () => {
    this.isPanelOpen.set(false);
    this.formType.set(null);
    this.formCompanyId.set(null);
  };
}
