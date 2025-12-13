import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Interfaces
interface Company {
  id: number;
  name: string;
}

interface Farm {
  companyId: number;
  farmCode: number;
  description: string;
}

interface LegalRepresentative {
  companyId: number;
  farmCode: number;
  code: number;
  name: string;
  rut: string;
  position: string;
  isActive: boolean;
}

@Component({
  selector: 'app-legal-representative',
  templateUrl: './legal-representative.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LegalRepresentativeComponent {
  private fb = inject(FormBuilder);

  // --- Master Data (simulated) ---
  companies = signal<Company[]>([
    { id: 1, name: 'Agrícola San José' },
    { id: 2, name: 'Exportadora del Valle' }
  ]);

  allFarms = signal<Farm[]>([
    { companyId: 1, farmCode: 101, description: 'Fundo El Roble' },
    { companyId: 1, farmCode: 102, description: 'Fundo La Palma' },
    { companyId: 2, farmCode: 201, description: 'Fundo Central' },
  ]);

  // --- State ---
  allRepresentatives = signal<LegalRepresentative[]>([
    { companyId: 1, farmCode: 101, code: 1, name: 'Juan Ignacio Pérez', rut: '12.345.678-9', position: 'Gerente General', isActive: true },
    { companyId: 1, farmCode: 101, code: 2, name: 'María Fernanda Rojas', rut: '9.876.543-2', position: 'Apoderado', isActive: true },
    { companyId: 2, farmCode: 201, code: 3, name: 'Carlos Alberto Soto', rut: '11.222.333-4', position: 'Gerente de Operaciones', isActive: false },
  ]);

  selectedCompanyId = signal<number | null>(null);
  selectedFundoId = signal<number | null>(null);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<LegalRepresentative | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  sortColumn = signal<keyof LegalRepresentative>('code');
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  // --- Computed Properties ---
  filteredFarms = computed(() => {
    const companyId = this.selectedCompanyId();
    if (!companyId) return [];
    return this.allFarms().filter(f => f.companyId === companyId);
  });
  
  filteredRepresentatives = computed(() => {
    const companyId = this.selectedCompanyId();
    const fundoId = this.selectedFundoId();
    if (!companyId || !fundoId) return [];
    return this.allRepresentatives().filter(r => r.companyId === companyId && r.farmCode === fundoId);
  });

  sortedRepresentatives = computed(() => {
    const list = this.filteredRepresentatives();
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
  representativeForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    name: ['', Validators.required],
    rut: ['', [Validators.required, LegalRepresentativeComponent.rutValidator]],
    position: ['', Validators.required],
  });

  // --- Methods ---
  onCompanyChange(event: Event): void {
    const selectedId = (event.target as HTMLSelectElement).value;
    this.selectedCompanyId.set(selectedId ? Number(selectedId) : null);
    this.selectedFundoId.set(null); // Reset fundo selection
  }

  onFundoChange(event: Event): void {
    const selectedId = (event.target as HTMLSelectElement).value;
    this.selectedFundoId.set(selectedId ? Number(selectedId) : null);
  }

  openNewPanel(): void {
    this.formMode.set('new');
    this.representativeForm.reset();
    this.representativeForm.get('code')?.enable();
    this.representativeForm.get('code')?.setValidators([Validators.required, Validators.pattern('^[0-9]+$'), this.codeExistsValidator.bind(this)]);
    this.representativeForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: LegalRepresentative): void {
    this.formMode.set('edit');
    this.representativeForm.reset();
    this.representativeForm.patchValue({ name: item.name, rut: item.rut, position: item.position, code: item.code });
    this.representativeForm.get('code')?.disable();
    this.representativeForm.get('code')?.clearValidators();
    this.representativeForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveRepresentative(): void {
    if (this.representativeForm.invalid || !this.selectedCompanyId() || !this.selectedFundoId()) {
      return;
    }

    const formValue = this.representativeForm.getRawValue();
    const companyId = this.selectedCompanyId()!;
    const farmCode = this.selectedFundoId()!;

    if (this.formMode() === 'new') {
      const newItem: LegalRepresentative = {
        companyId,
        farmCode,
        code: Number(formValue.code),
        name: formValue.name || '',
        rut: formValue.rut || '',
        position: formValue.position || '',
        isActive: true
      };
      this.allRepresentatives.update(items => [...items, newItem]);
    } else {
      this.allRepresentatives.update(items => 
        items.map(item => 
          item.code === formValue.code && item.companyId === companyId && item.farmCode === farmCode
          ? { ...item, name: formValue.name || '', rut: formValue.rut || '', position: formValue.position || '' } 
          : item
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(item: LegalRepresentative): void {
    this.itemToToggleVigencia.set(item);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const itemToToggle = this.itemToToggleVigencia();
    if (itemToToggle) {
      this.allRepresentatives.update(items => 
        items.map(item => 
          item.code === itemToToggle.code && item.companyId === itemToToggle.companyId && item.farmCode === itemToToggle.farmCode
          ? { ...item, isActive: !item.isActive } 
          : item
        )
      );
      this.closeConfirmModal();
    }
  }

  closePanel = () => this.isPanelOpen.set(false);
  closeConfirmModal = () => { this.isConfirmModalOpen.set(false); this.itemToToggleVigencia.set(null); };
  
  onSort(column: keyof LegalRepresentative): void {
    if (this.sortColumn() === column) this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    else { this.sortColumn.set(column); this.sortDirection.set('asc'); }
  }

  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const exists = this.filteredRepresentatives().some(r => r.code === code);
    return exists ? { codeExists: true } : null;
  }

  static rutValidator(control: AbstractControl): ValidationErrors | null {
    const rut = control.value;
    if (!rut) return null;
    
    let valor = rut.replace(/\./g, '').replace('-', '');
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1).toUpperCase();
    
    if(!/^[0-9]+[0-9kK]{1}$/.test(valor)) return { rutInvalid: true };
    
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


  async exportToPdf(): Promise<void> {
    if (!this.selectedCompanyId() || !this.selectedFundoId()) return;

    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const companyName = this.companies().find(c => c.id === this.selectedCompanyId())?.name;
    const farmName = this.allFarms().find(f => f.farmCode === this.selectedFundoId())?.description;

    const doc = new jsPDF();
    const head = [['Código', 'Nombre', 'RUT', 'Cargo', 'Vigencia']];
    const body = this.sortedRepresentatives().map(r => [
        r.code, 
        r.name, 
        r.rut,
        r.position,
        r.isActive ? 'Vigente' : 'No Vigente'
    ]);

    doc.setFontSize(18);
    doc.text(`Rep. Legales - ${companyName} / ${farmName}`, 14, 22);

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

    doc.save(`Reporte_Rep_Legales_${companyName?.replace(' ', '_')}.pdf`);
  }
}
