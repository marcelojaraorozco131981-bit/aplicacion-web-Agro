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
import { SettlementParametersComponent } from './components/settlement-parameters/settlement-parameters.component';
import { AssetsDiscountsComponent } from './components/assets-discounts/assets-discounts.component';
import { CompanySettlementParametersComponent } from './components/company-settlement-parameters/company-settlement-parameters.component';
import { UniqueTaxComponent } from './components/unique-tax/unique-tax.component';
import { FarmsComponent } from './components/farms/farms.component';
import { LaborComponent } from './components/labor/labor.component';
import { LaborActivityComponent } from './components/labor-activity/labor-activity.component';
import { ControlUnitsComponent } from './components/control-units/control-units.component';
import { LegalRepresentativeComponent } from './components/legal-representative/legal-representative.component';
import { FarmUserPermissionsComponent } from './components/farm-user-permissions/farm-user-permissions.component';
import { LaborAssetsDiscountsAssociationComponent } from './components/labor-assets-discounts-association/labor-assets-discounts-association.component';
import { WeeklyScheduleComponent } from './components/weekly-schedule/weekly-schedule.component';
import { AfpComponent } from './components/afp/afp.component';
import { HealthComponent } from './components/health/health.component';
import { ProvidentFundsComponent } from './components/provident-funds/provident-funds.component';
import { BankComponent } from './components/bank/bank.component';
import { PaymentMethodsComponent } from './components/payment-methods/payment-methods.component';
import { ResponsibilityCenterComponent } from './components/responsibility-center/responsibility-center.component';
import { CrewBossComponent } from './components/crew-boss/crew-boss.component';
import { TasksComponent } from './components/tasks/tasks.component';
import { HolidaysComponent } from './components/holidays/holidays.component';
import { AccountingParametersComponent } from './components/accounting-parameters/accounting-parameters.component';
import { ElectronicBookParametersComponent } from './components/electronic-book-parameters/electronic-book-parameters.component';
import { PersonalFileComponent } from './components/personal-file/personal-file.component';
import { OwnPersonnelLaborComponent } from './components/own-personnel-labor/own-personnel-labor.component';
import { PayrollProcessComponent } from './components/payroll-process/payroll-process.component';
import { SettlementsProcessComponent } from './components/settlements-process/settlements-process.component';
import { AccountingTransferProcessComponent } from './components/accounting-transfer-process/accounting-transfer-process.component';
import { MonthEndClosingProcessComponent } from './components/month-end-closing-process/month-end-closing-process.component';
import { SeasonsComponent } from './components/seasons/seasons.component';
import { GroupCostCenterReportsComponent } from './components/group-cost-center-reports/group-cost-center-reports.component';
import { MaintainKgBoxesByCcComponent } from './components/maintain-kg-boxes-by-cc/maintain-kg-boxes-by-cc.component';
import { LoadBudgetFromExcelComponent } from './components/load-budget-from-excel/load-budget-from-excel.component';
import { MaintainSeasonBudgetComponent } from './components/maintain-season-budget/maintain-season-budget.component';
import { SeasonBudgetReportComponent } from './components/season-budget-report/season-budget-report.component';
import { SeasonCostReportComponent } from './components/season-cost-report/season-cost-report.component';
import { CostTableComponent } from './components/cost-table/cost-table.component';
import { BudgetVsCostTableComponent } from './components/budget-vs-cost-table/budget-vs-cost-table.component';
import { BudgetaryControlComponent } from './components/budgetary-control/budgetary-control.component';
import { CompaniesComponent } from './components/companies/companies.component';
import { SpeciesVarietyComponent } from './components/species-variety/species-variety.component';
import { GeneralFarmsComponent } from './components/general-farms/general-farms.component';
import { LandTypesComponent } from './components/land-types/land-types.component';
import { CostCentersComponent } from './components/cost-centers/cost-centers.component';
import { GeographicLocationComponent } from './components/geographic-location/geographic-location.component';
import { FinancialIndicatorsComponent } from './components/financial-indicators/financial-indicators.component';
import { ProfileTypeComponent } from './components/profile-type/profile-type.component';
import { ProfilesComponent } from './components/profiles/profiles.component';


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
    GeneralTablesComponent,
    SettlementParametersComponent,
    AssetsDiscountsComponent,
    CompanySettlementParametersComponent,
    UniqueTaxComponent,
    FarmsComponent,
    LaborComponent,
    LaborActivityComponent,
    ControlUnitsComponent,
    LegalRepresentativeComponent,
    FarmUserPermissionsComponent,
    LaborAssetsDiscountsAssociationComponent,
    WeeklyScheduleComponent,
    AfpComponent,
    HealthComponent,
    ProvidentFundsComponent,
    BankComponent,
    PaymentMethodsComponent,
    ResponsibilityCenterComponent,
    CrewBossComponent,
    TasksComponent,
    HolidaysComponent,
    AccountingParametersComponent,
    ElectronicBookParametersComponent,
    PersonalFileComponent,
    OwnPersonnelLaborComponent,
    PayrollProcessComponent,
    SettlementsProcessComponent,
    AccountingTransferProcessComponent,
    MonthEndClosingProcessComponent,
    SeasonsComponent,
    GroupCostCenterReportsComponent,
    MaintainKgBoxesByCcComponent,
    LoadBudgetFromExcelComponent,
    MaintainSeasonBudgetComponent,
    SeasonBudgetReportComponent,
    SeasonCostReportComponent,
    CostTableComponent,
    BudgetVsCostTableComponent,
    BudgetaryControlComponent,
    CompaniesComponent,
    SpeciesVarietyComponent,
    GeneralFarmsComponent,
    LandTypesComponent,
    CostCentersComponent,
    GeographicLocationComponent,
    FinancialIndicatorsComponent,
    ProfileTypeComponent,
    ProfilesComponent,
  ],
})
export class AppComponent {
  isSidebarOpen = signal(true);
  selectedModuleId = signal('dashboard-overview');
  openSubmenuIds = signal<Record<string, boolean>>({});

