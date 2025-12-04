import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { WarehousesComponent } from './components/warehouses/warehouses.component';
import { PurchaseOrdersComponent } from './components/purchase-orders/purchase-orders.component';
import { AccountingComponent } from './components/accounting/accounting.component';
import { PlantComponent } from './components/plant/plant.component';
import { ExportsComponent } from './components/exports/exports.component';
import { BudgetComponent } from './components/budget/budget.component';
import { ContractorsComponent } from './components/contractors/contractors.component';
import { BpaComponent } from './components/bpa/bpa.component';
import { UsersComponent } from './components/users/users.component';
import { ParametersComponent } from './components/parameters/parameters.component';
import { PayrollActivitiesComponent } from './components/payroll-activities/payroll-activities.component';
import { GeneralTablesComponent } from './components/general-tables/general-tables.component';

interface NavItem {
  id: string;
  name: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DashboardComponent,
    WarehousesComponent,
    PurchaseOrdersComponent,
    AccountingComponent,
    PlantComponent,
    ExportsComponent,
    BudgetComponent,
    ContractorsComponent,
    BpaComponent,
    UsersComponent,
    ParametersComponent,
    PayrollActivitiesComponent,
    GeneralTablesComponent
  ]
})
export class AppComponent {
  isSidebarOpen = signal(true);
  selectedModuleId = signal('dashboard');
  openSubmenuIds = signal<Record<string, boolean>>({});

  modules: NavItem[] = [
    { id: 'dashboard', name: 'Gestión' },
    { id: 'warehouses', name: 'Bodegas' },
    { id: 'purchase-orders', name: 'Órdenes de Compra' },
    { id: 'accounting', name: 'Contabilidad' },
    {
      id: 'payroll-group',
      name: 'Remuneraciones',
      children: [
        {
          id: 'payroll-parameters-group',
          name: 'Parametros Remu',
          children: [
            { id: 'payroll-activities', name: 'Actividades' },
            { id: 'general-tables', name: 'Tablas Generales' },
          ],
        },
      ],
    },
    { id: 'plant', name: 'Planta' },
    { id: 'exports', name: 'Exportaciones' },
    { id: 'budget', name: 'Presupuesto' },
    { id: 'contractors', name: 'Contratistas' },
    { id: 'users', name: 'Usuarios' },
    { id: 'parameters', name: 'Parámetros Generales' },
    { id: 'bpa', name: 'BPA' }
  ];

  toggleSidebar(): void {
    this.isSidebarOpen.update(open => !open);
  }

  selectModule(moduleId: string): void {
    this.selectedModuleId.set(moduleId);
  }

  toggleSubmenu(moduleId: string): void {
    this.openSubmenuIds.update(ids => ({
      ...ids,
      [moduleId]: !ids[moduleId],
    }));
  }

  isSubmenuActive(module: NavItem): boolean {
    if (!module.children) return false;
    
    const checkActive = (items: NavItem[]): boolean => {
      for (const item of items) {
        if (item.id === this.selectedModuleId()) {
          return true;
        }
        if (item.children && checkActive(item.children)) {
          return true;
        }
      }
      return false;
    };

    return checkActive(module.children);
  }
}