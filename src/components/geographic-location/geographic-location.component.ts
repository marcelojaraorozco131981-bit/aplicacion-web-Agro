import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Interfaces
interface Commune {
  code: number;
  name: string;
  isActive: boolean;
}

interface City {
  code: number;
  name: string;
  isActive: boolean;
  communes: Commune[];
}

interface Country {
  code: number;
  name: string;
  isActive: boolean;
  cities: City[];
}

@Component({
  selector: 'app-geographic-location',
  templateUrl: './geographic-location.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class GeographicLocationComponent {
  private fb = inject(FormBuilder);

  // --- State ---
  countries = signal<Country[]>([
    { code: 1, name: 'Chile', isActive: true, cities: [
        { code: 101, name: 'Santiago', isActive: true, communes: [
            { code: 10101, name: 'Providencia', isActive: true },
            { code: 10102, name: 'Las Condes', isActive: true },
        ]},
        { code: 102, name: 'Valparaíso', isActive: false, communes: [] },
        { code: 103, name: 'Concepción', isActive: true, communes: [
            { code: 10301, name: 'Talcahuano', isActive: true },
        ] },
    ] },
    { code: 2, name: 'Argentina', isActive: true, cities: [
        { code: 201, name: 'Buenos Aires', isActive: true, communes: [] },
        { code: 202, name: 'Córdoba', isActive: true, communes: [] },
    ] },
    { code: 3, name: 'Perú', isActive: false, cities: [] },
  ]);

  selectedCountry = signal<Country | null>(null);
  selectedCity = signal<City | null>(null);

  // Country state
  isCountryPanelOpen = signal(false);
  isCountryConfirmModalOpen = signal(false);
  countryToToggleVigencia = signal<Country | null>(null);
  countryFormMode = signal<'new' | 'edit'>('new');
  
  // City state
  isCityPanelOpen = signal(false);
  isCityConfirmModalOpen = signal(false);
  cityToToggleVigencia = signal<City | null>(null);
  cityFormMode = signal<'new' | 'edit'>('new');
  
  // Commune state
  isCommunePanelOpen = signal(false);
  isCommuneConfirmModalOpen = signal(false);
  communeToToggleVigencia = signal<Commune | null>(null);
  communeFormMode = signal<'new' | 'edit'>('new');


  // --- Forms ---
  countryForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    name: ['', Validators.required],
  });

  cityForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    name: ['', Validators.required],
  });

  communeForm = this.fb.group({
    code: [0, [Validators.required, Validators.pattern('^[0-9]+$')]],
    name: ['', Validators.required],
  });

  // --- Methods ---
  
  // Country Methods
  selectCountry(country: Country): void {
    this.selectedCountry.set(country);
    this.selectedCity.set(null);
  }

  openNewCountryPanel(): void {
    this.countryFormMode.set('new');
    this.countryForm.reset();
    this.countryForm.get('code')?.enable();
    this.countryForm.get('code')?.setValidators([Validators.required, Validators.pattern('^[0-9]+$'), this.countryCodeExistsValidator.bind(this)]);
    this.countryForm.updateValueAndValidity();
    this.isCountryPanelOpen.set(true);
  }

  openEditCountryPanel(country: Country): void {
    this.countryFormMode.set('edit');
    this.countryForm.reset();
    this.countryForm.patchValue(country);
    this.countryForm.get('code')?.disable();
    this.countryForm.get('code')?.clearValidators();
    this.countryForm.updateValueAndValidity();
    this.isCountryPanelOpen.set(true);
  }

  saveCountry(): void {
    if (this.countryForm.invalid) return;
    const formValue = this.countryForm.getRawValue();

    if (this.countryFormMode() === 'new') {
      const newCountry: Country = {
        code: Number(formValue.code),
        name: formValue.name!,
        isActive: true,
        cities: [],
      };
      this.countries.update(countries => [...countries, newCountry].sort((a,b) => a.code - b.code));
    } else {
      this.countries.update(countries => 
        countries.map(c => c.code === formValue.code ? { ...c, name: formValue.name! } : c)
      );
    }
    this.closeCountryPanel();
  }

  openCountryVigenciaModal(country: Country): void {
    this.countryToToggleVigencia.set(country);
    this.isCountryConfirmModalOpen.set(true);
  }

  confirmToggleCountryVigencia(): void {
    const countryToToggle = this.countryToToggleVigencia();
    if (countryToToggle) {
      this.countries.update(countries => countries.map(c => c.code === countryToToggle.code ? { ...c, isActive: !c.isActive } : c));
      if (this.selectedCountry()?.code === countryToToggle.code) {
        this.selectedCountry.set(null);
        this.selectedCity.set(null);
      }
    }
    this.closeCountryConfirmModal();
  }

  closeCountryPanel = () => this.isCountryPanelOpen.set(false);
  closeCountryConfirmModal = () => { this.isCountryConfirmModalOpen.set(false); this.countryToToggleVigencia.set(null); };

  countryCodeExistsValidator(control: AbstractControl): ValidationErrors | null {
    return this.countries().some(c => c.code === Number(control.value)) ? { codeExists: true } : null;
  }
  
  // City Methods
  selectCity(city: City): void {
    this.selectedCity.set(city);
  }

  openNewCityPanel(): void {
    this.cityFormMode.set('new');
    this.cityForm.reset();
    this.cityForm.get('code')?.enable();
    this.cityForm.get('code')?.setValidators([Validators.required, Validators.pattern('^[0-9]+$'), this.cityCodeExistsValidator.bind(this)]);
    this.cityForm.updateValueAndValidity();
    this.isCityPanelOpen.set(true);
  }
  
  openEditCityPanel(city: City): void {
    this.cityFormMode.set('edit');
    this.cityForm.reset();
    this.cityForm.patchValue(city);
    this.cityForm.get('code')?.disable();
    this.cityForm.get('code')?.clearValidators();
    this.cityForm.updateValueAndValidity();
    this.isCityPanelOpen.set(true);
  }

  saveCity(): void {
    if (this.cityForm.invalid || !this.selectedCountry()) return;
    const formValue = this.cityForm.getRawValue();
    const countryCode = this.selectedCountry()!.code;

    if (this.cityFormMode() === 'new') {
      const newCity: City = {
        code: Number(formValue.code),
        name: formValue.name!,
        isActive: true,
        communes: [],
      };
      this.countries.update(countries => countries.map(c => c.code === countryCode ? { ...c, cities: [...c.cities, newCity].sort((a,b) => a.code - b.code) } : c));
    } else {
      this.countries.update(countries => countries.map(c => c.code === countryCode ? { ...c, cities: c.cities.map(city => city.code === formValue.code ? { ...city, name: formValue.name! } : city) } : c));
    }
    const updatedCountry = this.countries().find(c => c.code === countryCode);
    if(updatedCountry) this.selectedCountry.set(updatedCountry);
    this.closeCityPanel();
  }
  
  openCityVigenciaModal(city: City): void {
    this.cityToToggleVigencia.set(city);
    this.isCityConfirmModalOpen.set(true);
  }

  confirmToggleCityVigencia(): void {
    const cityToToggle = this.cityToToggleVigencia();
    const countryCode = this.selectedCountry()?.code;
    if (cityToToggle && countryCode) {
      this.countries.update(countries => countries.map(c => c.code === countryCode ? { ...c, cities: c.cities.map(city => city.code === cityToToggle.code ? { ...city, isActive: !city.isActive } : city) } : c));
      const updatedCountry = this.countries().find(c => c.code === countryCode);
      if(updatedCountry) this.selectedCountry.set(updatedCountry);
      if (this.selectedCity()?.code === cityToToggle.code) {
        this.selectedCity.set(null);
      }
    }
    this.closeCityConfirmModal();
  }

  closeCityPanel = () => this.isCityPanelOpen.set(false);
  closeCityConfirmModal = () => { this.isCityConfirmModalOpen.set(false); this.cityToToggleVigencia.set(null); };

  cityCodeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.selectedCountry()?.cities.some(c => c.code === code);
    return codeExists ? { codeExists: true } : null;
  }
  
  // Commune Methods
  openNewCommunePanel(): void {
    this.communeFormMode.set('new');
    this.communeForm.reset();
    this.communeForm.get('code')?.enable();
    this.communeForm.get('code')?.setValidators([Validators.required, Validators.pattern('^[0-9]+$'), this.communeCodeExistsValidator.bind(this)]);
    this.communeForm.updateValueAndValidity();
    this.isCommunePanelOpen.set(true);
  }

  openEditCommunePanel(commune: Commune): void {
    this.communeFormMode.set('edit');
    this.communeForm.reset();
    this.communeForm.patchValue(commune);
    this.communeForm.get('code')?.disable();
    this.communeForm.get('code')?.clearValidators();
    this.communeForm.updateValueAndValidity();
    this.isCommunePanelOpen.set(true);
  }

  saveCommune(): void {
    if (this.communeForm.invalid || !this.selectedCountry() || !this.selectedCity()) return;

    const formValue = this.communeForm.getRawValue();
    const countryCode = this.selectedCountry()!.code;
    const cityCode = this.selectedCity()!.code;

    if (this.communeFormMode() === 'new') {
      const newCommune: Commune = { code: Number(formValue.code), name: formValue.name!, isActive: true };
      this.countries.update(countries => countries.map(c => {
        if (c.code !== countryCode) return c;
        return { ...c, cities: c.cities.map(city => {
          if (city.code !== cityCode) return city;
          return { ...city, communes: [...city.communes, newCommune].sort((a,b) => a.code - b.code) };
        })};
      }));
    } else {
      this.countries.update(countries => countries.map(c => {
        if (c.code !== countryCode) return c;
        return { ...c, cities: c.cities.map(city => {
          if (city.code !== cityCode) return city;
          return { ...city, communes: city.communes.map(co => co.code === formValue.code ? {...co, name: formValue.name!} : co) };
        })};
      }));
    }
    
    const updatedCountry = this.countries().find(c => c.code === countryCode);
    this.selectedCountry.set(updatedCountry!);
    this.selectedCity.set(updatedCountry!.cities.find(city => city.code === cityCode) || null);
    this.closeCommunePanel();
  }

  openCommuneVigenciaModal(commune: Commune): void {
    this.communeToToggleVigencia.set(commune);
    this.isCommuneConfirmModalOpen.set(true);
  }

  confirmToggleCommuneVigencia(): void {
    const communeToToggle = this.communeToToggleVigencia();
    const countryCode = this.selectedCountry()?.code;
    const cityCode = this.selectedCity()?.code;
    if (communeToToggle && countryCode && cityCode) {
      this.countries.update(countries => countries.map(c => {
        if (c.code !== countryCode) return c;
        return { ...c, cities: c.cities.map(city => {
          if (city.code !== cityCode) return city;
          return { ...city, communes: city.communes.map(co => co.code === communeToToggle.code ? {...co, isActive: !co.isActive} : co) };
        })};
      }));
       const updatedCountry = this.countries().find(c => c.code === countryCode);
      this.selectedCountry.set(updatedCountry!);
      this.selectedCity.set(updatedCountry!.cities.find(city => city.code === cityCode) || null);
    }
    this.closeCommuneConfirmModal();
  }

  closeCommunePanel = () => this.isCommunePanelOpen.set(false);
  closeCommuneConfirmModal = () => { this.isCommuneConfirmModalOpen.set(false); this.communeToToggleVigencia.set(null); };

  communeCodeExistsValidator(control: AbstractControl): ValidationErrors | null {
    const code = Number(control.value);
    const codeExists = this.selectedCity()?.communes.some(c => c.code === code);
    return codeExists ? { codeExists: true } : null;
  }
  
  async exportToPdf(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    let currentY = 22;

    doc.setFontSize(18);
    doc.text('Reporte de Ubicaciones Geográficas', 14, currentY);
    currentY += 12;

    this.countries().sort((a, b) => a.code - b.code).forEach(country => {
      if (currentY > 260) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129); // Emerald color
      doc.text(`País: ${country.code} - ${country.name} (${country.isActive ? 'Vigente' : 'No Vigente'})`, 14, currentY);
      currentY += 10;

      if (country.cities.length > 0) {
          country.cities.forEach(city => {
              if (currentY > 260) { doc.addPage(); currentY = 20; }
              doc.setFontSize(12);
              doc.setTextColor(100);
              doc.text(`  Ciudad: ${city.code} - ${city.name} (${city.isActive ? 'Vigente' : 'No Vigente'})`, 14, currentY);
              currentY += 8;

              if (city.communes.length > 0) {
                  autoTable(doc, {
                      startY: currentY,
                      head: [['Cód. Comuna', 'Nombre', 'Vigencia']],
                      body: city.communes.map(commune => [commune.code, commune.name, commune.isActive ? 'Vigente' : 'No Vigente']),
                      theme: 'grid',
                      headStyles: { fillColor: [100, 116, 139], fontSize: 9 },
                      bodyStyles: { fontSize: 8 },
                      margin: { left: 20, right: 14 }
                  });
                  currentY = (doc as any).lastAutoTable.finalY + 10;
              } else {
                  doc.setFontSize(9);
                  doc.setTextColor(150);
                  doc.text('    Sin comunas registradas para esta ciudad.', 20, currentY);
                  currentY += 8;
              }
          });
      } else {
          doc.setFontSize(9);
          doc.setTextColor(150);
          doc.text('  Sin ciudades registradas para este país.', 14, currentY);
          currentY += 10;
      }
      currentY += 5;
    });
    
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        const text = `Página ${i} de ${pageCount} | Generado el: ${new Date().toLocaleDateString()}`;
        doc.text(text, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save('Reporte_Ubicaciones_Geograficas.pdf');
  }
}
