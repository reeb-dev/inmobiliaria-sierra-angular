import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page.component';
import { PropiedadesPageComponent } from './pages/propiedades-page.component';
import { PropiedadDetailPageComponent } from './pages/propiedad-detail-page.component';
import { NosotrosPageComponent } from './pages/nosotros-page.component';
import { TasacionesPageComponent } from './pages/tasaciones-page.component';
import { ContactoPageComponent } from './pages/contacto-page.component';
import { PanelLoginComponent } from './panel/panel-login.component';
import { PanelLayoutComponent } from './panel/panel-layout.component';
import { PanelDashboardComponent } from './panel/panel-dashboard.component';
import { PanelPropertyListComponent } from './panel/panel-property-list.component';
import { PanelPropertyEditComponent } from './panel/panel-property-edit.component';
import { PanelSettingsComponent } from './panel/panel-settings.component';
import { panelGuard } from './panel/panel-store.service';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'propiedades', component: PropiedadesPageComponent },
  { path: 'propiedades/:slug', component: PropiedadDetailPageComponent },
  { path: 'nosotros', component: NosotrosPageComponent },
  { path: 'tasaciones', component: TasacionesPageComponent },
  { path: 'contacto', component: ContactoPageComponent },
  { path: 'panel/login', component: PanelLoginComponent },
  {
    path: 'panel',
    canActivate: [panelGuard],
    component: PanelLayoutComponent,
    children: [
      { path: '', component: PanelDashboardComponent },
      { path: 'propiedades', component: PanelPropertyListComponent },
      { path: 'propiedades/nueva', component: PanelPropertyEditComponent },
      { path: 'propiedades/:id', component: PanelPropertyEditComponent },
      { path: 'ajustes', component: PanelSettingsComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
