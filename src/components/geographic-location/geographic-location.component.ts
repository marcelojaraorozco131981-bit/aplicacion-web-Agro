import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Interfaces
interface Commune {
  code: number;
  name: string;
  isActive: boolean;
}

interface Region {
  code: number;
  name: string;
  isActive: boolean;
  communes: Commune[];
}

@Component({
  selector: 'app-geographic-location',
  templateUrl: './geographic-location.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class GeographicLocationComponent {
  private fb = inject(FormBuilder);

  // --- State ---
  regions = signal<Region[]>([
    { code: 1, name: 'Región de Valparaíso', isActive: true, communes: [
        { code: 101, name: 'Quillota', isActive: true },
        { code: 102, name: 'La Cruz', isActive: false },
    ] },
    { code: 2, name: 'Región Metropolitana', isActive: true, communes: [
        { code: 201, name: 'Maipú', isActive: true },
        { code: 202, name: 'Puente Alto', isActive: true },
    ] },
    { code: 3, name: 'Región de O\'Higgins', isActive: false, communes: [] },
  ]);

  selectedRegion = signal<Region | null>(null);

  // Region state
  isRegionPanelOpen = signal(false);
  isRegionConfirmModalOpen = signal(false);
  regionToToggleVigencia = signal<Region | null>(null);
  regionFormMode = signal<'new' | 'edit'>('new');
  
  // Commune state
  isCommunePanelOpen = signal(false);
  isCommuneConfirmModalOpen = signal(false);
  communeToToggleVigencia = signal<Commune | null>(null);
  communeFormMode = signal<'new' | 'edit'>('new');

  // --- Forms ---
  regionForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    name: ['', Validators.required],
  });

  communeForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    name: ['', Validators.required],
  });

  // --- Methods ---
  
  // Region Methods
  selectRegion(region: Region): void {
    this.selectedRegion.set(region);
  }

  openNewRegionPanel(): void {
    this.regionFormMode.set('new');
    this.regionForm.reset();
    this.regionForm.get('code')?.enable();
    this.regionForm.get('code')?.setValidators([Validators.required, Validators.pattern('^[0-9]+$'), this.regionCodeExistsValidator.bind(this)]);
    this.regionForm.updateValueAndValidity();
    this.isRegionPanelOpen.set(true);
  }

  openEditRegionPanel(region: Region): void {
    this.regionFormMode.set('edit');
    this.regionForm.reset();
    this.regionForm.patchValue(region);
    this.regionForm.get('code')?.disable();
    this.regionForm.get('code')?.clearValidators();
    this.regionForm.updateValueAndValidity();
    this.isRegionPanelOpen.set(true);
  }

  saveRegion(): void {
    if (this.regionForm.invalid) return;
    const formValue = this.regionForm.getRawValue();

    if (this.regionFormMode() === 'new') {
      const newRegion: Region = {
        code: Number(formValue.code),
        name: formValue.name!,
        isActive: true,
        communes: [],
      };
      this.regions.update(regions => [...regions, newRegion].sort((a,b) => a.code - b.code));
    } else {
      this.regions.update(regions => 
        regions.map(r => r.code === formValue.code ? { ...r, name: formValue.name! } : r)
      );
    }
    this.closeRegionPanel();
  }

  openRegionVigenciaModal(region: Region): void {
    this.regionToToggleVigencia.set(region);
    this.isRegionConfirmModalOpen.set(true);
  }

  confirmToggleRegionVigencia(): void {
    const regionToToggle = this.regionToToggleVigencia();
    if (regionToToggle) {
      this.regions.update(regions => regions.map(r => r.code === regionToToggle.code ? { ...r, isActive: !r.isActive } : r));
      if (this.selectedRegion()?.code === regionToToggle.code) {
        this.selectedRegion.set(null);
      }
    }
    this.closeRegionConfirmModal();
  }

  closeRegionPanel = () => this.isRegionPanelOpen.set(false);
  closeRegionConfirmModal = () => { this.isRegionConfirmModalOpen.set(false); this.regionToToggleVigencia.set(null); };

  regionCodeExistsValidator(control: AbstractControl): ValidationErrors | null {
    return this.regions().some(r => r.code === Number(control.value)) ? { codeExists: true } : null;
  }
  
  // Commune Methods
  openNewCommunePanel(): void {
    this.communeFormMode.set('new');
    this.communeForm.reset();
    this.communeForm.get('code')?.enable();
    this.communeForm.get('code')?.setValidators([Validators.required, Validators.pattern('^[0-9]+$'), this.communeCodeExistsValidator.bind(this)]);
    this.communeForm.updateValueAndValidity();
    this.isCommunePanelOpen.set(true);
  }
  
  openEditCommunePanel(commune: Commune): void {
    this.communeFormMode.set('edit');
    this.communeForm.reset();
    this.communeForm.patchValue(commune);
    this.communeForm.get('code')?.disable();
    this.communeForm.get('code')?.clearValidators();
    this.communeForm.updateValueAndValidity();
    this.isCommunePanelOpen.set(true);
  }

  saveCommune(): void {
    if (this.communeForm.invalid || !this.selectedRegion()) return;
    const formValue = this.communeForm.getRawValue();
    const regionCode = this.selectedRegion()!.code;

    if (this.communeFormMode() === 'new') {
      const newCommune: Commune = {
        code: Number(formValue.code),
        name: formValue.name!,
        isActive: true,
      };
      this.regions.update(regions => regions.map(r => r.code === regionCode ? { ...r, communes: [...r.communes, newCommune].sort((a,b) => a.code - b.code) } : r));
    } else {
      this.regions.update(regions => regions.map(r => r.code === regionCode ? { ...r, communes: r.communes.map(c => c.code === formValue.code ? { ...c, name: formValue.name! } : c) } : r));
    }
    const updatedRegion = this.regions().find(r => r.code === regionCode);
    if(updatedRegion) this.selectedRegion.set(updatedRegion);
    this.closeCommunePanel();
  }
  
  openCommuneVigenciaModal(commune: Commune): void {
    this.communeToToggleVigencia.set(commune);
    this.isCommuneConfirmModalOpen.set(true);
  }

  confirmToggleCommuneVigencia(): void {
    const communeToToggle = this.communeToToggleVigencia();
    const regionCode = this.selectedRegion()?.code;
    if (communeToToggle && regionCode) {
      this.regions.update(regions => regions.map(r => r.code === regionCode ? { ...r, communes: r.communes.map(c => c.code === communeToToggle.code ? { ...c, isActive: !c.isActive } : c) } : r));
      const updatedRegion = this.regions().find(r => r.code === regionCode);
      if(updatedRegion) this.selectedRegion.set(updatedRegion);
    }
    this.closeCommuneConfirmModal();
  }

  closeCommunePanel = () => this.isCommunePanelOpen.set(false);
  closeCommuneConfirmModal = () => { this.isCommuneConfirmModalOpen.set(false); this.communeToToggleVigencia.set(null); };

  communeCodeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.selectedRegion()?.communes.some(c => c.code === code);
    return codeExists ? { codeExists: true } : null;
  }
  
  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    let currentY = 22;

    doc.setFontSize(18);
    doc.text('Reporte de Ubicaciones Geográficas', 14, currentY);
    currentY += 12;

    this.regions().sort((a, b) => a.code - b.code).forEach(region => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129); // Emerald color
      doc.text(`Región: ${region.code} - ${region.name}`, 14, currentY);
      currentY += 7;
      
      doc.setFontSize(10);
      doc.setTextColor(40);
      doc.text(`Vigencia: ${region.isActive ? 'Vigente' : 'No Vigente'}`, 14, currentY);
      currentY += 10;

      if (region.communes.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['Cód. Comuna', 'Nombre', 'Vigencia']],
          body: region.communes.map(commune => [
            commune.code,
            commune.name,
            commune.isActive ? 'Vigente' : 'No Vigente'
          ]),
          theme: 'grid',
          headStyles: { fillColor: [74, 85, 104] },
          margin: { left: 14, right: 14 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 12;
      } else {
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text('Sin comunas registradas para esta región.', 14, currentY);
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

    doc.save('Reporte_Ubicaciones_Geograficas.pdf');
  }
}
