import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Interfaces
interface Region {
    id: number;
    name: string;
}

interface Commune {
    id: number;
    regionId: number;
    name: string;
}

interface Company {
  id: number;
  rut: string;
  name: string;
  address: string;
  regionCode: number;
  communeCode: number;
  phone: string;
  email: string;
  isActive: boolean;
}

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class CompaniesComponent {
  private fb = inject(FormBuilder);

  // --- Master Data ---
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
  companies = signal<Company[]>([
    { id: 1, rut: '76.123.456-7', name: 'Agrícola San José', address: 'Av. Principal 123', regionCode: 1, communeCode: 101, phone: '+56912345678', email: 'contacto@sanjose.cl', isActive: true },
    { id: 2, rut: '77.987.654-3', name: 'Exportadora del Valle', address: 'Camino El Sol 456', regionCode: 3, communeCode: 301, phone: '+56987654321', email: 'info@delvalle.cl', isActive: false },
  ]);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  companyToToggleVigencia = signal<Company | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  sortColumn = signal<keyof Company>('id');
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  // --- Computed Properties ---
  sortedCompanies = computed(() => {
    const companiesList = this.companies();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return [...companiesList].sort((a, b) => {
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

  filteredCommunes = computed(() => {
      const regionId = this.companyForm.get('regionCode')?.value;
      if(!regionId) return [];
      return this.communes().filter(c => c.regionId === Number(regionId));
  });

  // --- Form ---
  companyForm = this.fb.group({
    id: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    rut: ['', [Validators.required, CompaniesComponent.rutValidator]],
    name: ['', Validators.required],
    address: ['', Validators.required],
    regionCode: [null as number | null, Validators.required],
    communeCode: [{value: null as number | null, disabled: true}, Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    this.companyForm.get('regionCode')?.valueChanges.subscribe(regionId => {
      const communeControl = this.companyForm.get('communeCode');
      communeControl?.reset();
      if (regionId) {
        communeControl?.enable();
      } else {
        communeControl?.disable();
      }
    });
  }

  openNewPanel(): void {
    this.formMode.set('new');
    this.companyForm.reset();
    this.companyForm.get('id')?.enable();
    this.companyForm.get('id')?.setValidators([Validators.required, Validators.pattern('^[0-9]+$'), this.idExistsValidator.bind(this)]);
    this.companyForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(company: Company): void {
    this.formMode.set('edit');
    this.companyForm.reset();
    this.companyForm.patchValue(company);
    this.companyForm.get('id')?.disable();
    this.companyForm.get('id')?.clearValidators();
    this.companyForm.get('communeCode')?.enable();
    this.companyForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveCompany(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    const formValue = this.companyForm.getRawValue();

    if (this.formMode() === 'new') {
      const newCompany: Company = {
        id: Number(formValue.id),
        rut: formValue.rut!,
        name: formValue.name!,
        address: formValue.address!,
        regionCode: Number(formValue.regionCode),
        communeCode: Number(formValue.communeCode),
        phone: formValue.phone!,
        email: formValue.email!,
        isActive: true
      };
      this.companies.update(companies => [...companies, newCompany]);
    } else {
      this.companies.update(companies => 
        companies.map(c => 
          c.id === formValue.id 
          ? { ...c, ...this.companyForm.value, id: c.id, rut: formValue.rut! } as Company
          : c
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(company: Company): void {
    this.companyToToggleVigencia.set(company);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const companyToToggle = this.companyToToggleVigencia();
    if (companyToToggle) {
      this.companies.update(companies => 
        companies.map(c => 
          c.id === companyToToggle.id
          ? { ...c, isActive: !c.isActive } 
          : c
        )
      );
    }
    this.closeConfirmModal();
  }

  closePanel = () => this.isPanelOpen.set(false);
  closeConfirmModal = () => { this.isConfirmModalOpen.set(false); this.companyToToggleVigencia.set(null); };
  
  onSort(column: keyof Company): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  idExistsValidator(control: AbstractControl): ValidationErrors | null {
    const id = Number(control.value);
    const idExists = this.companies().some(c => c.id === id);
    return idExists ? { idExists: true } : null;
  }

  static rutValidator(control: AbstractControl): ValidationErrors | null {
    const rut = control.value;
    if (!rut) return null;
    let valor = rut.replace(/\./g, '').replace('-', '');
    if (!/^[0-9]+[0-9kK]{1}$/.test(valor)) return { rutInvalid: true };
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1).toUpperCase();
    let suma = 0;
    let multiplo = 2;
    for (let i = 1; i <= cuerpo.length; i++) {
      let index = multiplo * valor.charAt(cuerpo.length - i);
      suma = suma + index;
      if (multiplo < 7) { multiplo = multiplo + 1; } else { multiplo = 2; }
    }
    let dvEsperado = 11 - (suma % 11);
    let dvFinal = (dvEsperado === 11) ? '0' : (dvEsperado === 10) ? 'K' : dvEsperado.toString();
    return dvFinal === dv ? null : { rutInvalid: true };
  }

  getRegionName(id: number): string {
    return this.regions().find(r => r.id === id)?.name || 'N/A';
  }

  getCommuneName(id: number): string {
    return this.communes().find(c => c.id === id)?.name || 'N/A';
  }

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['ID', 'RUT', 'Nombre', 'Dirección', 'Región', 'Comuna', 'Vigencia']];
    const body = this.sortedCompanies().map(c => [
        c.id, 
        c.rut,
        c.name, 
        c.address,
        `${c.regionCode} - ${this.getRegionName(c.regionCode)}`,
        `${c.communeCode} - ${this.getCommuneName(c.communeCode)}`,
        c.isActive ? 'Vigente' : 'No Vigente'
    ]);

    doc.setFontSize(18);
    doc.text(`Reporte de Empresas`, 14, 22);

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

    doc.save(`Reporte_Empresas.pdf`);
  }
}