import { ChangeDetectionStrategy, Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

interface AssetDiscount {
  id: number;
  familyCode: number;
  subFamilyCode: number;
  codeType: 'haber' | 'descuento' | 'referencial';
  code: number;
  description: string;
  isBono: boolean;
  isBonoMo: boolean;
  isPrestamo: boolean;
  isAnticipo: boolean;
  period: 'mensual' | 'fijo' | 'transitorio';
  currency: 'peso' | 'uf' | 'porcentaje';
  ufType?: 'actual' | 'mes_anterior' | 'proximo_mes';
  liquidationOrder: number;
  hideInDetail: boolean;
  hideInHeaderFooter: boolean;
  isCodeEditable: boolean;
  isTaxable: boolean;
  valueType: 'cantidad' | 'monto';
  isTaxableDiscount?: boolean;
  dailyCalculation: 'dias_trabajados_reales' | 'dias_totales' | 'no_aplica';
  amountType: 'monto_diario' | 'monto_mensual';
  isCompanyCost: boolean;
  shouldAccount: boolean;
  isActive: boolean;
}

@Component({
  selector: 'app-assets-discounts',
  templateUrl: './assets-discounts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AssetsDiscountsComponent implements OnInit {
  private fb = inject(FormBuilder);

  items = signal<AssetDiscount[]>([]);
  isPanelOpen = signal(false);
  isConfirmModalOpen = signal(false);
  itemToToggleVigencia = signal<AssetDiscount | null>(null);
  formMode = signal<'new' | 'edit'>('new');
  
  openSections = signal<Record<string, boolean>>({
    identification: true,
    classification: false,
    value_config: false,
    attributes: false,
    settlement_config: false,
    calculation: false,
    accounting: false,
  });

  sortColumn = signal<keyof AssetDiscount>('code');
  sortDirection = signal<'asc' | 'desc'>('asc');

  sortedItems = computed(() => {
    const list = this.items();
    const column = this.sortColumn();
    const direction = this.sortDirection();
    return [...list].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') comparison = aValue - bValue;
      else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') comparison = aValue === bValue ? 0 : aValue ? -1 : 1;
      else comparison = String(aValue).localeCompare(String(bValue));
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  assetDiscountForm = this.fb.group({
    id: [0],
    familyCode: [null as number | null, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    subFamilyCode: [null as number | null, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    codeType: [null as AssetDiscount['codeType'] | null, Validators.required],
    code: [null as number | null, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    description: ['', Validators.required],
    isBono: [false],
    isBonoMo: [false],
    isPrestamo: [false],
    isAnticipo: [false],
    period: [null as AssetDiscount['period'] | null, Validators.required],
    currency: [null as AssetDiscount['currency'] | null, Validators.required],
    ufType: [null as AssetDiscount['ufType'] | null],
    liquidationOrder: [0, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    hideInDetail: [false],
    hideInHeaderFooter: [false],
    isCodeEditable: [null as boolean | null, Validators.required],
    isTaxable: [null as boolean | null, Validators.required],
    valueType: [null as AssetDiscount['valueType'] | null, Validators.required],
    isTaxableDiscount: [null as boolean | null],
    dailyCalculation: [null as AssetDiscount['dailyCalculation'] | null, Validators.required],
    amountType: [null as AssetDiscount['amountType'] | null, Validators.required],
    isCompanyCost: [false],
    shouldAccount: [null as boolean | null, Validators.required],
  });

  ngOnInit() {
    this.assetDiscountForm.get('currency')?.valueChanges.subscribe(value => {
      const ufTypeControl = this.assetDiscountForm.get('ufType');
      if (value === 'uf') {
        ufTypeControl?.setValidators(Validators.required);
      } else {
        ufTypeControl?.clearValidators();
      }
      ufTypeControl?.updateValueAndValidity();
    });

    this.assetDiscountForm.get('isTaxable')?.valueChanges.subscribe(value => {
      const taxableDiscountControl = this.assetDiscountForm.get('isTaxableDiscount');
      if (value === true) {
        taxableDiscountControl?.setValidators(Validators.required);
      } else {
        taxableDiscountControl?.clearValidators();
      }
      taxableDiscountControl?.updateValueAndValidity();
    });
  }

  toggleSection(section: string): void {
    this.openSections.update(sections => ({
      ...sections,
      [section]: !sections[section]
    }));
  }

  openNewPanel(): void {
    this.formMode.set('new');
    this.assetDiscountForm.reset({
      isBono: false, isBonoMo: false, isPrestamo: false, isAnticipo: false,
      hideInDetail: false, hideInHeaderFooter: false, isCompanyCost: false
    });
    this.assetDiscountForm.get('code')?.enable();
    this.assetDiscountForm.get('code')?.setValidators([Validators.required, this.codeExistsValidator.bind(this)]);
    this.assetDiscountForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  openEditPanel(item: AssetDiscount): void {
    this.formMode.set('edit');
    this.assetDiscountForm.reset();
    this.assetDiscountForm.patchValue(item);
    this.assetDiscountForm.get('code')?.disable();
    this.assetDiscountForm.get('code')?.clearValidators();
    this.assetDiscountForm.updateValueAndValidity();
    this.isPanelOpen.set(true);
  }

  saveItem(): void {
    if (this.assetDiscountForm.invalid) {
      this.assetDiscountForm.markAllAsTouched();
      return;
    }
    const formValue = this.assetDiscountForm.getRawValue();
    const newItem: AssetDiscount = { ...formValue, isActive: true } as AssetDiscount;

    if (this.formMode() === 'new') {
      newItem.id = Date.now();
      this.items.update(items => [...items, newItem]);
    } else {
      this.items.update(items => items.map(i => i.id === formValue.id ? { ...i, ...formValue } : i));
    }
    this.closePanel();
  }

  openVigenciaModal(item: AssetDiscount): void {
    this.itemToToggleVigencia.set(item);
    this.isConfirmModalOpen.set(true);
  }

  confirmToggleVigencia(): void {
    const itemToToggle = this.itemToToggleVigencia();
    if (itemToToggle) {
      this.items.update(items => items.map(i => i.id === itemToToggle.id ? { ...i, isActive: !i.isActive } : i));
      this.closeConfirmModal();
    }
  }
  
  closePanel = () => this.isPanelOpen.set(false);
  closeConfirmModal = () => { this.isConfirmModalOpen.set(false); this.itemToToggleVigencia.set(null); };

  onSort(column: keyof AssetDiscount): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  codeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    return this.items().some(i => i.code === code) ? { codeExists: true } : null;
  }

  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const head = [['Código', 'Descripción', 'Tipo', 'Período', 'Moneda', 'Vigencia']];
    const body = this.sortedItems().map(i => [
      i.code, i.description, i.codeType, i.period, i.currency, i.isActive ? 'Vigente' : 'No Vigente'
    ]);

    doc.setFontSize(18);
    doc.text('Reporte de Haberes y Descuentos', 14, 22);

    autoTable(doc, {
      startY: 30,
      head: head,
      body: body,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
    });

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

    doc.save('Reporte_Haberes_Descuentos.pdf');
  }
}