  modules: NavItem[] = [
    {
      id: 'dashboard-group',
      name: 'Gestión',
      children: [
        { id: 'dashboard-overview', name: 'Resumen' },
        { id: 'seasons', name: 'Temporadas' },
        { id: 'group-cost-center-reports', name: 'Agrupar Centro de Costo Reportes' },
        { id: 'maintain-kg-boxes-by-cc', name: 'Mantencion Kilos Cajas por CC' },
        { id: 'load-budget-from-excel', name: 'Cargar Presupuesto desde Excel' },
        { id: 'maintain-season-budget', name: 'Mantencion Presupuesto Temporada' },
        { id: 'season-budget-report', name: 'Informe Presupuesto Temporada' },
        { id: 'season-cost-report', name: 'Informe de Costos Temporada' },
        { id: 'cost-table', name: 'Cuadro de Costos' },
        { id: 'budget-vs-cost-table', name: 'Cuadro Presupuesto vs Costos' },
        { id: 'budgetary-control', name: 'Control Presupuestario' },
      ]
    },
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
            { id: 'assets-discounts', name: 'Haberes y Descuentos' },
            { id: 'settlement-parameters', name: 'Parametros de Liquidacion' },
            { id: 'company-settlement-parameters', name: 'Parametros de Liquidacion Empresa' },
            { id: 'unique-tax', name: 'Impuesto Unico' },
            { id: 'farms', name: 'Fundos' },
            { id: 'labor', name: 'Labor' },
            { id: 'labor-activity', name: 'Actividad Labor' },
            { id: 'control-units', name: 'Unidades de Control' },
            { id: 'legal-representative', name: 'Representante Legal' },
            { id: 'farm-user-permissions', name: 'Permisos Usuario Fundo' },
            { id: 'labor-assets-discounts-association', name: 'Asociacion Labores Haberes Descuentos' },
            { id: 'weekly-schedule', name: 'Horario Semanal' },
            { id: 'afp', name: 'Afp' },
            { id: 'health', name: 'Salud' },
            { id: 'provident-funds', name: 'Cajas de Prevision' },
            { id: 'bank', name: 'Banco' },
            { id: 'payment-methods', name: 'Medios de Pago' },
            { id: 'responsibility-center', name: 'Centro de Responsabilidad' },
            { id: 'crew-boss', name: 'Jefe de Cuadrilla' },
            { id: 'tasks', name: 'Faenas' },
            { id: 'holidays', name: 'Feriados' },
            { id: 'accounting-parameters', name: 'Parametros Contabilizacion' },
            { id: 'electronic-book-parameters', name: 'Parametros Libro Electronico' },
          ],
        },
        {
          id: 'personal-group',
          name: 'Personal',
          children: [
            { id: 'personal-file', name: 'Ficha Personal' }
          ]
        },
        {
          id: 'own-personnel-labor-group',
          name: 'Mano de Obra Personal Propio',
          children: [
            { id: 'own-personnel-labor', name: 'Gestión' }
          ]
        },
        {
          id: 'payroll-process-group',
          name: 'Remuneraciones',
          children: [
            { id: 'payroll-process', name: 'Proceso' }
          ]
        },
        {
          id: 'settlements-process-group',
          name: 'Finiquitos',
          children: [
            { id: 'settlements-process', name: 'Proceso' }
          ]
        },
        {
          id: 'accounting-transfer-group',
          name: 'Traspaso Contable',
          children: [
            { id: 'accounting-transfer', name: 'Proceso' }
          ]
        },
        {
          id: 'month-end-closing-group',
          name: 'Cierre de Mes',
          children: [
            { id: 'month-end-closing', name: 'Proceso' }
          ]
        }
      ],
    },
    { id: 'plant', name: 'Planta' },
    { id: 'exports', name: 'Exportaciones' },
    { id: 'budget', name: 'Presupuesto' },
    { id: 'contractors', name: 'Contratistas' },
    {
      id: 'users-group',
      name: 'Usuarios',
      children: [
        { id: 'profile-type', name: 'Tipo Perfil' },
        { id: 'profiles', name: 'Perfiles' },
        { id: 'accounts', name: 'Cuentas' }
      ]
    },
    {
      id: 'parameters-group',
      name: 'Parámetros Generales',
      children: [
        { id: 'general-parameters', name: 'Configuración General'},
        { id: 'companies', name: 'Empresas'},
        { id: 'species-variety', name: 'Especie Variedad'},
        { id: 'general-farms', name: 'Fundos'},
        { id: 'land-types', name: 'Tipos de Terrenos'},
        { id: 'cost-centers', name: 'Centros de Costos'},
        { id: 'geographic-location', name: 'Ubicacion Geografica'},
        { id: 'financial-indicators', name: 'Indicadores Financieros'},
      ]
    },
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
