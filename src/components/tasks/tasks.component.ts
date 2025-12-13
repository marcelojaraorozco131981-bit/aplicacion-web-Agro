import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface Task {
  code: number;
  description: string;
  isActive: boolean;
}

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class TasksComponent {
  private fb = inject(FormBuilder);

  tasks = signal<Task[]>([
    { code: 101, description: 'Preparación de Suelo', isActive: true },
    { code: 102, description: 'Siembra Directa', isActive: true },
    { code: 103, description: 'Mantención de Cercos', isActive: false },
    { code: 104, description: 'Control de Malezas', isActive: true },
  ]);

  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  taskToToggleVigencia = signal<Task | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  // Sorting state
  sortColumn = signal<'code' | 'description' | 'isActive'>('code');
  sortDirection = signal<'asc' | 'desc'>('asc');

  sortedTasks = computed(() => {
    const tasksList = this.tasks();
    const column = this.sortColumn();
    const direction = this.sortDirection();

    return [...tasksList].sort((a, b) => {
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

  taskForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    description: ['', Validators.required]
  });

  openNewPanel(): void {
    this.formMode.set('new');
    this.taskForm.reset();
    this.taskForm.get('code')?.enable();
    this.taskForm.get('code')?.setValidators([
      Validators.required, 
      Validators.pattern('^[0-9]+$'),
      this.codeExistsValidator.bind(this)
    ]);
    this.taskForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(task: Task): void {
    this.formMode.set('edit');
    this.taskForm.reset();
    this.taskForm.patchValue(task);
    this.taskForm.get('code')?.disable();
    this.taskForm.get('code')?.clearValidators();
    this.taskForm.get('code')?.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveTask(): void {
    if (this.taskForm.invalid) {
      return;
    }

    const formValue = this.taskForm.getRawValue();

    if (this.formMode() === 'new') {
      const newTask: Task = {
        code: Number(formValue.code),
        description: formValue.description || '',
        isActive: true
      };
      this.tasks.update(tasks => [...tasks, newTask]);
    } else {
      this.tasks.update(tasks => 
        tasks.map(tsk => 
          tsk.code === formValue.code ? { ...tsk, description: formValue.description || '' } : tsk
        )
      );
    }
    this.closePanel();
  }

  openVigenciaModal(task: Task): void {
    this.taskToToggleVigencia.set(task);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const taskToToggle = this.taskToToggleVigencia();
    if (taskToToggle) {
      this.tasks.update(tasks => 
        tasks.map(tsk => 
          tsk.code === taskToToggle.code ? { ...tsk, isActive: !tsk.isActive } : tsk
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
    this.taskToToggleVigencia.set(null);
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
    const codeExists = this.tasks().some(task => task.code === code);
    return codeExists ? { codeExists: true } : null;
  }

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['Código', 'Descripción', 'Vigencia']];
    const body = this.sortedTasks().map(tsk => [tsk.code, tsk.description, tsk.isActive ? 'Vigente' : 'No Vigente']);

    // Title
    doc.setFontSize(18);
    doc.text('Reporte de Faenas', 14, 22);

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

    doc.save('Reporte_Faenas.pdf');
  }
}
