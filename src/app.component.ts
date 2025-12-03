import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { WarehousesComponent } from './components/warehouses/warehouses.component';
import { PurchaseOrdersComponent } from './components/purchase-orders/purchase-orders.component';
import { AccountingComponent } from './components/accounting/accounting.component';
import { PayrollComponent } from './components/payroll/payroll.component';
import { PlantComponent } from './components/plant/plant.component';
import { ExportsComponent } from './components/exports/exports.component';
import { BudgetComponent } from './components/budget/budget.component';
import { ContractorsComponent } from './components/contractors/contractors.component';
import { BpaComponent } from './components/bpa/bpa.component';
import { UsersComponent } from './components/users/users.component';
import { ParametersComponent } from './components/parameters/parameters.component';

interface Module {
  id: string;
  name: string;
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
    PayrollComponent,
    PlantComponent,
    ExportsComponent,
    BudgetComponent,
    ContractorsComponent,
    BpaComponent,
    UsersComponent,
    ParametersComponent
  ]
})
export class AppComponent {
  isSidebarOpen = signal(true);
  selectedModuleId = signal('dashboard');

  modules: Module[] = [
    { id: 'dashboard', name: 'Gestión' },
    { id: 'warehouses', name: 'Bodegas' },
    { id: 'purchase-orders', name: 'Órdenes de Compra' },
    { id: 'accounting', name: 'Contabilidad' },
    { id: 'payroll', name: 'Remuneraciones' },
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
}