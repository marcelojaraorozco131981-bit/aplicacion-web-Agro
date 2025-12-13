import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface Activity {
  code: number;
  description: string;
  isActive: boolean;
}

@Component({
  selector: 'app-payroll-activities',
  templateUrl: './payroll-activities.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class PayrollActivitiesComponent {
  private fb = inject(FormBuilder);

  activities = signal<Activity[]>([
    { code: 1, description: 'Cosecha de Manzanas', isActive: true },
    { code: 3, description: 'Riego por Goteo', isActive: true },
    { code: 2, description: 'Poda de Cerezos', isActive: false },
    { code: 4, description: 'Aplicación de Fertilizantes', isActive: true },
  ]);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  activityToToggleVigencia = signal<Activity | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  // Sorting state
  sortColumn = signal<'code' | 'description' | 'isActive'>('code');
  sortDirection = signal<'asc' | 'desc'>('asc');

  sortedActivities = computed(() => {
    const activitiesList = this.activities();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return [...activitiesList].sort((a, b) => {
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

  activityForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    description: ['', Validators.required]
  });

  openNewPanel(): void {
    this.formMode.set('new');
    this.activityForm.reset();
    this.activityForm.get('code')?.enable();
    this.activityForm.get('code')?.setValidators([
      Validators.required, 
      Validators.pattern('^[0-9]+$'),
      this.codeExistsValidator.bind(this)
    ]);
    this.activityForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(activity: Activity): void {
    this.formMode.set('edit');
    this.activityForm.reset();
    this.activityForm.patchValue(activity);
    this.activityForm.get('code')?.disable();
    this.activityForm.get('code')?.clearValidators();
    this.activityForm.get('code')?.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveActivity(): void {
    if (this.activityForm.invalid) {
      return;
    }

    const formValue = this.activityForm.getRawValue();

    if (this.formMode() === 'new') {
      const newActivity: Activity = {
        code: Number(formValue.code),
        description: formValue.description || '',
        isActive: true
      };
      this.activities.update(activities => [...activities, newActivity]);
    } else {
      this.activities.update(activities => 
        activities.map(act => 
          act.code === formValue.code ? { ...act, description: formValue.description || '' } : act
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(activity: Activity): void {
    this.activityToToggleVigencia.set(activity);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const activityToToggle = this.activityToToggleVigencia();
    if (activityToToggle) {
      this.activities.update(activities => 
        activities.map(act => 
          act.code === activityToToggle.code ? { ...act, isActive: !act.isActive } : act
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
    this.activityToToggleVigencia.set(null);
  }
  
  onSort(column: 'code' | 'description' | 'isActive'): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  // Custom Validator
  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.activities().some(activity => activity.code === code);
    return codeExists ? { codeExists: true } : null;
  }

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['Código', 'Descripción', 'Vigencia']];
    const body = this.sortedActivities().map(act => [act.code, act.description, act.isActive ? 'Vigente' : 'No Vigente']);

    // Title
    doc.setFontSize(18);
    doc.text('Reporte de Actividades', 14, 22);

    autoTable(doc, {
      startY: 30,
      head: head,
      body: body,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }, // Tailwind emerald-500
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

    doc.save('Reporte_Actividades.pdf');
  }
}
