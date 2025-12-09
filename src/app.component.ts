import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
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
import { WarehouseParametersComponent } from './components/warehouse-parameters/warehouse-parameters.component';
import { WarehouseMovementsComponent } from './components/warehouse-movements/warehouse-movements.component';
import { WarehouseReportsComponent } from './components/warehouse-reports/warehouse-reports.component';
import { WarehouseAccountingTransferComponent } from './components/warehouse-accounting-transfer/warehouse-accounting-transfer.component';
import { WarehouseMonthEndClosingComponent } from './components/warehouse-month-end-closing/warehouse-month-end-closing.component';
import { MachineryComponent } from './components/machinery/machinery.component';
import { MachineryParametersComponent } from './components/machinery-parameters/machinery-parameters.component';
import { DailyMachineryLogComponent } from './components/daily-machinery-log/daily-machinery-log.component';
import { OtherProratableValuesComponent } from './components/other-proratable-values/other-proratable-values.component';
import { ProratableValuesReportComponent } from './components/proratable-values-report/proratable-values-report.component';
import { MonthlyProrationComponent } from './components/monthly-proration/monthly-proration.component';
import { MachineryReportsComponent } from './components/machinery-reports/machinery-reports.component';
import { MachineryAccountingTransferComponent } from './components/machinery-accounting-transfer/machinery-accounting-transfer.component';
import { PurchaseParametersComponent } from './components/purchase-parameters/purchase-parameters.component';
import { PurchaseRequestComponent } from './components/purchase-request/purchase-request.component';
import { PurchaseRequestReportComponent } from './components/purchase-request-report/purchase-request-report.component';
import { PurchaseOrderReportComponent } from './components/purchase-order-report/purchase-order-report.component';
import { CloseReactivatePoComponent } from './components/close-reactivate-po/close-reactivate-po.component';
import { PurchaseOrderApprovalComponent } from './components/purchase-order-approval/purchase-order-approval.component';
import { PoServiceReceptionComponent } from './components/po-service-reception/po-service-reception.component';
import { DepartmentUserReportComponent } from './components/department-user-report/department-user-report.component';
import { PendingPoReportComponent } from './components/pending-po-report/pending-po-report.component';
import { SupplierProductPriceReportComponent } from './components/supplier-product-price-report/supplier-product-price-report.component';
import { CostCenterDistributionReportComponent } from './components/cost-center-distribution-report/cost-center-distribution-report.component';
import { ProvidersComponent } from './components/providers/providers.component';
import { SalesComponent } from './components/sales/sales.component';
import { TreasuryComponent } from './components/treasury/treasury.component';
import { FixedAssetsComponent } from './components/fixed-assets/fixed-assets.component';
import { PlantParametersComponent } from './components/plant-parameters/plant-parameters.component';
import { BulkFruitComponent } from './components/bulk-fruit/bulk-fruit.component';
import { PackingComponent } from './components/packing/packing.component';
import { ColdStorageComponent } from './components/cold-storage/cold-storage.component';
import { QualityControlComponent } from './components/quality-control/quality-control.component';
import { PackagingControlComponent } from './components/packaging-control/packaging-control.component';
import { ExportParametersComponent } from './components/export-parameters/export-parameters.component';
import { SchedulingComponent } from './components/scheduling/scheduling.component';
import { ShipmentComponent } from './components/shipment/shipment.component';
import { ValuationComponent } from './components/valuation/valuation.component';
import { CommercialManagementAccountComponent } from './components/commercial-management-account/commercial-management-account.component';
import { ContractorParametersComponent } from './components/contractor-parameters/contractor-parameters.component';
import { ContractorFileComponent } from './components/contractor-file/contractor-file.component';
import { ContractEntryComponent } from './components/contract-entry/contract-entry.component';
import { PersonnelEnrollmentComponent } from './components/personnel-enrollment/personnel-enrollment.component';
import { PersonnelAttendanceComponent } from './components/personnel-attendance/personnel-attendance.component';
import { AttendanceReportComponent } from './components/attendance-report/attendance-report.component';
import { AgromovilComponent } from './components/agromovil/agromovil.component';
import { ProductionControlComponent } from './components/production-control/production-control.component';
import { ContractorProductionReportComponent } from './components/contractor-production-report/contractor-production-report.component';
import { ContractorCostReportComponent } from './components/contractor-cost-report/contractor-cost-report.component';
import { ContractorRevaluationComponent } from './components/contractor-revaluation/contractor-revaluation.component';
import { ContractorProformaInvoiceComponent } from './components/contractor-proforma-invoice/contractor-proforma-invoice.component';
import { ContractorMonthEndClosingComponent } from './components/contractor-month-end-closing/contractor-month-end-closing.component';
import { BpaParametersComponent } from './components/bpa-parameters/bpa-parameters.component';
import { ApplicationOrderPlanningComponent } from './components/application-order-planning/application-order-planning.component';
import { ApplicationOrderExecutionComponent } from './components/application-order-execution/application-order-execution.component';
import { OrdersCalendarComponent } from './components/orders-calendar/orders-calendar.component';
import { CloseOrdersComponent } from './components/close-orders/close-orders.component';
import { BpaReportsComponent } from './components/bpa-reports/bpa-reports.component';
import { RemuElectronicBookParametrizationComponent } from './components/remu-electronic-book-parametrization/remu-electronic-book-parametrization.component';


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
    WarehouseParametersComponent,
    WarehouseMovementsComponent,
    WarehouseReportsComponent,
    WarehouseAccountingTransferComponent,
    WarehouseMonthEndClosingComponent,
    MachineryComponent,
    MachineryParametersComponent,
    DailyMachineryLogComponent,
    OtherProratableValuesComponent,
    ProratableValuesReportComponent,
    MonthlyProrationComponent,
    MachineryReportsComponent,
    MachineryAccountingTransferComponent,
    PurchaseParametersComponent,
    PurchaseRequestComponent,
    PurchaseRequestReportComponent,
    PurchaseOrderReportComponent,
    CloseReactivatePoComponent,
    PurchaseOrderApprovalComponent,
    PoServiceReceptionComponent,
    DepartmentUserReportComponent,
    PendingPoReportComponent,
    SupplierProductPriceReportComponent,
    CostCenterDistributionReportComponent,
    ProvidersComponent,
    SalesComponent,
    TreasuryComponent,
    FixedAssetsComponent,
    PlantParametersComponent,
    BulkFruitComponent,
    PackingComponent,
    ColdStorageComponent,
    QualityControlComponent,
    PackagingControlComponent,
    ExportParametersComponent,
    SchedulingComponent,
    ShipmentComponent,
    ValuationComponent,
    CommercialManagementAccountComponent,
    ContractorParametersComponent,
    ContractorFileComponent,
    ContractEntryComponent,
    PersonnelEnrollmentComponent,
    PersonnelAttendanceComponent,
    AttendanceReportComponent,
    AgromovilComponent,
    ProductionControlComponent,
    ContractorProductionReportComponent,
    ContractorCostReportComponent,
    ContractorRevaluationComponent,
    ContractorProformaInvoiceComponent,
    ContractorMonthEndClosingComponent,
    BpaParametersComponent,
    ApplicationOrderPlanningComponent,
    ApplicationOrderExecutionComponent,
    OrdersCalendarComponent,
    CloseOrdersComponent,
    BpaReportsComponent,
    RemuElectronicBookParametrizationComponent,
  ],
})
export class AppComponent {
  isSidebarOpen = signal(true); // For desktop sidebar collapse
  isMobileMenuOpen = signal(false); // For mobile off-canvas menu
  selectedModuleId = signal('dashboard-overview');
  openSubmenuIds = signal<Record<string, boolean>>({});
  
