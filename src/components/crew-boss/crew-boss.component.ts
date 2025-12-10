import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface CrewBoss {
  code: number;
  description: string;
  rut: string;
  isActive: boolean;
}

@Component({
  selector: 'app-crew-boss',
  templateUrl: './crew-boss.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class CrewBossComponent {
  private fb = inject(FormBuilder);

  crewBosses = signal<CrewBoss[]>([
    { code: 1, description: 'Juan Pérez', rut: '12.345.678-9', isActive: true },
    { code: 2, description: 'Ana López', rut: '9.876.543-2', isActive: true },
    { code: 3, description: 'Pedro Martinez', rut: '15.111.222-K', isActive: false },
  ]);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<CrewBoss | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  sortColumn = signal<keyof CrewBoss>('code');
  sortDirection = signal<'asc' | 'desc'>('asc');

  sortedCrewBosses = computed(() => {
    const list = this.crewBosses();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return [...list].sort((a, b) => {
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

  crewBossForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    description: ['', Validators.required],
    rut: ['', [Validators.required, CrewBossComponent.rutValidator]],
  });

  openNewPanel(): void {
    this.formMode.set('new');
    this.crewBossForm.reset();
    this.crewBossForm.get('code')?.enable();
    this.crewBossForm.get('code')?.setValidators([
      Validators.required, 
      Validators.pattern(/^[0-9]+$/),
      this.codeExistsValidator.bind(this)
    ]);
    this.crewBossForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: CrewBoss): void {
    this.formMode.set('edit');
    this.crewBossForm.reset();
    this.crewBossForm.patchValue(item);
    this.crewBossForm.get('code')?.disable();
    this.crewBossForm.get('code')?.clearValidators();
    this.crewBossForm.get('code')?.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveItem(): void {
    if (this.crewBossForm.invalid) {
      return;
    }

    const formValue = this.crewBossForm.getRawValue();

    if (this.formMode() === 'new') {
      const newItem: CrewBoss = {
        code: Number(formValue.code),
        description: formValue.description || '',
        rut: formValue.rut || '',
        isActive: true
      };
      this.crewBosses.update(items => [...items, newItem]);
    } else {
      this.crewBosses.update(items => 
        items.map(item => 
          item.code === formValue.code ? { 
            ...item, 
            description: formValue.description || '',
            rut: formValue.rut || ''
          } : item
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(item: CrewBoss): void {
    this.itemToToggleVigencia.set(item);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const itemToToggle = this.itemToToggleVigencia();
    if (itemToToggle) {
      this.crewBosses.update(items => 
        items.map(item => 
          item.code === itemToToggle.code ? { ...item, isActive: !item.isActive } : item
        )
      );
      this.closeConfirmModal();
    }
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen.set(false);
    this.itemToToggleVigencia.set(null);
  }
  
  onSort(column: keyof CrewBoss): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.crewBosses().some(item => item.code === code);
    return codeExists ? { codeExists: true } : null;
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
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['Código', 'Descripción', 'RUT', 'Vigencia']];
    const body = this.sortedCrewBosses().map(item => [
      item.code,
      item.description,
      item.rut,
      item.isActive ? 'Vigente' : 'No Vigente'
    ]);

    doc.setFontSize(18);
    doc.text('Reporte de Jefes de Cuadrilla', 14, 22);

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

    doc.save('Reporte_Jefes_Cuadrilla.pdf');
  }
}
