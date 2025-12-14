import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';

// Interfaces
interface User {
  id: number;
  name: string;
  email: string;
}

interface Company {
  id: number;
  name: string;
}

interface Departamento {
  code: number;
  description: string;
  companyId: number; 
}

interface TipoCompra {
  id: number;
  name: string;
}

interface UserPermission {
  userId: number;
  montoAprobacion: number;
  aprobacionGerencial: boolean;
  aprobacionPorDefecto: boolean;
  verTodasSC: boolean;
  verTodasOC: boolean;
  esSolicitador: boolean;
  esComprador: boolean;
  esAprobador: boolean;
  empresas: number[]; 
  departamentos: number[];
  tiposCompra: number[];
}

@Component({
  selector: 'app-asignacion-permisos-usuario',
  templateUrl: './asignacion-permisos-usuario.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class AsignacionPermisosUsuarioComponent implements OnInit {
  private fb = inject(FormBuilder);

  // --- Master Data (simulated) ---
  users = signal<User[]>([
    { id: 1, name: 'Juan Pérez', email: 'juan.perez@agrosys.cl' },
    { id: 2, name: 'Maria González', email: 'maria.gonzalez@agrosys.cl' },
    { id: 3, name: 'Carlos Soto', email: 'carlos.soto@agrosys.cl' },
  ]);

  companies = signal<Company[]>([
    { id: 1, name: 'Agrícola San José' },
    { id: 2, name: 'Exportadora del Valle' }
  ]);
  
  departments = signal<Departamento[]>([
    { companyId: 1, code: 10, description: 'Administración' },
    { companyId: 1, code: 20, description: 'Operaciones Campo' },
    { companyId: 2, code: 15, description: 'Comercial Exportación' },
    { companyId: 1, code: 30, description: 'Bodega Insumos' },
  ]);

  purchaseTypes = signal<TipoCompra[]>([
      {id: 1, name: 'Existencias'},
      {id: 2, name: 'Activo Fijo'},
      {id: 3, name: 'Servicios/Otros'},
  ]);
  
  // --- State Signals ---
  allPermissions = signal<UserPermission[]>([
    {
      userId: 1,
      montoAprobacion: 500000,
      aprobacionGerencial: true,
      aprobacionPorDefecto: false,
      verTodasSC: true,
      verTodasOC: true,
      esSolicitador: true,
      esComprador: true,
      esAprobador: true,
      empresas: [1, 2],
      departamentos: [10, 20, 15],
      tiposCompra: [1, 2],
    }
  ]);

  selectedUser = signal<User | null>(null);
  isSaving = signal(false);
  saveSuccess = signal(false);

  // --- Form Definition ---
  permissionForm = this.fb.group({
    montoAprobacion: [0, [Validators.required, Validators.min(0)]],
    aprobacionGerencial: [false],
    aprobacionPorDefecto: [false],
    verTodasSC: [false],
    verTodasOC: [false],
    esSolicitador: [false],
    esComprador: [false],
    esAprobador: [false],
    empresas: this.fb.array([]),
    departamentos: this.fb.array([]),
    tiposCompra: this.fb.array([]),
  });

  // --- FormArray Getters ---
  get empresasFormArray() { return this.permissionForm.get('empresas') as FormArray; }
  get departamentosFormArray() { return this.permissionForm.get('departamentos') as FormArray; }
  get tiposCompraFormArray() { return this.permissionForm.get('tiposCompra') as FormArray; }

  ngOnInit() {
    this.buildCheckboxes();
  }

  buildCheckboxes(): void {
    this.companies().forEach(() => this.empresasFormArray.push(this.fb.control(false)));
    this.departments().forEach(() => this.departamentosFormArray.push(this.fb.control(false)));
    this.purchaseTypes().forEach(() => this.tiposCompraFormArray.push(this.fb.control(false)));
  }

  selectUser(user: User): void {
    this.selectedUser.set(user);
    const permissions = this.allPermissions().find(p => p.userId === user.id);
    this.updateForm(permissions);
  }

  updateForm(permissions: UserPermission | undefined): void {
    if (permissions) {
      this.permissionForm.patchValue({
        montoAprobacion: permissions.montoAprobacion,
        aprobacionGerencial: permissions.aprobacionGerencial,
        aprobacionPorDefecto: permissions.aprobacionPorDefecto,
        verTodasSC: permissions.verTodasSC,
        verTodasOC: permissions.verTodasOC,
        esSolicitador: permissions.esSolicitador,
        esComprador: permissions.esComprador,
        esAprobador: permissions.esAprobador,
      });

      this.empresasFormArray.patchValue(
        this.companies().map(c => permissions.empresas.includes(c.id))
      );
      this.departamentosFormArray.patchValue(
        this.departments().map(d => permissions.departamentos.includes(d.code))
      );
      this.tiposCompraFormArray.patchValue(
        this.purchaseTypes().map(pt => permissions.tiposCompra.includes(pt.id))
      );
    } else {
      this.permissionForm.reset({
        montoAprobacion: 0,
        aprobacionGerencial: false,
        aprobacionPorDefecto: false,
        verTodasSC: false,
        verTodasOC: false,
        esSolicitador: false,
        esComprador: false,
        esAprobador: false,
        empresas: this.companies().map(() => false),
        departamentos: this.departments().map(() => false),
        tiposCompra: this.purchaseTypes().map(() => false),
      });
    }
    this.permissionForm.markAsPristine();
  }

  savePermissions(): void {
    if (this.permissionForm.invalid || !this.selectedUser()) return;
    
    this.isSaving.set(true);
    this.saveSuccess.set(false);

    const formValue = this.permissionForm.value;
    const selectedUserId = this.selectedUser()!.id;

    const newPermissions: UserPermission = {
      userId: selectedUserId,
      montoAprobacion: formValue.montoAprobacion || 0,
      aprobacionGerencial: formValue.aprobacionGerencial || false,
      aprobacionPorDefecto: formValue.aprobacionPorDefecto || false,
      verTodasSC: formValue.verTodasSC || false,
      verTodasOC: formValue.verTodasOC || false,
      esSolicitador: formValue.esSolicitador || false,
      esComprador: formValue.esComprador || false,
      esAprobador: formValue.esAprobador || false,
      empresas: this.mapFormArrayToIds(this.empresasFormArray, this.companies(), 'id'),
      departamentos: this.mapFormArrayToIds(this.departamentosFormArray, this.departments(), 'code'),
      tiposCompra: this.mapFormArrayToIds(this.tiposCompraFormArray, this.purchaseTypes(), 'id'),
    };
    
    // Simulate API call
    setTimeout(() => {
      this.allPermissions.update(perms => {
        const existingIndex = perms.findIndex(p => p.userId === selectedUserId);
        if (existingIndex > -1) {
          const updatedPerms = [...perms];
          updatedPerms[existingIndex] = newPermissions;
          return updatedPerms;
        } else {
          return [...perms, newPermissions];
        }
      });
      this.isSaving.set(false);
      this.saveSuccess.set(true);
      this.permissionForm.markAsPristine();
      setTimeout(() => this.saveSuccess.set(false), 2000);
    }, 1000);
  }

  private mapFormArrayToIds<T extends { [key: string]: any }>(formArray: FormArray, source: T[], idKey: keyof T): number[] {
    return formArray.value
      .map((checked: boolean, i: number) => checked ? source[i][idKey] : null)
      .filter((id: number | null) => id !== null) as number[];
  }
}
