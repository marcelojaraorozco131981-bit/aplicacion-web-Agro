import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Interfaces
interface Branch {
  branchCode: number;
  description: string;
  isActive: boolean;
}

interface Bank {
  bankCode: number;
  description: string;
  isElectronicPayment: boolean;
  isActive: boolean;
  branches: Branch[];
}

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class BankComponent {
  private fb = inject(FormBuilder);

  // --- Bank State ---
  banks = signal<Bank[]>([
    { bankCode: 1, description: 'BANCO DE CHILE', isElectronicPayment: true, isActive: true, branches: [
        { branchCode: 101, description: 'Sucursal Principal Santiago', isActive: true },
        { branchCode: 102, description: 'Sucursal Valparaíso', isActive: false },
    ] },
    { bankCode: 12, description: 'BANCO ESTADO', isElectronicPayment: false, isActive: true, branches: [
        { branchCode: 201, description: 'Oficina Central', isActive: true },
    ] },
    { bankCode: 37, description: 'BANCO SANTANDER', isElectronicPayment: false, isActive: false, branches: [] },
  ]);
  selectedBank = signal<Bank | null>(null);
  isBankPanelOpen = signal(false);
  isBankConfirmModalOpen = signal(false);
  bankToToggleVigencia = signal<Bank | null>(null);
  bankFormMode = signal<'new' | 'edit'>('new');
  bankSortColumn = signal<keyof Bank>('bankCode');
  bankSortDirection = signal<'asc' | 'desc'>('asc');

  // --- Branch State ---
  isBranchPanelOpen = signal(false);
  isBranchConfirmModalOpen = signal(false);
  branchToToggleVigencia = signal<Branch | null>(null);
  branchFormMode = signal<'new' | 'edit'>('new');
  branchSortColumn = signal<keyof Branch>('branchCode');
  branchSortDirection = signal<'asc' | 'desc'>('asc');

  // --- Bank Computed Properties & Forms ---
  sortedBanks = computed(() => this.sort<Bank>(this.banks(), this.bankSortColumn(), this.bankSortDirection()));
  bankForm = this.fb.group({
    bankCode: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    description: ['', Validators.required],
    isElectronicPayment: [false],
  });

  // --- Branch Computed Properties & Forms ---
  sortedBranches = computed(() => {
    const branches = this.selectedBank()?.branches || [];
    return this.sort<Branch>(branches, this.branchSortColumn(), this.branchSortDirection());
  });
  branchForm = this.fb.group({
    branchCode: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    description: ['', Validators.required],
  });

  // --- Generic Sort Helper ---
  private sort<T>(items: T[], column: keyof T, direction: 'asc' | 'desc'): T[] {
    return [...items].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') comparison = aValue - bValue;
      else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') comparison = aValue === bValue ? 0 : aValue ? -1 : 1;
      else comparison = String(aValue).localeCompare(String(bValue));
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  // --- Bank Methods ---
  selectBank(bank: Bank): void {
    this.selectedBank.set(bank);
  }

  onBankSort(column: keyof Bank): void {
    if (this.bankSortColumn() === column) this.bankSortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    else { this.bankSortColumn.set(column); this.bankSortDirection.set('asc'); }
  }
  
  openNewBankPanel(): void {
    this.bankFormMode.set('new');
    this.bankForm.reset({ isElectronicPayment: false });
    this.bankForm.get('bankCode')?.enable();
    this.bankForm.get('bankCode')?.setValidators([Validators.required, Validators.pattern('^[0-9]+$'), this.bankCodeExistsValidator.bind(this)]);
    this.bankForm.updateValueAndValidity();
    this.isBankPanelOpen.set(true);
  }

  openEditBankPanel(bank: Bank): void {
    this.bankFormMode.set('edit');
    this.bankForm.reset();
    this.bankForm.patchValue(bank);
    this.bankForm.get('bankCode')?.disable();
    this.bankForm.get('bankCode')?.clearValidators();
    this.bankForm.updateValueAndValidity();
    this.isBankPanelOpen.set(true);
  }

  saveBank(): void {
    if (this.bankForm.invalid) return;

    const formValue = this.bankForm.getRawValue();
    const isElectronic = formValue.isElectronicPayment || false;
    const currentBankCode = Number(formValue.bankCode);

    if (this.bankFormMode() === 'new') {
      const newBank: Bank = {
        bankCode: currentBankCode,
        description: formValue.description || '',
        isElectronicPayment: isElectronic,
        isActive: true,
        branches: [],
      };
      this.banks.update(banks => {
        const otherBanks = isElectronic 
          ? banks.map(b => ({ ...b, isElectronicPayment: false })) 
          : banks;
        return [...otherBanks, newBank];
      });
    } else { // Editing mode
      this.banks.update(banks => 
        banks.map(b => {
          // This is the bank being edited
          if (b.bankCode === currentBankCode) {
            return { 
              ...b, 
              description: formValue.description || '', 
              isElectronicPayment: isElectronic 
            };
          }
          // This is another bank. If the one being edited is electronic, this one cannot be.
          if (isElectronic) {
             return { ...b, isElectronicPayment: false };
          }
          // Otherwise, this other bank is unaffected
          return b;
        })
      );
    }
    this.closeBankPanel();
  }

  openBankVigenciaModal(bank: Bank): void {
    this.bankToToggleVigencia.set(bank);
    this.isBankConfirmModalOpen.set(true);
  }

  confirmToggleBankVigencia(): void {
    const bankToToggle = this.bankToToggleVigencia();
    if (bankToToggle) {
      this.banks.update(banks => banks.map(b => b.bankCode === bankToToggle.bankCode ? { ...b, isActive: !b.isActive } : b));
      if (this.selectedBank()?.bankCode === bankToToggle.bankCode) {
        this.selectedBank.set(null);
      }
      this.closeBankConfirmModal();
    }
  }

  closeBankPanel = () => this.isBankPanelOpen.set(false);
  closeBankConfirmModal = () => { this.isBankConfirmModalOpen.set(false); this.bankToToggleVigencia.set(null); };

  bankCodeExistsValidator(control: AbstractControl): ValidationErrors | null {
    return this.banks().some(b => b.bankCode === Number(control.value)) ? { codeExists: true } : null;
  }
  
  async exportBanksToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    let currentY = 22;

    doc.setFontSize(18);
    doc.text('Reporte de Bancos y Sucursales', 14, currentY);
    currentY += 12;

    this.sortedBanks().forEach(bank => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129); // Emerald color
      doc.text(`Banco: ${bank.bankCode} - ${bank.description}`, 14, currentY);
      currentY += 7;

      doc.setFontSize(10);
      doc.setTextColor(40);
      const electronicPaymentText = `Pago Electrónico: ${bank.isElectronicPayment ? 'Sí' : 'No'}`;
      const statusText = `Vigencia: ${bank.isActive ? 'Vigente' : 'No Vigente'}`;
      doc.text(`${electronicPaymentText} | ${statusText}`, 14, currentY);
      currentY += 10;

      if (bank.branches.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['Cód. Sucursal', 'Descripción', 'Vigencia']],
          body: bank.branches.map(branch => [
            branch.branchCode,
            branch.description,
            branch.isActive ? 'Vigente' : 'No Vigente'
          ]),
          theme: 'grid',
          headStyles: { fillColor: [74, 85, 104] },
          margin: { left: 14, right: 14 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 12;
      } else {
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text('Sin sucursales registradas para este banco.', 14, currentY);
        currentY += 10;
      }
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

    doc.save('Reporte_Bancos_y_Sucursales.pdf');
  }

  // --- Branch Methods ---
  onBranchSort(column: keyof Branch): void {
    if (this.branchSortColumn() === column) this.branchSortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    else { this.branchSortColumn.set(column); this.branchSortDirection.set('asc'); }
  }

  openNewBranchPanel(): void {
    this.branchFormMode.set('new');
    this.branchForm.reset();
    this.branchForm.get('branchCode')?.enable();
    this.branchForm.get('branchCode')?.setValidators([Validators.required, Validators.pattern('^[0-9]+$'), this.branchCodeExistsValidator.bind(this)]);
    this.branchForm.updateValueAndValidity();
    this.isBranchPanelOpen.set(true);
  }
  
  openEditBranchPanel(branch: Branch): void {
    this.branchFormMode.set('edit');
    this.branchForm.reset();
    this.branchForm.patchValue(branch);
    this.branchForm.get('branchCode')?.disable();
    this.branchForm.get('branchCode')?.clearValidators();
    this.branchForm.updateValueAndValidity();
    this.isBranchPanelOpen.set(true);
  }

  saveBranch(): void {
    if (this.branchForm.invalid || !this.selectedBank()) return;
    const formValue = this.branchForm.getRawValue();
    const bankCode = this.selectedBank()!.bankCode;

    if (this.branchFormMode() === 'new') {
      const newBranch: Branch = {
        branchCode: Number(formValue.branchCode),
        description: formValue.description || '',
        isActive: true,
      };
      this.banks.update(banks => banks.map(b => b.bankCode === bankCode ? { ...b, branches: [...b.branches, newBranch] } : b));
    } else {
      this.banks.update(banks => banks.map(b => b.bankCode === bankCode ? { ...b, branches: b.branches.map(br => br.branchCode === formValue.branchCode ? { ...br, description: formValue.description || '' } : br) } : b));
    }
    // Update selectedBank signal to reflect changes
    const updatedBank = this.banks().find(b => b.bankCode === bankCode);
    if(updatedBank) this.selectedBank.set(updatedBank);

    this.closeBranchPanel();
  }

  openBranchVigenciaModal(branch: Branch): void {
    this.branchToToggleVigencia.set(branch);
    this.isBranchConfirmModalOpen.set(true);
  }

  confirmToggleBranchVigencia(): void {
    const branchToToggle = this.branchToToggleVigencia();
    const bankCode = this.selectedBank()?.bankCode;
    if (branchToToggle && bankCode) {
      this.banks.update(banks => banks.map(b => b.bankCode === bankCode ? { ...b, branches: b.branches.map(br => br.branchCode === branchToToggle.branchCode ? { ...br, isActive: !br.isActive } : br) } : b));
      // Update selectedBank signal to reflect changes
      const updatedBank = this.banks().find(b => b.bankCode === bankCode);
      if(updatedBank) this.selectedBank.set(updatedBank);
      this.closeBranchConfirmModal();
    }
  }

  closeBranchPanel = () => this.isBranchPanelOpen.set(false);
  closeBranchConfirmModal = () => { this.isBranchConfirmModalOpen.set(false); this.branchToToggleVigencia.set(null); };

  branchCodeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.selectedBank()?.branches.some(br => br.branchCode === code);
    return codeExists ? { codeExists: true } : null;
  }
}
