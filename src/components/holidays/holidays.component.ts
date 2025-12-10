import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface Holiday {
  date: string; // YYYY-MM-DD
  description: string;
  isActive: boolean;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  holiday?: Holiday;
}

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class HolidaysComponent {
  private fb = inject(FormBuilder);

  holidays = signal<Holiday[]>([
    { date: '2024-01-01', description: 'Año Nuevo', isActive: true },
    { date: '2024-05-01', description: 'Día del Trabajador', isActive: true },
    { date: '2024-07-16', description: 'Día de la Virgen del Carmen', isActive: true },
    { date: '2024-09-18', description: 'Independencia Nacional', isActive: false },
    { date: '2024-09-19', description: 'Glorias del Ejército', isActive: true },
    { date: '2024-12-25', description: 'Navidad', isActive: true },
  ]);
  
  viewMode = signal<'calendar' | 'list'>('calendar');
  currentDate = signal(new Date());

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<Holiday | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  sortColumn = signal<keyof Holiday>('date');
  sortDirection = signal<'asc' | 'desc'>('asc');

  sortedHolidays = computed(() => {
    const list = this.holidays();
    const column = this.sortColumn();
    const direction = this.sortDirection();
    return [...list].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
      let comparison = String(aValue).localeCompare(String(bValue));
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  calendarData = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; i > 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i + 1),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const dateString = this.formatDate(currentDate);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: currentDate.getTime() === today.getTime(),
        holiday: this.holidays().find(h => h.date === dateString),
      });
    }

    // Next month's days
    const remainingCells = 42 - days.length; // 6 weeks grid
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false,
      });
    }
    return days;
  });

  holidayForm = this.fb.group({
    date: ['', Validators.required],
    description: ['', Validators.required],
  });

  openNewPanel(): void {
    this.formMode.set('new');
    this.holidayForm.reset();
    this.holidayForm.get('date')?.enable();
    this.holidayForm.get('date')?.setValidators([Validators.required, this.dateExistsValidator.bind(this)]);
    this.holidayForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: Holiday): void {
    this.formMode.set('edit');
    this.holidayForm.reset();
    this.holidayForm.patchValue(item);
    this.holidayForm.get('date')?.disable();
    this.holidayForm.get('date')?.clearValidators();
    this.holidayForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveHoliday(): void {
    if (this.holidayForm.invalid) return;

    const formValue = this.holidayForm.getRawValue();

    if (this.formMode() === 'new') {
      const newItem: Holiday = {
        date: formValue.date!,
        description: formValue.description!,
        isActive: true
      };
      this.holidays.update(items => [...items, newItem]);
    } else {
      this.holidays.update(items => 
        items.map(item => item.date === formValue.date ? { ...item, description: formValue.description! } : item)
      );
    }
    this.closePanel();
  }

  openVigenciaModal(item: Holiday): void {
    this.itemToToggleVigencia.set(item);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const itemToToggle = this.itemToToggleVigencia();
    if (itemToToggle) {
      this.holidays.update(items => 
        items.map(item => item.date === itemToToggle.date ? { ...item, isActive: !item.isActive } : item)
      );
      this.closeConfirmModal();
    }
  }
  
  previousMonth = () => this.currentDate.update(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  nextMonth = () => this.currentDate.update(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  goToToday = () => this.currentDate.set(new Date());

  closePanel = () => this.isPanelOpen.set(false);
  closeConfirmModal = () => { this.isConfirmModalOpen.set(false); this.itemToToggleVigencia.set(null); };
  
  onSort(column: keyof Holiday): void {
    if (this.sortColumn() === column) this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    else { this.sortColumn.set(column); this.sortDirection.set('asc'); }
  }

  dateExistsValidator(control: AbstractControl): ValidationErrors | null {
    const date = control.value;
    return this.holidays().some(item => item.date === date) ? { dateExists: true } : null;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['Fecha', 'Descripción', 'Vigencia']];
    const body = this.sortedHolidays().map(item => [item.date, item.description, item.isActive ? 'Vigente' : 'No Vigente']);

    doc.setFontSize(18);
    doc.text('Reporte de Feriados', 14, 22);

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
    doc.save('Reporte_Feriados.pdf');
  }
}