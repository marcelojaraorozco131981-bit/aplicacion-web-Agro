import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Interfaces
interface Company {
  id: number;
  name: string;
}

interface Region {
    id: number;
    name: string;
}

interface Commune {
    id: number;
    regionId: number;
    name: string;
}

interface Farm {
  companyId: number;
  farmCode: number;
  description: string;
  address: string;
  regionCode: number;
  communeCode: number;
  isActive: boolean;
}


@Component({
  selector: 'app-farms',
  templateUrl: './farms.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class FarmsComponent {
  private fb = inject(FormBuilder);

  // --- Master Data ---
  companies = signal<Company[]>([
    { id: 1, name: 'Agrícola San José' },
    { id: 2, name: 'Exportadora del Valle' }
  ]);

  regions = signal<Region[]>([
      {id: 1, name: 'Región de Valparaíso'},
      {id: 2, name: 'Región Metropolitana'},
      {id: 3, name: 'Región de O\'Higgins'}
  ]);
  communes = signal<Commune[]>([
      {id: 101, regionId: 1, name: 'Quillota'},
      {id: 102, regionId: 1, name: 'La Cruz'},
      {id: 201, regionId: 2, name: 'Maipú'},
      {id: 301, regionId: 3, name: 'Rancagua'},
      {id: 302, regionId: 3, name: 'Rengo'},
  ]);
  
  // --- State ---
  allFarms = signal<Farm[]>([
    { companyId: 1, farmCode: 101, description: 'Fundo El Roble', address: 'Camino El Roble Km. 5', regionCode: 1, communeCode: 101, isActive: true },
    { companyId: 1, farmCode: 102, description: 'Fundo La Palma', address: 'Parcela 23, La Palma', regionCode: 1, communeCode: 102, isActive: true },
    { companyId: 2, farmCode: 201, description: 'Fundo Central', address: 'Av. Principal 123', regionCode: 3, communeCode: 301, isActive: false },
  ]);

  selectedCompanyId = signal<number | null>(null);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  farmToToggleVigencia = signal<Farm | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  sortColumn = signal<keyof Farm>('farmCode');
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  // --- Computed Properties ---
  selectedCompanyName = computed(() => {
    const companyId = this.selectedCompanyId();
    if (!companyId) return '';
    return this.companies().find(c => c.id === companyId)?.name || '';
  });

  filteredFarms = computed(() => {
      const companyId = this.selectedCompanyId();
      if (!companyId) return [];
      return this.allFarms().filter(f => f.companyId === companyId);
  });

  sortedFarms = computed(() => {
    const farmsList = this.filteredFarms();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return [...farmsList].sort((a, b) => {
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

  // --- Form ---
  farmForm = this.fb.group({
    companyId: [null as number | null, Validators.required],
    farmCode: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    description: ['', Validators.required],
    address: ['', Validators.required],
    regionCode: [null as number | null, [Validators.required, Validators.pattern('^[0-9]+$')]],
    communeCode: [null as number | null, [Validators.required, Validators.pattern('^[0-9]+$')]],
  });

  // --- Methods ---
  onCompanyChange(event: Event): void {
      const selectedId = (event.target as HTMLSelectElement).value;
      this.selectedCompanyId.set(selectedId ? Number(selectedId) : null);
  }

  openNewPanel(): void {
    this.formMode.set('new');
    this.farmForm.reset();
    this.farmForm.get('farmCode')?.enable();
    this.farmForm.get('companyId')?.enable();
    this.farmForm.patchValue({ companyId: this.selectedCompanyId() });
    this.farmForm.get('farmCode')?.setValidators([
      Validators.required, 
      Validators.pattern('^[0-9]+$'),
      this.codeExistsValidator.bind(this)
    ]);
    this.farmForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(farm: Farm): void {
    this.formMode.set('edit');
    this.farmForm.reset();
    this.farmForm.patchValue(farm);
    this.farmForm.get('farmCode')?.disable();
    this.farmForm.get('companyId')?.disable();
    this.farmForm.get('farmCode')?.clearValidators();
    this.farmForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveFarm(): void {
    if (this.farmForm.invalid) {
      this.farmForm.markAllAsTouched();
      return;
    }

    const formValue = this.farmForm.getRawValue();
    const companyId = Number(formValue.companyId);

    if (this.formMode() === 'new') {
      const newFarm: Farm = {
        companyId: companyId,
        farmCode: Number(formValue.farmCode),
        description: formValue.description || '',
        address: formValue.address || '',
        regionCode: Number(formValue.regionCode),
        communeCode: Number(formValue.communeCode),
        isActive: true
      };
      this.allFarms.update(farms => [...farms, newFarm]);
    } else {
      this.allFarms.update(farms => 
        farms.map(f => 
          f.farmCode === formValue.farmCode && f.companyId === companyId 
          ? { ...f, 
              description: formValue.description || '',
              address: formValue.address || '',
              regionCode: Number(formValue.regionCode),
              communeCode: Number(formValue.communeCode),
            } 
          : f
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(farm: Farm): void {
    this.farmToToggleVigencia.set(farm);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const farmToToggle = this.farmToToggleVigencia();
    if (farmToToggle) {
      this.allFarms.update(farms => 
        farms.map(f => 
          f.farmCode === farmToToggle.farmCode && f.companyId === farmToToggle.companyId 
          ? { ...f, isActive: !f.isActive } 
          : f
        )
      );
      this.closeConfirmModal();
    }
  }

  closePanel = () => this.isPanelOpen.set(false);
  closeConfirmModal = () => { this.isConfirmModalOpen.set(false); this.farmToToggleVigencia.set(null); };
  
  onSort(column: keyof Farm): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const companyId = this.farmForm?.get('companyId')?.value;
    if (!companyId) return null;
    const codeExists = this.allFarms().some(f => f.companyId === companyId && f.farmCode === code);
    return codeExists ? { codeExists: true } : null;
  }
  
  getRegionName(id: number): string {
    return this.regions().find(r => r.id === id)?.name || 'N/A';
  }

  getCommuneName(id: number): string {
    return this.communes().find(c => c.id === id)?.name || 'N/A';
  }

  async exportToPdf(): Promise<void> {
    if (!this.selectedCompanyId()) return;

    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['Código', 'Descripción', 'Dirección', 'Región', 'Comuna', 'Vigencia']];
    const body = this.sortedFarms().map(f => [
        f.farmCode, 
        f.description, 
        f.address,
        `${f.regionCode} - ${this.getRegionName(f.regionCode)}`,
        `${f.communeCode} - ${this.getCommuneName(f.communeCode)}`,
        f.isActive ? 'Vigente' : 'No Vigente'
    ]);

    doc.setFontSize(18);
    doc.text(`Reporte de Fundos - ${this.selectedCompanyName()}`, 14, 22);

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

    doc.save(`Reporte_Fundos_${this.selectedCompanyName().replace(' ', '_')}.pdf`);
  }
}
