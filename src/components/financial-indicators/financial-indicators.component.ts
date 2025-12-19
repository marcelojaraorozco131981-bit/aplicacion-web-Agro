import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

interface FinancialIndicator {
  date: string; // YYYY-MM-DD
  dolar: number | null;
  euro: number | null;
  uf: number | null;
  utm: number | null;
  ipc: number | null;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasData: boolean;
}

@Component({
  selector: 'app-financial-indicators',
  templateUrl: './financial-indicators.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class FinancialIndicatorsComponent {
  private fb = inject(FormBuilder);

  // --- State ---
  allIndicators = signal<FinancialIndicator[]>([
    { date: this.formatDate(new Date(2024, 6, 1)), dolar: 940.1, euro: 1010.5, uf: 37520.1, utm: 65770, ipc: 0.1 },
    { date: this.formatDate(new Date(2024, 6, 15)), dolar: 942.3, euro: 1015.2, uf: 37522.5, utm: 65770, ipc: null },
    { date: this.formatDate(new Date(2024, 5, 28)), dolar: 938.5, euro: 1005.0, uf: 37515.0, utm: 65770, ipc: 0.2 },
  ]);
  
  currentDate = signal(new Date());
  selectedDate = signal<Date | null>(null);

  isPanelOpen = signal(false);
  isSaving = signal(false);
  saveSuccess = signal(false);

  // --- Form ---
  indicatorForm = this.fb.group({
    date: ['', Validators.required],
    dolar: [null as number | null, [Validators.min(0)]],
    euro: [null as number | null, [Validators.min(0)]],
    uf: [null as number | null, [Validators.min(0)]],
    utm: [null as number | null, [Validators.min(0)]],
    ipc: [null as number | null],
  });

  monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  weekDayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); 
    const prevMonthLastDate = new Date(year, month, 0);
    const prevMonthDays = prevMonthLastDate.getDate();
    const daysFromPrevMonth = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    for (let i = daysFromPrevMonth; i > 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i + 1);
      days.push({ date: d, isCurrentMonth: false, isToday: false, hasData: !!this.findIndicatorForDate(d) });
    }
    
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDayOfMonth; i++) {
        const d = new Date(year, month, i);
        days.push({ date: d, isCurrentMonth: true, isToday: d.getTime() === today.getTime(), hasData: !!this.findIndicatorForDate(d) });
    }
    
    const nextMonthDays = 42 - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
        const d = new Date(year, month + 1, i);
        days.push({ date: d, isCurrentMonth: false, isToday: false, hasData: !!this.findIndicatorForDate(d) });
    }
    
    return days;
  });

  // --- Calendar Navigation ---
  previousMonth = () => this.currentDate.update(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  nextMonth = () => this.currentDate.update(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  goToToday = () => this.currentDate.set(new Date());

  changeMonth(event: Event): void {
    const month = Number((event.target as HTMLSelectElement).value);
    this.currentDate.update(d => new Date(d.getFullYear(), month, 1));
  }

  changeYear(event: Event): void {
    const year = Number((event.target as HTMLInputElement).value);
    if(year > 1900 && year < 2200) {
      this.currentDate.update(d => new Date(year, d.getMonth(), 1));
    }
  }

  // --- Panel and Form Logic ---
  selectDate(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;

    this.selectedDate.set(day.date);
    const dateString = this.formatDate(day.date);
    const existingData = this.findIndicatorForDate(day.date);
    
    this.indicatorForm.reset();
    this.indicatorForm.patchValue({
      date: dateString,
      dolar: existingData?.dolar || null,
      euro: existingData?.euro || null,
      uf: existingData?.uf || null,
      utm: existingData?.utm || null,
      ipc: existingData?.ipc || null,
    });

    this.isPanelOpen.set(true);
  }
  
  closePanel(): void {
    this.isPanelOpen.set(false);
    this.selectedDate.set(null);
  }

  saveIndicator(): void {
    if (this.indicatorForm.invalid) {
      return;
    }

    this.isSaving.set(true);
    this.saveSuccess.set(false);

    const formValue = this.indicatorForm.value;
    const dateKey = formValue.date!;

    const newIndicator: FinancialIndicator = {
      date: dateKey,
      dolar: formValue.dolar || null,
      euro: formValue.euro || null,
      uf: formValue.uf || null,
      utm: formValue.utm || null,
      ipc: formValue.ipc || null,
    };

    this.allIndicators.update(currentIndicators => {
      const existingIndex = currentIndicators.findIndex(i => i.date === dateKey);
      if (existingIndex > -1) {
        const updated = [...currentIndicators];
        updated[existingIndex] = newIndicator;
        return updated;
      }
      return [...currentIndicators, newIndicator];
    });

    // Simulate API call
    setTimeout(() => {
      this.isSaving.set(false);
      this.saveSuccess.set(true);
      this.indicatorForm.markAsPristine();
      setTimeout(() => {
        this.saveSuccess.set(false);
        this.closePanel();
      }, 1000);
    }, 1500);
  }


  // --- Helper Methods ---
  private findIndicatorForDate(date: Date): FinancialIndicator | undefined {
    const dateString = this.formatDate(date);
    return this.allIndicators().find(i => i.date === dateString);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
