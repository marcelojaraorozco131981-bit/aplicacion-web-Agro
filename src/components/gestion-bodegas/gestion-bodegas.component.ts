import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Interfaces
interface Company { id: number; name: string; }
interface StorageLevel { code: number; name: string; isActive: boolean; }
interface Warehouse {
  companyId: number;
  code: number;
  name: string;
  isActive: boolean;
  levels: StorageLevel[];
}

@Component({
  selector: 'app-gestion-bodegas',
  templateUrl: './gestion-bodegas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class GestionBodegasComponent {
  private fb = inject(FormBuilder);

  companies = signal<Company[]>([{ id: 1, name: 'Agrícola San José' }, { id: 2, name: 'Exportadora del Valle' }]);
  
  allWarehouses = signal<Warehouse[]>([
    { companyId: 1, code: 1, name: 'Bodega Principal', isActive: true, levels: [
        { code: 10, name: 'Pasillo A', isActive: true }, 
        { code: 20, name: 'Pasillo B', isActive: false },
        { code: 30, name: 'Pasillo C', isActive: true }
    ] },
    { companyId: 1, code: 2, name: 'Bodega Fitosanitarios', isActive: true, levels: [
        { code: 1, name: 'Estante Químicos', isActive: true },
        { code: 2, name: 'Área de Mezcla', isActive: true },
        { code: 3, name: 'Almacén de Seguridad', isActive: true }
    ] },
    { companyId: 2, code: 5, name: 'Bodega Central Export', isActive: false, levels: [
        { code: 1, name: 'Andén 1', isActive: true },
        { code: 2, name: 'Andén 2', isActive: true },
        { code: 3, name: 'Cámara de Frío 1', isActive: true }
    ] },
  ]);

  selectedCompanyId = signal<number | null>(null);
  selectedWarehouse = signal<Warehouse | null>(null);

  isWarehousePanelOpen = signal(false);
  isWarehouseConfirmModalOpen = signal(false);
  warehouseToToggleVigencia = signal<Warehouse | null>(null);
  warehouseFormMode = signal<'new' | 'edit'>('new');
  isWarehouseDeleteModalOpen = signal(false);
  warehouseToDelete = signal<Warehouse | null>(null);

  isLevelPanelOpen = signal(false);
  isLevelConfirmModalOpen = signal(false);
  levelToToggleVigencia = signal<StorageLevel | null>(null);
  levelFormMode = signal<'new' | 'edit'>('new');
  isLevelDeleteModalOpen = signal(false);
  levelToDelete = signal<StorageLevel | null>(null);


  filteredWarehouses = computed(() => this.allWarehouses().filter(w => w.companyId === this.selectedCompanyId()));
  warehouseForm = this.fb.group({ code: [0, [Validators.required, Validators.pattern('^[0-9]+$')]], name: ['', Validators.required] });
  levelForm = this.fb.group({ code: [0, [Validators.required, Validators.pattern('^[0-9]+$')]], name: ['', Validators.required] });

  onCompanyChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedCompanyId.set(id ? Number(id) : null);
    this.selectedWarehouse.set(null);
  }

  selectWarehouse(warehouse: Warehouse): void { this.selectedWarehouse.set(warehouse); }

  // Warehouse Methods
  openNewWarehousePanel(): void {
    this.warehouseFormMode.set('new'); this.warehouseForm.reset(); this.warehouseForm.get('code')?.enable();
    this.warehouseForm.get('code')?.setValidators([Validators.required, this.warehouseCodeExistsValidator.bind(this)]);
    this.isWarehousePanelOpen.set(true);
  }
  openEditWarehousePanel(warehouse: Warehouse): void {
    this.warehouseFormMode.set('edit'); this.warehouseForm.patchValue(warehouse); this.warehouseForm.get('code')?.disable();
    this.isWarehousePanelOpen.set(true);
  }
  saveWarehouse(): void {
    if (this.warehouseForm.invalid || !this.selectedCompanyId()) return;
    const formValue = this.warehouseForm.getRawValue();
    if (this.warehouseFormMode() === 'new') {
      const newWarehouse: Warehouse = { companyId: this.selectedCompanyId()!, code: Number(formValue.code), name: formValue.name!, isActive: true, levels: [] };
      this.allWarehouses.update(ws => [...ws, newWarehouse]);
    } else {
      this.allWarehouses.update(ws => ws.map(w => w.code === formValue.code && w.companyId === this.selectedCompanyId() ? { ...w, name: formValue.name! } : w));
    }
    this.closeWarehousePanel();
  }
  openWarehouseVigenciaModal(warehouse: Warehouse): void {
    this.warehouseToToggleVigencia.set(warehouse); this.isWarehouseConfirmModalOpen.set(true);
  }
  confirmToggleWarehouseVigencia(): void {
    const item = this.warehouseToToggleVigencia();
    if (item) {
      this.allWarehouses.update(ws => ws.map(w => w.code === item.code && w.companyId === item.companyId ? { ...w, isActive: !w.isActive } : w));
      if (this.selectedWarehouse()?.code === item.code) this.selectedWarehouse.set(null);
    }
    this.closeWarehouseConfirmModal();
  }
  
  openWarehouseDeleteModal(warehouse: Warehouse): void {
    this.warehouseToDelete.set(warehouse);
    this.isWarehouseDeleteModalOpen.set(true);
  }

  confirmDeleteWarehouse(): void {
    const warehouse = this.warehouseToDelete();
    if (warehouse) {
      this.allWarehouses.update(ws => ws.filter(w => w.code !== warehouse.code || w.companyId !== warehouse.companyId));
      if (this.selectedWarehouse()?.code === warehouse.code) {
        this.selectedWarehouse.set(null);
      }
    }
    this.closeWarehouseDeleteModal();
  }
  
  closeWarehousePanel = () => this.isWarehousePanelOpen.set(false);
  closeWarehouseConfirmModal = () => { this.isWarehouseConfirmModalOpen.set(false); this.warehouseToToggleVigencia.set(null); };
  closeWarehouseDeleteModal = () => { this.isWarehouseDeleteModalOpen.set(false); this.warehouseToDelete.set(null); };
  warehouseCodeExistsValidator = (c: AbstractControl) => this.filteredWarehouses().some(w => w.code === Number(c.value)) ? { codeExists: true } : null;

  // Level Methods
  openNewLevelPanel(): void {
    this.levelFormMode.set('new'); this.levelForm.reset(); this.levelForm.get('code')?.enable();
    this.levelForm.get('code')?.setValidators([Validators.required, this.levelCodeExistsValidator.bind(this)]);
    this.isLevelPanelOpen.set(true);
  }
  openEditLevelPanel(level: StorageLevel): void {
    this.levelFormMode.set('edit'); this.levelForm.patchValue(level); this.levelForm.get('code')?.disable();
    this.isLevelPanelOpen.set(true);
  }
  saveLevel(): void {
    if (this.levelForm.invalid || !this.selectedWarehouse()) return;
    const formValue = this.levelForm.getRawValue();
    const warehouseCode = this.selectedWarehouse()!.code;
    const companyId = this.selectedCompanyId()!;
    if (this.levelFormMode() === 'new') {
      const newLevel: StorageLevel = { code: Number(formValue.code), name: formValue.name!, isActive: true };
      this.allWarehouses.update(ws => ws.map(w => w.code === warehouseCode && w.companyId === companyId ? { ...w, levels: [...w.levels, newLevel] } : w));
    } else {
      this.allWarehouses.update(ws => ws.map(w => w.code === warehouseCode && w.companyId === companyId ? { ...w, levels: w.levels.map(l => l.code === formValue.code ? { ...l, name: formValue.name! } : l) } : w));
    }
    this.selectedWarehouse.set(this.allWarehouses().find(w => w.code === warehouseCode && w.companyId === companyId) || null);
    this.closeLevelPanel();
  }
  openLevelVigenciaModal(level: StorageLevel): void {
    this.levelToToggleVigencia.set(level); this.isLevelConfirmModalOpen.set(true);
  }
  confirmToggleLevelVigencia(): void {
    const item = this.levelToToggleVigencia();
    const warehouseCode = this.selectedWarehouse()?.code;
    const companyId = this.selectedCompanyId()!;
    if (item && warehouseCode) {
      this.allWarehouses.update(ws => ws.map(w => w.code === warehouseCode && w.companyId === companyId ? { ...w, levels: w.levels.map(l => l.code === item.code ? { ...l, isActive: !l.isActive } : l) } : w));
      this.selectedWarehouse.set(this.allWarehouses().find(w => w.code === warehouseCode && w.companyId === companyId) || null);
    }
    this.closeLevelConfirmModal();
  }

  openLevelDeleteModal(level: StorageLevel): void {
    this.levelToDelete.set(level);
    this.isLevelDeleteModalOpen.set(true);
  }

  confirmDeleteLevel(): void {
    const level = this.levelToDelete();
    const warehouseCode = this.selectedWarehouse()?.code;
    const companyId = this.selectedCompanyId()!;
    if (level && warehouseCode) {
      this.allWarehouses.update(ws => ws.map(w => 
        w.code === warehouseCode && w.companyId === companyId 
        ? { ...w, levels: w.levels.filter(l => l.code !== level.code) } 
        : w
      ));
      this.selectedWarehouse.set(this.allWarehouses().find(w => w.code === warehouseCode && w.companyId === companyId) || null);
    }
    this.closeLevelDeleteModal();
  }

  closeLevelPanel = () => this.isLevelPanelOpen.set(false);
  closeLevelConfirmModal = () => { this.isLevelConfirmModalOpen.set(false); this.levelToToggleVigencia.set(null); };
  closeLevelDeleteModal = () => { this.isLevelDeleteModalOpen.set(false); this.levelToDelete.set(null); };
  levelCodeExistsValidator = (c: AbstractControl) => this.selectedWarehouse()?.levels.some(l => l.code === Number(c.value)) ? { codeExists: true } : null;
}