  // New Hybrid Navigation State
  selectedTopModuleId = signal('dashboard-group');

  // Header State
  currentUser = signal({ name: 'Admin', avatar: 'https://picsum.photos/100' });
  economicIndicators = signal({
    uf: '37.522,57',
    dolar: '942,30',
    utm: '65.770,00'
  });
  availableCompanies = signal([
    { id: 1, name: 'Agrícola San José' },
    { id: 2, name: 'Exportadora del Valle' }
  ]);
  selectedCompany = signal(this.availableCompanies()[0]);
  isCompanyDropdownOpen = signal(false);
  isUserDropdownOpen = signal(false);

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
    { 
      id: 'warehouses-group', 
      name: 'Bodegas',
      children: [
        { id: 'warehouse-summary', name: 'Resumen Bodega' },
        { id: 'warehouse-parameters', name: 'Parametros Bodega' },
        { id: 'warehouse-movements', name: 'Movimientos Bodega' },
        { id: 'warehouse-reports', name: 'Informes Bodega' },
        { id: 'warehouse-accounting-transfer', name: 'Traspaso Contable' },
        { id: 'warehouse-month-end-closing', name: 'Cierre Mes' }
      ]
    },
    { 
      id: 'purchase-group', 
      name: 'Compras',
      children: [
        { id: 'purchase-parameters', name: 'Parametros Compras' },
        { id: 'purchase-request', name: 'Solicitud de Compras' },
        { id: 'purchase-request-report', name: 'Informe Solicitud de Compras' },
        { id: 'purchase-order', name: 'Orden de Compra' },
        { id: 'purchase-order-report', name: 'Informe Orden de Compra' },
        { id: 'close-reactivate-po', name: 'Cerrar Reactivar Orden de Compra' },
        { id: 'purchase-order-approval', name: 'Aprobacion Orden de Compra' },
        { id: 'po-service-reception', name: 'Recepcion Orden de Compra Servicios' },
        { id: 'department-user-report', name: 'Informe Departamento Usuario' },
        { id: 'pending-po-report', name: 'Informe Orden de Compra Pendiente' },
        { id: 'supplier-product-price-report', name: 'Informe Proveedor Producto Precio' },
        { id: 'cost-center-distribution-report', name: 'Informe Distribucion CC' },
      ]
    },
    { 
      id: 'machinery-group', 
      name: 'Maquinarias',
      children: [
        { id: 'machinery-summary', name: 'Resumen Maquinaria' },
        { id: 'machinery-parameters', name: 'Parametros Maquinaria' },
        { id: 'daily-machinery-log', name: 'Digitacion Diaria Maquinarias' },
        { id: 'other-proratable-values', name: 'Otros Valores a Prorratear' },
        { id: 'proratable-values-report', name: 'Informe Otros Valores a Prorratear' },
        { id: 'monthly-proration', name: 'Prorrateo Mensual' },
        { id: 'machinery-reports', name: 'Informes Maquinaria' },
        { id: 'machinery-accounting-transfer', name: 'Traspaso Contable' }
      ]
    },
    { 
      id: 'accounting-group', 
      name: 'Contabilidad',
      children: [
        { id: 'accounting-summary', name: 'Contabilidad' },
        { id: 'providers', name: 'Proveedores' },
        { id: 'sales', name: 'Venta' },
        { id: 'treasury', name: 'Tesoreria' },
        { id: 'fixed-assets', name: 'Activo Fijo' }
      ]
    },
    {
      id: 'payroll-group',
      name: 'Remuneraciones',
      children: [
        {
          id: 'payroll-parameters-group',
          name: 'Parametros Remu',
          children: [
            { id: 'general-tables', name: 'Tablas Generales' },
            { id: 'assets-discounts', name: 'Haberes y Descuentos' },
            { id: 'settlement-parameters', name: 'Parametros de Liquidacion' },
            { id: 'company-settlement-parameters', name: 'Parametros Liquidacion Empresa' },
            { id: 'unique-tax', name: 'Impuesto Unico' },
            { id: 'farms', name: 'Fundos' },
            { id: 'labor', name: 'Labor' },
            { id: 'payroll-activities', name: 'Actividades' },
            { id: 'labor-activity', name: 'Actividad Labor' },
            { id: 'control-units', name: 'Unidades Control' },
            { id: 'legal-representative', name: 'Representante Legal' },
            { id: 'farm-user-permissions', name: 'Permisos Usuario Fundo' },
            { id: 'labor-assets-discounts-association', name: 'Asociacion Labor Haberes Descuentos' },
            { id: 'weekly-schedule', name: 'Horario Semanal' },
            { id: 'afp', name: 'Afp' },
            { id: 'health', name: 'Salud' },
            { id: 'provident-funds', name: 'Cajas Prevision' },
            { id: 'bank', name: 'Banco' },
            { id: 'payment-methods', name: 'Medios Pago' },
            { id: 'responsibility-center', name: 'Centro Responsabilidad' },
            { id: 'crew-boss', name: 'Jefe Cuadrilla' },
            { id: 'tasks', name: 'Faenas' },
            { id: 'holidays', name: 'Feriados' },
            { id: 'accounting-parameters', name: 'Parametros Contabilizacion' },
            { id: 'remu-electronic-book-parametrization', name: 'Parametrizacion Libro Elec Remu' },
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
          name: 'Proceso de Remuneraciones',
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
    { 
      id: 'plant-group', 
      name: 'Planta',
      children: [
        { id: 'plant-summary', name: 'Resumen Planta' },
        { id: 'plant-parameters', name: 'Parametros Planta' },
        { id: 'bulk-fruit', name: 'Fruta Granel' },
        { id: 'packing', name: 'Packing' },
        { id: 'cold-storage', name: 'Frigorifico' },
        { id: 'quality-control', name: 'Control Calidad' },
        { id: 'packaging-control', name: 'Control Envases' }
      ]
    },
    { 
      id: 'exports-group', 
      name: 'Exportaciones',
      children: [
        { id: 'exports-summary', name: 'Resumen Exportaciones' },
        { id: 'export-parameters', name: 'Parametros Export' },
        { id: 'scheduling', name: 'Programacion' },
        { id: 'shipment', name: 'Embarque' },
        { id: 'valuation', name: 'Valorizacion' },
        { id: 'commercial-management-account', name: 'Cuenta Corriente Gestion Comercial' }
      ]
    },
    { id: 'budget', name: 'Presupuesto' },
    { 
      id: 'contractors-group', 
      name: 'Contratistas',
      children: [
        { id: 'contractor-summary', name: 'Resumen Contratistas' },
        { id: 'contractor-parameters', name: 'Parametros Contra' },
        { id: 'contractor-file', name: 'Ficha Contratista' },
        { id: 'contract-entry', name: 'Ingreso Contratos' },
        { id: 'personnel-enrollment', name: 'Enrolamiento Personal' },
        { id: 'personnel-attendance', name: 'Asistencia Personal' },
        { id: 'attendance-report', name: 'Informe Asistencia' },
        { id: 'agromovil', name: 'Agromovil' },
        { id: 'production-control', name: 'Control Produccion' },
        { id: 'contractor-production-report', name: 'Informe Control Produccion Contratista' },
        { id: 'contractor-cost-report', name: 'Informe Costos Contratista' },
        { id: 'contractor-revaluation', name: 'Revalorizacion Contratista' },
        { id: 'contractor-proforma-invoice', name: 'Factura Proforma Contratista' },
        { id: 'contractor-month-end-closing', name: 'Cierre Mes' },
      ]
    },
    {
      id: 'bpa-group',
      name: 'BPA',
      children: [
        { id: 'bpa-summary', name: 'Resumen BPA' },
        { id: 'bpa-parameters', name: 'Parametros Bpa' },
        { id: 'application-order-planning', name: 'Orden Aplicacion Planificacion' },
        { id: 'application-order-execution', name: 'Orden Aplicacion Ejecucion' },
        { id: 'orders-calendar', name: 'Calendario Ordenes' },
        { id: 'close-orders', name: 'Cerrar Ordenes' },
        { id: 'bpa-reports', name: 'Informes' },
      ]
    },
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
  ];

  currentSidebarModules = computed(() => {
    const topModule = this.modules.find(m => m.id === this.selectedTopModuleId());
    return topModule?.children ?? [];
  });

  toggleSidebar(): void {
    this.isSidebarOpen.update(open => !open);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(open => !open);
  }
  
  selectTopModule(moduleId: string): void {
    this.selectedTopModuleId.set(moduleId);
    const firstChild = this.currentSidebarModules()[0];
    if (firstChild) {
      if (firstChild.children && firstChild.children.length > 0) {
        this.selectedModuleId.set(firstChild.children[0].id);
      } else {
        this.selectedModuleId.set(firstChild.id);
      }
    }
    this.openSubmenuIds.set({});
    if (this.currentSidebarModules().length > 0 && this.currentSidebarModules()[0].children) {
        this.toggleSubmenu(this.currentSidebarModules()[0].id);
    }
  }

  selectModule(moduleId: string, isLeaf: boolean): void {
    this.selectedModuleId.set(moduleId);
    if (isLeaf && this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
    }
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

  // Header Methods
  goToDashboard(): void {
    this.selectedTopModuleId.set('dashboard-group');
    this.selectedModuleId.set('dashboard-overview');
    this.openSubmenuIds.set({});
  }

  toggleCompanyDropdown(): void {
    this.isCompanyDropdownOpen.update(open => !open);
    if (this.isCompanyDropdownOpen()) {
      this.isUserDropdownOpen.set(false);
    }
  }

  selectCompany(company: { id: number; name: string }): void {
    this.selectedCompany.set(company);
    this.isCompanyDropdownOpen.set(false);
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen.update(open => !open);
     if (this.isUserDropdownOpen()) {
      this.isCompanyDropdownOpen.set(false);
    }
  }
}
