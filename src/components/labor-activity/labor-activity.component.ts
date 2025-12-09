import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaces based on other components
interface Activity {
  code: number;
  description: string;
  isActive: boolean;
}

interface Task {
  code: number;
  description: string;
  isActive: boolean;
}

interface LaborActivityAssociation {
  activityCode: number;
  taskCode: number;
}

@Component({
  selector: 'app-labor-activity',
  templateUrl: './labor-activity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class LaborActivityComponent {
  // --- Master Data (simulated from other components) ---
  allActivities = signal<Activity[]>([
    { code: 1, description: 'Cosecha de Manzanas', isActive: true },
    { code: 2, description: 'Poda de Cerezos', isActive: false },
    { code: 3, description: 'Riego por Goteo', isActive: true },
    { code: 4, description: 'Aplicación de Fertilizantes', isActive: true },
  ]);

  allTasks = signal<Task[]>([
    { code: 101, description: 'Preparación de Suelo', isActive: true },
    { code: 102, description: 'Siembra Directa', isActive: true },
    { code: 103, description: 'Mantención de Cercos', isActive: false },
    { code: 104, description: 'Control de Malezas', isActive: true },
    { code: 105, description: 'Recolección Manual', isActive: true },
  ]);

  // --- State ---
  associations = signal<LaborActivityAssociation[]>([
    { activityCode: 1, taskCode: 105 },
    { activityCode: 1, taskCode: 101 },
    { activityCode: 3, taskCode: 102 },
  ]);

  viewMode = signal<'activity' | 'task'>('activity');
  
  selectedMasterItem = signal<Activity | Task | null>(null);

  isAddModalOpen = signal(false);
  itemToDelete = signal<{ master: Activity | Task, detail: Activity | Task } | null>(null);
  isConfirmDeleteOpen = signal(false);
  
  // --- Computed Properties ---
  masterList = computed(() => {
    return this.viewMode() === 'activity' ? this.allActivities() : this.allTasks();
  });

  detailList = computed(() => {
    const selected = this.selectedMasterItem();
    if (!selected) return [];

    if (this.viewMode() === 'activity') {
      const selectedActivity = selected as Activity;
      const associatedTaskCodes = this.associations()
        .filter(a => a.activityCode === selectedActivity.code)
        .map(a => a.taskCode);
      return this.allTasks().filter(t => associatedTaskCodes.includes(t.code));
    } else {
      const selectedTask = selected as Task;
      const associatedActivityCodes = this.associations()
        .filter(a => a.taskCode === selectedTask.code)
        .map(a => a.activityCode);
      return this.allActivities().filter(act => associatedActivityCodes.includes(act.code));
    }
  });
  
  availableItemsForAssociation = computed(() => {
    const selected = this.selectedMasterItem();
    if (!selected) return [];

    const associatedIds = this.detailList().map(item => item.code);
    
    if (this.viewMode() === 'activity') {
      return this.allTasks().filter(task => !associatedIds.includes(task.code) && task.isActive);
    } else {
      return this.allActivities().filter(activity => !associatedIds.includes(activity.code) && activity.isActive);
    }
  });


  // --- Methods ---
  setViewMode(mode: 'activity' | 'task'): void {
    this.viewMode.set(mode);
    this.selectedMasterItem.set(null);
  }

  selectMasterItem(item: Activity | Task): void {
    this.selectedMasterItem.set(item);
  }

  openAddModal(): void {
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  addAssociation(itemToAdd: Activity | Task): void {
    const masterItem = this.selectedMasterItem();
    if (!masterItem) return;

    let newAssociation: LaborActivityAssociation;
    if (this.viewMode() === 'activity') {
      newAssociation = { activityCode: masterItem.code, taskCode: itemToAdd.code };
    } else {
      newAssociation = { activityCode: itemToAdd.code, taskCode: masterItem.code };
    }
    
    this.associations.update(assocs => [...assocs, newAssociation]);
    this.closeAddModal();
  }
  
  openDeleteModal(detailItem: Activity | Task): void {
    const masterItem = this.selectedMasterItem();
    if (masterItem) {
      this.itemToDelete.set({ master: masterItem, detail: detailItem });
      this.isConfirmDeleteOpen.set(true);
    }
  }

  closeDeleteModal(): void {
    this.isConfirmDeleteOpen.set(false);
    this.itemToDelete.set(null);
  }

  confirmDeleteAssociation(): void {
    const toDelete = this.itemToDelete();
    if (!toDelete) return;

    let activityCode: number, taskCode: number;

    if (this.viewMode() === 'activity') {
      activityCode = toDelete.master.code;
      taskCode = toDelete.detail.code;
    } else {
      activityCode = toDelete.detail.code;
      taskCode = toDelete.master.code;
    }

    this.associations.update(assocs => 
      assocs.filter(a => !(a.activityCode === activityCode && a.taskCode === taskCode))
    );

    this.closeDeleteModal();
  }
}
