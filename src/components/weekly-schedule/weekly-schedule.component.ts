import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface WeeklySchedule {
  code: number;
  description: string;
  hoursMonday: number;
  hoursTuesday: number;
  hoursWednesday: number;
  hoursThursday: number;
  hoursFriday: number;
  hoursSaturday: number;
  hoursSunday: number;
  isActive: boolean;
}

@Component({
  selector: 'app-weekly-schedule',
  templateUrl: './weekly-schedule.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class WeeklyScheduleComponent {
  private fb = inject(FormBuilder);

  schedules = signal<WeeklySchedule[]>([
    { code: 1, description: 'Semana Completa (L-V)', hoursMonday: 9, hoursTuesday: 9, hoursWednesday: 9, hoursThursday: 9, hoursFriday: 9, hoursSaturday: 0, hoursSunday: 0, isActive: true },
    { code: 2, description: 'Media Jornada (L-S)', hoursMonday: 4.5, hoursTuesday: 4.5, hoursWednesday: 4.5, hoursThursday: 4.5, hoursFriday: 4.5, hoursSaturday: 4.5, hoursSunday: 0, isActive: true },
    { code: 3, description: 'Turno Noche', hoursMonday: 8, hoursTuesday: 8, hoursWednesday: 8, hoursThursday: 8, hoursFriday: 8, hoursSaturday: 8, hoursSunday: 8, isActive: false },
  ]);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<WeeklySchedule | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  sortColumn = signal<keyof WeeklySchedule | 'totalHours'>('code');
  sortDirection = signal<'asc' | 'desc'>('asc');

  schedulesWithTotals = computed(() => {
    return this.schedules().map(s => ({
      ...s,
      totalHours: s.hoursMonday + s.hoursTuesday + s.hoursWednesday + s.hoursThursday + s.hoursFriday + s.hoursSaturday + s.hoursSunday
    }));
  });

  sortedSchedules = computed(() => {
    const list = this.schedulesWithTotals();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return [...list].sort((a, b) => {
      const aValue = a[column as keyof typeof a];
      const bValue = b[column as keyof typeof b];
      
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

  scheduleForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    description: ['', Validators.required],
    hoursMonday: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
    hoursTuesday: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
    hoursWednesday: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
    hoursThursday: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
    hoursFriday: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
    hoursSaturday: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
    hoursSunday: [0, [Validators.required, Validators.min(0), Validators.max(24)]],
  });

  openNewPanel(): void {
    this.formMode.set('new');
    this.scheduleForm.reset({
        hoursMonday: 0, hoursTuesday: 0, hoursWednesday: 0, hoursThursday: 0, hoursFriday: 0, hoursSaturday: 0, hoursSunday: 0
    });
    this.scheduleForm.get('code')?.enable();
    this.scheduleForm.get('code')?.setValidators([
      Validators.required, 
      Validators.pattern('^[0-9]+$'),
      this.codeExistsValidator.bind(this)
    ]);
    this.scheduleForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: WeeklySchedule): void {
    this.formMode.set('edit');
    this.scheduleForm.reset();
    this.scheduleForm.patchValue(item);
    this.scheduleForm.get('code')?.disable();
    this.scheduleForm.get('code')?.clearValidators();
    this.scheduleForm.get('code')?.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveSchedule(): void {
    if (this.scheduleForm.invalid) {
      return;
    }

    const formValue = this.scheduleForm.getRawValue();

    if (this.formMode() === 'new') {
      const newItem: WeeklySchedule = {
        code: Number(formValue.code),
        description: formValue.description || '',
        hoursMonday: formValue.hoursMonday!,
        hoursTuesday: formValue.hoursTuesday!,
        hoursWednesday: formValue.hoursWednesday!,
        hoursThursday: formValue.hoursThursday!,
        hoursFriday: formValue.hoursFriday!,
        hoursSaturday: formValue.hoursSaturday!,
        hoursSunday: formValue.hoursSunday!,
        isActive: true
      };
      this.schedules.update(items => [...items, newItem]);
    } else {
      this.schedules.update(items => 
        items.map(item => 
          item.code === formValue.code ? { 
            ...item, 
            description: formValue.description || '',
            hoursMonday: formValue.hoursMonday!,
            hoursTuesday: formValue.hoursTuesday!,
            hoursWednesday: formValue.hoursWednesday!,
            hoursThursday: formValue.hoursThursday!,
            hoursFriday: formValue.hoursFriday!,
            hoursSaturday: formValue.hoursSaturday!,
            hoursSunday: formValue.hoursSunday!,
          } : item
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(item: WeeklySchedule): void {
    this.itemToToggleVigencia.set(item);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const itemToToggle = this.itemToToggleVigencia();
    if (itemToToggle) {
      this.schedules.update(items => 
        items.map(item => 
          item.code === itemToToggle.code ? { ...item, isActive: !item.isActive } : item
        )
      );
      this.closeConfirmModal();
    }
  }

  closePanel = () => this.isPanelOpen.set(false);
  closeConfirmModal = () => { this.isConfirmModalOpen.set(false); this.itemToToggleVigencia.set(null); };
  
  onSort(column: keyof WeeklySchedule | 'totalHours'): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.schedules().some(item => item.code === code);
    return codeExists ? { codeExists: true } : null;
  }

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['Código', 'Descripción', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom', 'Total', 'Vigencia']];
    const body = this.sortedSchedules().map(item => [
      item.code,
      item.description,
      item.hoursMonday,
      item.hoursTuesday,
      item.hoursWednesday,
      item.hoursThursday,
      item.hoursFriday,
      item.hoursSaturday,
      item.hoursSunday,
      item.totalHours,
      item.isActive ? 'Vigente' : 'No Vigente'
    ]);

    doc.setFontSize(18);
    doc.text('Reporte de Horarios Semanales', 14, 22);

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

    doc.save('Reporte_Horarios_Semanales.pdf');
  }
}
