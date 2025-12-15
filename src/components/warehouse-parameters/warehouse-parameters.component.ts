import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IngredientesActivosComponent } from '../ingredientes-activos/ingredientes-activos.component';
import { UnidadesMedidaComponent } from '../unidades-medida/unidades-medida.component';
import { MaestroArticulosComponent } from '../maestro-articulos/maestro-articulos.component';
import { GestionBodegasComponent } from '../gestion-bodegas/gestion-bodegas.component';
import { ParametrosContabilizacionBodegaComponent } from '../parametros-contabilizacion-bodega/parametros-contabilizacion-bodega.component';

type WarehouseParamView = 'ingredientes-activos' | 'unidades-medida' | 'maestro-articulos' | 'bodegas' | 'contabilizacion';

@Component({
  selector: 'app-warehouse-parameters',
  templateUrl: './warehouse-parameters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IngredientesActivosComponent,
    UnidadesMedidaComponent,
    MaestroArticulosComponent,
    GestionBodegasComponent,
    ParametrosContabilizacionBodegaComponent,
  ],
})
export class WarehouseParametersComponent {
  activeView = signal<WarehouseParamView>('ingredientes-activos');

  setView(view: WarehouseParamView): void {
    this.activeView.set(view);
  }
}
